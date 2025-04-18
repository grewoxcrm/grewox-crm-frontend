import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Divider,
  Upload,
  message,
  Spin,
  DatePicker,
} from "antd";
import {
  FiUser,
  FiMail,

  FiX,
  FiBriefcase,
  FiDollarSign,
  FiMapPin,
  FiChevronDown,
  FiUsers,
  FiUserPlus,
  FiCalendar,
  FiInfo,
} from "react-icons/fi";
import { useCreateDealMutation } from "./services/DealApi";
import { PlusOutlined } from '@ant-design/icons';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import AddPipelineModal from "../crmsystem/pipeline/AddPipelineModal";
import './Deal.scss';
import { useGetSourcesQuery } from '../crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useDispatch, useSelector } from "react-redux";
import { useGetProductsQuery } from "../../sales/product&services/services/productApi";
import dayjs from "dayjs";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useUpdateLeadMutation } from '../lead/services/LeadApi';
import { useGetContactsQuery } from "../contact/services/contactApi";
import { useGetCompanyAccountsQuery } from "../companyacoount/services/companyAccountApi";

import AddContactModal from "./AddContactModal";
import AddCompanyModal from "./AddCompanyModal";
import { useGetAllCountriesQuery, useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
const { Text } = Typography;
const { Option } = Select;

const findIndianDefaults = (currencies, countries) => {
  const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
  const indiaCountry = countries?.find(c => c.countryCode === 'IN');
  return {
    defaultCurrency: inrCurrency?.currencyCode || 'INR',
    defaultPhoneCode: indiaCountry?.phoneCode?.replace('+', '') || '91'
  };
};

const CreateDeal = ({ open, onCancel, leadData }) => {
  const loggedInUser = useSelector(selectCurrentUser);

  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const selectRef = useRef(null);
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [isAddCompanyVisible, setIsAddCompanyVisible] = useState(false);
  const [isAddContactVisible, setIsAddContactVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const [manualValue, setManualValue] = useState(0);
  const [selectedProductPrices, setSelectedProductPrices] = useState({});
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newCompanyName, setNewCompanyName] = useState("");

  const [createDeal, { isLoading: isCreatingDeal }] = useCreateDealMutation();
  const [updateLead, { isLoading: isUpdatingLead }] = useUpdateLeadMutation();

  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: productsData } = useGetProductsQuery();
  const { data: dealStages } = useGetLeadStagesQuery();
  const { data: pipelinesData } = useGetPipelinesQuery();
  const pipelines = pipelinesData || [];
  const sources = sourcesData?.data || [];
  const products = productsData?.data || [];

  const { data: companyAccountsResponse = { data: [] }, isLoading:isCompanyAccountsLoading  } = useGetCompanyAccountsQuery();
  const { data: contactsResponse, isLoading :isContactsLoading, error } = useGetContactsQuery();
  const { data: currencies = [] } = useGetAllCurrenciesQuery({
    page: 1,
    limit: 100
  });
  const { data: countries = [] } = useGetAllCountriesQuery({
    page: 1,
    limit: 100
  });

console.log("companyAccountsResponse",companyAccountsResponse.data);


  const { defaultCurrency, defaultPhoneCode } = findIndianDefaults(currencies, countries);

  // Add state to track selected pipeline
  const [selectedPipeline, setSelectedPipeline] = useState(null);

  // Filter stages based on selected pipeline
  const filteredStages = dealStages?.filter(
    stage => stage.stageType === "deal" && (!selectedPipeline || stage.pipeline === selectedPipeline)
  ) || [];

  // Handle pipeline selection change
  const handlePipelineChange = (value) => {
    setSelectedPipeline(value);

    form.setFieldValue('stage', undefined);
  };

  // Handle manual value change
  const handleValueChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setManualValue(numValue);

    // Calculate total product prices
    const productPricesTotal = Object.values(selectedProductPrices).reduce((sum, price) => sum + price, 0);

    // Set form value to manual value plus product prices
    form.setFieldsValue({ value: numValue + productPricesTotal });
  };

  // Handle products selection change
  const handleProductsChange = (selectedProductIds) => {
    const newSelectedPrices = {};

    // Calculate prices for selected products
    selectedProductIds.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product) {
        newSelectedPrices[productId] = product.price || 0;
      }
    });

    // Update selected product prices
    setSelectedProductPrices(newSelectedPrices);

    // Calculate total of selected product prices
    const productPricesTotal = Object.values(newSelectedPrices).reduce((sum, price) => sum + price, 0);

    // Update form value with manual value plus product prices
    form.setFieldsValue({ value: manualValue + productPricesTotal });
  };

  // Modify the useEffect to remove automatic modal opening
  useEffect(() => {
    if (leadData && open) {
      // Find the country details
      const countryDetails = countries.find(c => c.id === leadData.phoneCode);

      // Find if the company exists in companyAccounts
      const existingCompany = companyAccountsResponse?.data?.find(
        c => c.company_name?.toLowerCase() === leadData.company?.toLowerCase()
      );

console.log("asdasdsa",leadData);

      form.setFieldsValue({
        dealTitle: leadData.leadTitle,
        currency: leadData.currency,
        phoneCode: countryDetails?.phoneCode?.replace('+', ''),
        value: leadData.value,
        source: leadData.source,
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone?.replace(/^\+\d+\s/, ''),
        address: leadData.address,
        company_name: existingCompany?.id || undefined,
        leadId: leadData.id,
        pipeline: leadData.pipeline,
        stage: leadData.stage
      });

      // Set manual value for value field
      setManualValue(leadData.value || 0);

      // Set selected pipeline if lead data has pipeline
      if (leadData.pipeline) {
        setSelectedPipeline(leadData.pipeline);
      }
    }
  }, [leadData, form, open, currencies, countries, companyAccountsResponse?.data]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, form]);

  const handleSubmit = async (values) => {
    try {
      // Format phone number with country code
      const formattedPhone = values.phone ?
        `+${values.phoneCode} ${values.phone}` :
        null;

      const dealData = {
        dealTitle: values.dealTitle,
        email: values.email,
        phone: formattedPhone,
        pipeline: values.pipeline,
        stage: values.stage,
        value: parseFloat(values.value) || 0,
        currency: values.currency,
        closedDate: values.closedDate ? new Date(values.closedDate).toISOString() : null,
        company_name: values.company_name,
        source: values.source,
        products: { products: values.products || [] },
        firstName: values.firstName,
        lastName: values.lastName,
        address: values.address,
        leadId: leadData?.id,

      };


      // Create the deal
      const dealResponse = await createDeal(dealData).unwrap();

      // If this deal was created from a lead, update the lead's is_converted status
      if (leadData?.id) {
        try {
          await updateLead({
            id: leadData.id,
            data: {
              is_converted: true,
              dealId: dealResponse.id
            }
          }).unwrap();
        } catch (updateError) {
          console.error("Error updating lead:", updateError);
          message.warning("Deal created but failed to update lead status. Please refresh the page.");
        }
      }

      // message.success("Deal created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Create Deal Error:", error);

      if (error?.data?.message?.includes("already exists")) {
        message.error("A deal with this title already exists");
        return;
      }

      message.error(error?.data?.message || "Failed to create deal. Please try again.");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  const handleAddPipelineClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setIsAddPipelineVisible(true);
  };

  // Modify handleAddCompanyClick
  const handleAddCompanyClick = (e) => {
    if (e) e.stopPropagation();
    setIsAddCompanyVisible(true);
    // Set the company name from lead data
    setNewCompanyName(leadData?.company || "");
  };

  const handleAddContactClick = (e) => {
    e.stopPropagation();
    setIsAddContactVisible(true);
  };

  // Add these consistent styles from CreateLead
  const formItemStyle = {
    fontSize: "14px",
    fontWeight: "500"
  };

  const inputStyle = {
    height: "48px",
    borderRadius: "10px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e6e8eb",
    transition: "all 0.3s ease"
  };

  const prefixIconStyle = {
    color: "#1890ff",
    fontSize: "16px",
    marginRight: "8px"
  };

  const selectStyle = {
    width: '100%',
    height: '48px',
  };

  // Add multiSelectStyle for multiple select components
  const multiSelectStyle = {
    ...selectStyle,
    '& .ant-select-selector': {
      minHeight: '48px !important',
      height: 'auto !important',
      padding: '4px 12px !important',
      backgroundColor: '#f8fafc !important',
      border: '1px solid #e6e8eb !important',
      borderRadius: '10px !important',
    },
    '& .ant-select-selection-item': {
      height: '32px',
      lineHeight: '30px !important',
      borderRadius: '6px',
      background: '#E5E7EB',
      border: 'none',
      margin: '4px',
    }
  };

  const handleCompanyChange = (companyId) => {
    console.log("Selected Company ID:", companyId);
    
    // Set the company_name field with the selected company ID
    form.setFieldsValue({
      company_name: companyId,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      address: undefined
    });
    
  };

  const handleFirstNameChange = (contactId) => {
    // Find the selected contact from all contacts
    const contact = contactsResponse?.data?.find(c => c.id === contactId);
    if (contact) {
      // Get current form values
      const currentValues = form.getFieldsValue();
      
      // Set the form values including company if it exists
      form.setFieldsValue({
        firstName: contact.id, // Set contact ID for form submission
        lastName: contact.last_name, // Set actual last name for display
        email: contact.email,
        phone: contact.phone?.replace(/^\+\+91\s/, ''),
        address: contact.address,
        // Only update company_name if it's not already set
        company_name: currentValues.company_name || contact.company_name
      });
      setSelectedContact(contact);
    }
  };

  const handleClearCompany = () => {
    form.setFieldsValue({
      company_name: undefined,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      address: undefined
    });
    setFilteredContacts([]); // Reset filtered contacts to show all contacts
    setSelectedContact(null);
  };

  const handleClearContact = () => {
    form.setFieldsValue({
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      address: undefined
    });
    setSelectedContact(null);
  };

  // Add this function to handle company creation success
  const handleCompanyCreationSuccess = (newCompany) => {
    setIsAddCompanyVisible(false);
    form.setFieldsValue({
      company_name: newCompany.id,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      address: undefined
    });
    message.success('Company added successfully');
    setNewCompanyName(""); // Reset the new company name
  };

  return (
    <>
      <Modal
        title={null}
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose={true}
        centered
        closeIcon={null}
        className="pro-modal custom-modal deal-form-modal"
        maskClosable={false}
        style={{
          "--antd-arrow-background-color": "#ffffff",
        }}
        styles={{
          body: {
            padding: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
          },
          content: {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <div
          className="modal-header"
          style={{
            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            padding: "24px",
            color: "#ffffff",
            position: "relative",
          }}
        >
          <Button
            type="text"
            icon={<FiX />}
            onClick={handleCancel}
            style={{
              color: "#ffffff",
              position: "absolute",
              right: "24px",
              top: "24px",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiDollarSign style={{ fontSize: "24px", color: "#ffffff" }} />
            </div>
            <div>
              <h2
                style={{
                  margin: "0",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                Create New Deal
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Fill in the information to create deal
              </Text>
            </div>
          </div>
        </div>

        <Spin spinning={isCreatingDeal || isUpdatingLead}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="deal-form custom-form"
            style={{ padding: "24px" }}
          >
            {/* Deal Details Section */}
            <div className="section-title" style={{ marginBottom: '16px' }}>
              <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Deal Details</Text>
            </div>

            <div className="form-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              // marginBottom: '32px'
            }}>
              <Form.Item
                name="dealTitle"
                label={<span style={formItemStyle}>Deal Title</span>}
                rules={[
                  { required: true, message: "Please enter deal title" },
                  { min: 3, message: "Deal title must be at least 3 characters" },
                ]}
              >
                <Input
                  prefix={<FiUser style={prefixIconStyle} />}
                  placeholder="Enter deal title"
                  style={inputStyle}
                />
              </Form.Item>

              <Form.Item
                name="value"
                label={<span style={formItemStyle}>Deal Value</span>}
                className="combined-input-item"
              >
                <Input.Group compact className="value-input-group">
                  <Form.Item
                    name="currency"
                    noStyle
                    initialValue={defaultCurrency}
                    rules={[{ required: true, message: "Please select currency" }]}
                  >
                    <Select
                      style={{ width: '90px' }}
                      className="currency-select"
                      dropdownMatchSelectWidth={false}
                      suffixIcon={<FiChevronDown size={14} />}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => {
                        const currencyData = currencies.find(c => c.currencyCode === option.value);
                        return (
                          currencyData?.currencyName?.toLowerCase().includes(input.toLowerCase()) ||
                          currencyData?.currencyCode?.toLowerCase().includes(input.toLowerCase())
                        );
                      }}
                      dropdownStyle={{ minWidth: '180px' }}
                      popupClassName="custom-select-dropdown"
                    >
                      {currencies?.map((currency) => (
                        <Option key={currency.id} value={currency.currencyCode}>
                          <div className="currency-option">
                            <span className="currency-icon">{currency.currencyIcon}</span>
                            <div className="currency-details">
                              <span className="currency-code">{currency.currencyCode}</span>
                              <span className="currency-name">{currency.currencyName}</span>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="value"
                    noStyle
                    rules={[{ required: true, message: "Please enter deal value" }]}
                  >
                    <Input
                      style={{ width: 'calc(100% - 120px)' }}
                      placeholder="Enter amount"
                      type="number"
                      onChange={(e) => handleValueChange(e.target.value)}
                    />
                  </Form.Item>
                </Input.Group>
              </Form.Item>

              <Form.Item
                name="pipeline"
                label={<span style={formItemStyle}>Pipeline</span>}
                rules={[{ required: true, message: "Please select a pipeline" }]}
              >
                <Select
                  ref={selectRef}
                  open={dropdownOpen}
                  onDropdownVisibleChange={setDropdownOpen}
                  placeholder="Select pipeline"
                  onChange={handlePipelineChange}
                  style={selectStyle}
                  suffixIcon={<FiChevronDown size={14} />}
                  dropdownRender={(menu) => (
                    <div onClick={(e) => e.stopPropagation()}>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <div
                        style={{
                          padding: '8px 12px',
                          display: 'flex',
                          justifyContent: 'center'
                        }}
                      >
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddPipelineClick}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            height: '40px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
                            fontWeight: '500',
                          }}
                        >
                          Add Pipeline
                        </Button>
                      </div>
                    </div>
                  )}
                  popupClassName="custom-select-dropdown"
                >
                  {pipelines.map((pipeline) => (
                    <Option key={pipeline.id} value={pipeline.id}>
                      {pipeline.pipeline_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="stage"
                label={<span style={formItemStyle}>Stage</span>}
                rules={[{ required: true, message: "Please select a stage" }]}
              >
                <Select
                  placeholder={selectedPipeline ? "Select stage" : "Select pipeline first"}
                  disabled={!selectedPipeline}
                  style={selectStyle}
                  suffixIcon={<FiChevronDown size={14} />}
                  popupClassName="custom-select-dropdown"
                  listHeight={100}
                  dropdownStyle={{
                    maxHeight: '100px',                  
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollBehavior: 'smooth'
                  }}
                >
                  {filteredStages.map((stage) => (
                    <Option key={stage.id} value={stage.id}>
                      {stage.stageName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="closedDate"
                label={<span style={formItemStyle}>Expected Close Date</span>}
                rules={[{ required: true, message: "Please select expected close date" }]}
              >
                <DatePicker
                  size="large"
                  format="DD-MM-YYYY"
                  style={{
                    width: '100%',
                    borderRadius: "10px",
                    height: "48px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e6e8eb",
                  }}
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                  placeholder="Select date"
                  suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
                  superNextIcon={null}
                  superPrevIcon={null}
                />
              </Form.Item>

              <Form.Item
                name="source"
                label={<span style={formItemStyle}>Source</span>}
                rules={[{ required: true, message: "Please select source" }]}
              >
                <Select
                  placeholder="Select source"
                  style={selectStyle}
                  popupClassName="custom-select-dropdown"
                  listHeight={100} // Sets height to show 2 items
                  dropdownStyle={{
                    maxHeight: '100px',                  
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollBehavior: 'smooth'
                  }}
                >
                  {sources.map((source) => (
                    <Option key={source.id} value={source.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: source.color || '#1890ff'
                          }}
                        />
                        {source.name}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              </div>

              <Form.Item
                name="products"
                label={<Text style={formItemStyle}>Products</Text>}
                rules={[{ required: false, message: 'Please select products' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select products"
                  style={selectStyle}
                  optionFilterProp="children"
                  showSearch
                  onChange={handleProductsChange}
                  listHeight={100}
                  dropdownStyle={{
                    maxHeight: '100px',                  
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollBehavior: 'smooth'
                  }}
                >
                  {products?.map((product) => (
                    <Option key={product.id} value={product.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          // height: '40px',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '500' }}>{product.name}</span>
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>{product.selling_price}</span>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            

            {/* Contact Information Section */}
            <div className="section-title" style={{ marginBottom: '16px',marginTop:'32px' }}>
              <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Basic Information</Text>
            </div>

            <div className="form-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '32px'
            }}>
                 <Form.Item
                name="company_name"
                label={<span style={formItemStyle}>Company Name</span>}
              >
                <div style={{ position: 'relative' }}>
                  <Select
                    placeholder="Select company"
                    onChange={handleCompanyChange}
                    style={selectStyle}
                    allowClear
                    suffixIcon={<FiBriefcase style={prefixIconStyle} />}
                    dropdownRender={(menu) => (
                      <div onClick={(e) => e.stopPropagation()}>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <div
                          style={{
                            padding: '8px 12px',
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddCompanyClick}
                            style={{
                              width: '100%',
                              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                              border: 'none',
                              height: '40px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
                              fontWeight: '500',
                            }}
                          >
                            Add Company
                          </Button>
                        </div>
                      </div>
                    )}
                  >
                    {companyAccountsResponse?.data?.map((company) => (
                      <Option key={company.id} value={company.id}>
                        {company.company_name}
                      </Option>
                    ))}
                  </Select>
                  {form.getFieldValue('company_name') && (
                    <Button
                      type="text"
                      icon={<FiX />}
                      onClick={handleClearCompany}
                      style={{
                        position: 'absolute',
                        right: '40px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                        padding: '4px',
                        height: 'auto',
                        color: '#6B7280'
                      }}
                    />
                  )}
                </div>
              </Form.Item>
              <Form.Item
                name="firstName"
                label={<span style={formItemStyle}>First Name</span>}
              >
                <div style={{ position: 'relative' }}>
                  <Select
                    placeholder="Select contact"
                    onChange={handleFirstNameChange}
                    style={selectStyle}
                    suffixIcon={<FiUser style={prefixIconStyle} />}
                    showSearch
                    allowClear
                    filterOption={(input, option) => {
                      const contact = contactsResponse?.data?.find(c => c.id === option.value);
                      return contact?.first_name?.toLowerCase().includes(input.toLowerCase());
                    }}
                    dropdownRender={(menu) => (
                      <div onClick={(e) => e.stopPropagation()}>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <div
                          style={{
                            padding: '8px 12px',
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddContactClick}
                            style={{
                              width: '100%',
                              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                              border: 'none',
                              height: '40px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
                              fontWeight: '500',
                            }}
                          >
                            Add Contact
                          </Button>
                        </div>
                      </div>
                    )}
                  >
                    {contactsResponse?.data?.map((contact) => (
                      <Option key={contact.id} value={contact.id}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{contact.first_name}</span>
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>
                            {companyAccountsResponse?.data?.find(c => c.id === contact.company_name)?.company_name || 'No Company'}
                          </span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                  {form.getFieldValue('firstName') && (
                    <Button
                      type="text"
                      icon={<FiX />}
                      onClick={handleClearContact}
                      style={{
                        position: 'absolute',
                        right: '40px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                        padding: '4px',
                        height: 'auto',
                        color: '#6B7280'
                      }}
                    />
                  )}
                </div>
              </Form.Item>

              <Form.Item
                name="lastName"
                label={<span style={formItemStyle}>Last Name</span>}
              >
                <Input
                  prefix={<FiUser style={prefixIconStyle} />}
                  placeholder="Last name will auto-fill"
                  style={{
                    ...inputStyle,
                    backgroundColor: '#f8fafc'
                  }}
                  readOnly
                  value={selectedContact?.last_name || ''}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span style={formItemStyle}>Email</span>}
                rules={[
                  {
                    type: 'email',
                    message: 'Please enter a valid email address',
                  },
                ]}
              >
                <Input
                  prefix={<FiMail style={prefixIconStyle} />}
                  placeholder="Enter email address"
                  style={{
                    ...inputStyle,
                    backgroundColor: '#f8fafc'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="phoneGroup"
                label={<span style={formItemStyle}>Phone Number</span>}
                className="combined-input-item"
              >
                <Input.Group compact className="phone-input-group">
                  <Form.Item
                    name="phoneCode"
                    noStyle
                    initialValue={defaultPhoneCode}
                  >
                    <Select
                      style={{ width: '90px' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      optionFilterProp="children"
                      className="phone-code-select"
                      suffixIcon={<FiChevronDown size={14} />}
                      filterOption={(input, option) => {
                        const countryData = countries.find(c => c.phoneCode.replace('+', '') === option.value);
                        return (
                          countryData?.countryName?.toLowerCase().includes(input.toLowerCase()) ||
                          countryData?.countryCode?.toLowerCase().includes(input.toLowerCase()) ||
                          countryData?.phoneCode?.includes(input)
                        );
                      }}
                      dropdownStyle={{ minWidth: '200px' }}
                      popupClassName="custom-select-dropdown"
                    >
                      {countries?.map((country) => (
                        <Option key={country.id} value={country.phoneCode.replace('+', '')}>
                          <div className="phone-code-option">
                            <div className="phone-code-main">
                              <span className="phone-code">+{country.phoneCode.replace('+', '')}</span>
                              <span className="country-code">{country.countryCode}</span>
                            </div>
                            <span className="country-name">{country.countryName}</span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    noStyle
                  >
                    <Input
                      style={{
                        width: 'calc(100% - 120px)',
                        backgroundColor: '#f8fafc'
                      }}
                      placeholder="Enter phone number"
                      // prefix={<FiPhone style={{ color: "#1890ff", fontSize: "16px" }} />}
                    />
                  </Form.Item>
                </Input.Group>
              </Form.Item>

           

              <Form.Item
                name="address"
                label={<span style={formItemStyle}>Address</span>}
              >
                <Input
                  prefix={<FiMapPin style={prefixIconStyle} />}
                  placeholder="Enter address"
                  style={{
                    ...inputStyle,
                    backgroundColor: '#f8fafc'
                  }}
                />
              </Form.Item>
            </div>

            <Divider style={{ margin: "24px 0" }} />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <Button
                onClick={handleCancel}
                size="large"
                style={{
                  padding: "8px 24px",
                  height: "44px",
                  borderRadius: "10px",
                  border: "1px solid #e6e8eb",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreatingDeal || isUpdatingLead}
                size="large"
                style={{
                  padding: "8px 24px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  border: "none",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Create Deal
              </Button>
            </div>
          </Form>
        </Spin>
      </Modal>

      <AddPipelineModal
        isOpen={isAddPipelineVisible}
        onClose={() => setIsAddPipelineVisible(false)}
      />

      <AddCompanyModal
        open={isAddCompanyVisible}
        onCancel={() => setIsAddCompanyVisible(false)}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
        onSuccess={handleCompanyCreationSuccess}
        initialCompanyName={newCompanyName}
      />

      <AddContactModal
        open={isAddContactVisible}
        onCancel={() => setIsAddContactVisible(false)}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
        onsubmit={handleAddContactClick}
      />

      <style jsx global>{`
      .deal-form-modal {
        .currency-select, .phone-code-select {
          cursor: pointer;
          .ant-select-selector {
            padding: 8px 8px !important;
            height: 48px !important;
          }
          
          .ant-select-selection-search {
            input {
              height: 100% !important;
            }
          }

          .ant-select-selection-item {
            padding-right: 20px !important;
            font-weight: 500 !important;
          }

          .ant-select-selection-placeholder {
            color: #9CA3AF !important;
          }
        }

        .currency-select .ant-select-selector {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
          border: none !important;
          
          .ant-select-selection-item {
            color: white !important;
          }
        }

        .ant-select-dropdown {
          padding: 8px !important;
          border-radius: 10px !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;

          .ant-select-item {
            padding: 8px 12px !important;
            border-radius: 6px !important;
            min-height: 32px !important;
            display: flex !important;
            align-items: center !important;
            color: #1f2937 !important;

            &-option-selected {
              background-color: #E6F4FF !important;
              font-weight: 500 !important;
              color: #1890ff !important;
            }

            &-option-active {
              background-color: #F3F4F6 !important;
            }
          }

          .ant-select-item-option-content {
            font-size: 14px !important;
          }

          .ant-select-item-empty {
            color: #9CA3AF !important;
          }
        }

        .value-input-group, .phone-input-group {
          display: flex !important;
          align-items: stretch !important;

          .ant-select {
            .ant-select-selector {
              height: 100% !important;
              border-top-right-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
            }
          }

          .ant-input {
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
          }
        }

        .ant-select:not(.ant-select-customize-input) .ant-select-selector {
          background-color: #f8fafc !important;
          border: 1px solid #e6e8eb !important;
          border-radius: 10px !important;
          min-height: 48px !important;
          padding: 8px!important;
          display: flex !important;
          align-items: center !important;
        }

        .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
        }

        .ant-select-single .ant-select-selector .ant-select-selection-item,
        .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
          line-height: 32px !important;
          height: 32px !important;
          transition: all 0.3s !important;
          display: flex !important;
          align-items: center !important;
        }

        /* Add styles for multiple select (team members) */
        .ant-select-multiple {
          .ant-select-selector {
            min-height: 48px !important;
            height: auto !important;
            padding: 4px 8px !important;
            background-color: #f8fafc !important;
            border: 1px solid #e6e8eb !important;
            border-radius: 10px !important;
            display: flex !important;
            align-items: flex-start !important;
            // flex-wrap: wrap !important;
          }

          .ant-select-selection-item {
            height: 32px !important;
            line-height: 30px !important;
            background: #f0f7ff !important;
            border: 1px solid #91caff !important;
            border-radius: 6px !important;
            color: #0958d9 !important;
            font-size: 13px !important;
            margin: 4px !important;
            padding: 0 8px !important;
            display: flex !important;
            align-items: center !important;
          }

          .ant-select-selection-search {
            margin: 4px !important;
          }

          .ant-select-selection-placeholder {
            padding: 8px !important;
          }
        }

        /* Team member option styling */
        .team-member-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          
          .member-name {
            font-weight: 500;
            color: #1f2937;
          }
          
          .member-role {
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: capitalize;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .role-indicator {
          animation: pulse 2s infinite;
        }

        /* Add these new styles for product selection */
        .ant-select-multiple {
          .ant-select-selection-item {
            height: auto !important;
            background: #f0f7ff !important;
            border: 1px solid #91caff !important;
            border-radius: 8px !important;
            margin: 4px !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;

            /* Product image container */
            .ant-select-selection-item-content > div {
              display: flex !important;
              align-items: center !important;
              gap: 12px !important;
            }

            /* Product details container */
            .ant-select-selection-item-content > div > div:last-child {
              display: flex !important;
              flex-direction: column !important;
              gap: 2px !important;
            }

            /* Product name */
            .ant-select-selection-item-content span:first-child {
              color: #1f2937 !important;
              font-weight: 500 !important;
              font-size: 14px !important;
              line-height: 1.4 !important;
            }

            /* Product price */
            .ant-select-selection-item-content span:last-child {
              color: #6B7280 !important;
              font-size: 12px !important;
              line-height: 1.2 !important;
            }

            /* Product image */
            img {
              width: 32px !important;
              height: 32px !important;
              border-radius: 4px !important;
              object-fit: cover !important;
            }

            /* Remove button */
            .ant-select-selection-item-remove {
              color: #6B7280 !important;
              font-size: 14px !important;
              margin-left: auto !important;
              padding: 4px !important;
              border-radius: 4px !important;
              
              &:hover {
                background-color: #EEF2FF !important;
                color: #4B5563 !important;
              }
            }
          }

          /* Adjust the selector height when items are selected */
          .ant-select-selector {
            height: auto !important;
            min-height: 48px !important;
            padding: 4px 8px !important;
          }

          /* Style for the search input */
          .ant-select-selection-search {
            margin: 4px !important;
            padding: 4px !important;
          }
        }

        /* Dropdown styles for product options */
        .ant-select-dropdown {
          .ant-select-item-option-content {
            > div {
              padding: 8px 0 !important;
            }

            /* Product option container */
            div[style*="display: flex"] {
              gap: 12px !important;
            }

            /* Product image in dropdown */
            div[style*="width: 32px"] {
              flex-shrink: 0 !important;
            }

            /* Product details in dropdown */
            div[style*="flex-direction: column"] {
              flex-grow: 1 !important;
              
              span:first-child {
                color: #1f2937 !important;
                font-weight: 500 !important;
                margin-bottom: 2px !important;
              }
              
              span:last-child {
                color: #6B7280 !important;
                font-size: 12px !important;
              }
            }
          }

          .ant-select-item-option-selected {
            .ant-select-item-option-content {
              > div {
                background-color: #f0f7ff !important;
              }
            }
          }
        }
      }
    `}</style>
    </>
  );
};

export default CreateDeal;
