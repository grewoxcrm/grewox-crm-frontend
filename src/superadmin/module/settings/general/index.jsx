import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Typography, Card, Space, Row, Col, Modal, message } from 'antd';
import { 
  UploadOutlined, 
  HomeOutlined, 
  SaveOutlined,
  CloudUploadOutlined,
  GlobalOutlined,
  BuildOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useCreateSettingMutation, useGetAllSettingsQuery, useDeleteSettingMutation } from './services/settingApi';
import { applySiteSettings } from '../../../../utils/siteSettings';
import './general.scss';

const { Title } = Typography;

const GeneralSettings = () => {
  const [form] = Form.useForm();
  const [termsContent, setTermsContent] = useState('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedFavicon, setSelectedFavicon] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: settingsData, isLoading: isLoadingSettings, refetch: refetchSettings } = useGetAllSettingsQuery();
  const [createSetting] = useCreateSettingMutation();
  const [deleteSetting] = useDeleteSettingMutation();

  // Initialize form with termsContent
  useEffect(() => {
    form.setFieldsValue({ termsandconditions: termsContent });
  }, [termsContent, form]);

  // Load existing settings if available
  useEffect(() => {
    if (settingsData?.success && settingsData?.data && settingsData.data.length > 0) {
      const existingSettings = settingsData.data[0];
      console.log('Settings data:', existingSettings);
      setSavedData(existingSettings);
      setIsViewMode(true);
      
      // Set form values
      form.setFieldsValue({
        companyName: existingSettings.companyName,
        title: existingSettings.title,
        termsandconditions: existingSettings.termsandconditions,
        merchant_name: existingSettings.merchant_name,
        merchant_upi_id: existingSettings.merchant_upi_id
      });
      
      setTermsContent(existingSettings.termsandconditions || '');
      
      // Apply site settings
      applySiteSettings({
        favicon: existingSettings.favicon,
        title: existingSettings.title,
        companyName: existingSettings.companyName
      });
    }
  }, [settingsData, form]);

  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  const uploadProps = {
    beforeUpload: (file) => {
      return false;
    },
    maxCount: 1,
  };

  const showPreview = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        termsContent,
      };
      setSavedData(formData);
      setIsViewMode(true);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate form fields
      const values = await form.validateFields();
      
      // Check if required files are present
      if (!selectedLogo) {
        message.error('Company logo is required');
        return;
      }
      
      if (!selectedFavicon) {
        message.error('Favicon is required');
        return;
      }
      
      // Create FormData object for file uploads
      const formData = new FormData();
      
      // Add required fields with exact field names matching backend
      formData.append('companyName', values.companyName);
      formData.append('title', values.title);
      // Ensure termsandconditions is never empty by providing a default value
      formData.append('termsandconditions', values.termsandconditions || 'No terms and conditions provided');
      // Add merchant fields
      formData.append('merchant_name', values.merchant_name || '');
      formData.append('merchant_upi_id', values.merchant_upi_id || '');
      
      // Add files
      formData.append('companylogo', selectedLogo);
      formData.append('favicon', selectedFavicon);

      // Log the FormData contents for debugging
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      // Create a plain object to show the payload structure
      const payloadObject = {
        companyName: values.companyName,
        title: values.title,
        termsandconditions: values.termsandconditions,
        merchant_name: values.merchant_name,
        merchant_upi_id: values.merchant_upi_id,
        companylogo: selectedLogo ? selectedLogo.name : null,
        favicon: selectedFavicon ? selectedFavicon.name : null
      };
      
      console.log('Payload object:', payloadObject);

      // Call the API with the FormData
      const response = await createSetting(formData).unwrap();
      
      if (response.success) {
        // Update the saved data with the response
        const updatedSettings = {
          ...values,
          companylogo: response.data?.companylogo,
          favicon: response.data?.favicon
        };
        setSavedData(updatedSettings);
        setIsViewMode(true);
        message.success('Settings saved successfully!');
        
        // Apply site settings with the updated data
        applySiteSettings({
          favicon: response.data?.favicon,
          title: values.title,
          companyName: values.companyName
        });
        
        // Refetch settings to update the UI
        refetchSettings();
      } else {
        message.error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error(error?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!savedData || !savedData.id) {
      message.error('No settings found to delete');
      return;
    }
    
    Modal.confirm({
      title: 'Are you sure you want to delete these settings?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk: async () => {
        try {
          setLoading(true);
          // Log the ID for debugging
          console.log('Deleting settings with ID:', savedData.id);
          const response = await deleteSetting(savedData.id).unwrap();
          
          if (response.success) {
            setSavedData(null);
            setIsViewMode(false);
            form.resetFields();
            setTermsContent('');
            message.success('Settings deleted successfully!');
            refetchSettings();
          } else {
            message.error(response.message || 'Failed to delete settings');
          }
        } catch (error) {
          console.error('Error deleting settings:', error);
          message.error(error?.data?.message || 'Failed to delete settings');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleFileChange = (info, type) => {
    const file = info.file;
    if (file) {
      if (type === 'logo') {
        setSelectedLogo(file);
      } else if (type === 'favicon') {
        setSelectedFavicon(file);
      }
      message.success(`${file.name} selected successfully`);
    }
  };

  const ViewPage = () => (
    <div className="view-page">
      <div className="view-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Current Settings</h1>
            <p>View your general settings configuration</p>
          </div>
          <div className="header-actions">
            <Button 
              icon={<DeleteOutlined />} 
              onClick={handleDelete}
              danger
              className="delete-button"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="view-content">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Company Information" className="view-card">
              <Row gutter={[24, 24]}>
                <Col span={24} lg={8}>
                  <div className="view-item">
                    <h4 style={{ marginBottom: '10px' }}>Company Logo</h4>
                    {savedData?.companylogo ? (
                      <div className="logo-container">
                        <img 
                          src={savedData.companylogo} 
                          alt="Company Logo" 
                          className="fixed-size-logo"
                          style={{ 
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            padding: '10px',
                            backgroundColor: '#fff'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="no-image">No logo uploaded</div>
                    )}
                  </div>
                </Col>
                <Col span={24} lg={16}>
                  <div className="view-item">
                    <h4 style={{ marginBottom: '10px' }}>Terms & Conditions</h4>
                    <div className="terms-content">
                      {savedData?.termsandconditions?.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
       
        </Row>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      {isLoadingSettings ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : isViewMode ? (
        <ViewPage />
      ) : (
        <>
          <div className="nav-container">
            <div className="nav-breadcrumb">
              <Link to="/" className="nav-link">
                <HomeOutlined /> Home
              </Link>
              <span className="separator">/</span>
              <Link to="/settings" className="nav-link">Settings</Link>
              <span className="separator">/</span>
              <span className="current">General</span>
            </div>
          </div>

          <div className="header-section">
            <div className="header-content">
              <div className="header-info">
                <h1>General Settings</h1>
                <p>Manage your organization's general configuration and branding</p>
              </div>
            </div>
          </div>

          <div className="main-content">
            <div className="content-grid">
              {/* Company Info Card */}
              <Card className="settings-card company-info">
                <div className="card-header">
                  <BuildOutlined className="section-icon" />
                  <Title level={5}>Company Information</Title>
                </div>
                <Form
                  form={form}
                  layout="vertical"
                  className="settings-form"
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Company Name"
                        name="companyName"
                        rules={[{ required: true, message: 'Please enter company name' }]}
                      >
                        <Input placeholder="Enter your company name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Site Title"
                        name="title"
                        rules={[{ required: true, message: 'Please enter site title' }]}
                      >
                        <Input placeholder="Enter your site title" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

             

              {/* Brand Assets Card */}
              <Card className="settings-card brand-assets">
                <div className="card-header">
                  <GlobalOutlined className="section-icon" />
                  <Title level={5}>Brand Assets</Title>
                </div>
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <div className="upload-section">
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ 
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: 500,
                          color: '#1f2937'
                        }}>
                          Company Logo
                        </label>
                        <div >
                           <Form.Item
                        // label="Company Logo"
                        name="companylogo"
                        rules={[{ required: true, message: 'Please upload company logo' }]}
                      >
                        <Upload.Dragger 
                          {...uploadProps} 
                          className="upload-area"
                          beforeUpload={(file) => {
                            handleFileChange({ file }, 'logo');
                            return false;
                          }}
                        >
                          <div className="upload-content">
                            <CloudUploadOutlined className="upload-icon" />
                            <p className="upload-title">Upload Logo</p>
                            <p className="upload-hint">PNG, JPG up to 2MB</p>
                          </div>
                        </Upload.Dragger>
                      </Form.Item>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="upload-section">
                    <label style={{ 
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: 500,
                          color: '#1f2937'
                        }}>
                          Favicon
                        </label>
                      <Form.Item
                        name="favicon"
                        rules={[{ required: true, message: 'Please upload favicon' }]}
                      >
                        <Upload.Dragger 
                          {...uploadProps} 
                          className="upload-area"
                          beforeUpload={(file) => {
                            handleFileChange({ file }, 'favicon');
                            return false;
                          }}
                        >
                          <div className="upload-content">
                            <CloudUploadOutlined className="upload-icon" />
                            <p className="upload-title">Upload Favicon</p>
                            <p className="upload-hint">ICO, PNG up to 1MB</p>
                          </div>
                        </Upload.Dragger>
                      </Form.Item>
                    </div>
                  </Col>
                </Row>
              </Card>

               {/* Payment Information Card */}
               <Card className="settings-card payment-info">
                <div className="card-header">
                  <GlobalOutlined className="section-icon" />
                  <Title level={5}>Payment Information</Title>
                </div>
                <Form
                  form={form}
                  layout="vertical"
                  className="settings-form"
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Merchant Name"
                        name="merchant_name"
                      >
                        <Input placeholder="Enter merchant name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Merchant UPI ID"
                        name="merchant_upi_id"
                      >
                        <Input placeholder="Enter merchant UPI ID" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              {/* Terms Card */}
              <Card className="settings-card terms-section">
                <div className="card-header">
                  <UploadOutlined className="section-icon" />
                  <Title level={5}>Terms & Conditions</Title>
                </div>
                <div className="editor-container">
                  <Form.Item
                    name="termsandconditions"
                    className="terms-form-item"
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder="Enter your terms and conditions here..."
                      className="terms-textarea"
                      value={termsContent}
                      onChange={(e) => {
                        setTermsContent(e.target.value);
                        form.setFieldsValue({ termsandconditions: e.target.value });
                      }}
                    />
                  </Form.Item>
                </div>
              </Card>

              {/* Save Button Section */}
              <div className="save-button-section">
                <Button 
                  type="primary"
                  icon={<SaveOutlined />}
                  className="save-button"
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GeneralSettings;
