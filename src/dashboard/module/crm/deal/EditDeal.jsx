import React, { useState, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Divider,
  DatePicker,
  message,
} from "antd";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiX,
  FiBriefcase,
  FiHash,
  FiDollarSign,
  FiMapPin,
  FiChevronDown,
  FiCalendar,
  FiGlobe,
  FiUsers,
  FiTag,
  FiShield,
  FiUserPlus,
  FiBox,
} from "react-icons/fi";
import { useUpdateDealMutation, useGetDealsQuery } from "./services/DealApi";
import { useGetAllCurrenciesQuery, useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import './Deal.scss';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import AddPipelineModal from "../crmsystem/pipeline/AddPipelineModal";
import { PlusOutlined } from '@ant-design/icons';
import { useGetUsersQuery } from "../../user-management/users/services/userApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useGetRolesQuery } from "../../hrm/role/services/roleApi";
import CreateUser from '../../user-management/users/CreateUser';
import { useGetLabelsQuery, useGetSourcesQuery } from "../crmsystem/souce/services/SourceApi";
import { useGetProductsQuery } from '../../sales/product&services/services/productApi';


// import { useGetAllUsersQuery } from "../../../module/user/services/userApi";
dayjs.extend(customParseFormat);

const { Text } = Typography;
const { Option } = Select;

const EditDeal = ({ open, onCancel, initialValues, pipelines, dealStages }) => {
  const [form] = Form.useForm();
  const [updateDeal, { isLoading }] = useUpdateDealMutation();
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
  const { refetch } = useGetDealsQuery();
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const [manualValue, setManualValue] = useState(0);
  const [selectedProductPrices, setSelectedProductPrices] = useState({});

  const { data: currencies = [] } = useGetAllCurrenciesQuery({
    page: 1,
    limit: 100
  });
  const { data: countries = [] } = useGetAllCountriesQuery({
    page: 1,
    limit: 100
  });

  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const loggedInUser = useSelector(selectCurrentUser);

  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const selectRef = useRef(null);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: labelsData } = useGetLabelsQuery(loggedInUser?.id);
  const { data: productsData } = useGetProductsQuery();


  const sources = sourcesData?.data || [];
  const labels = labelsData?.data || [];
  const products = productsData?.data || [];

  // Get pipeline name by ID
  const getPipelineName = (pipelineId) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    return pipeline ? pipeline.pipeline_name : '';
  };

  // Get stage name by ID
  const getStageName = (stageId) => {
    const stage = dealStages.find(s => s.id === stageId);
    return stage ? stage.stageName : '';
  };

  // Filter stages by pipeline and type
  const filteredStages = dealStages.filter(
    stage => stage.stageType === "deal" && stage.pipeline === selectedPipeline
  );

  // const { data: users = [] } = useGetAllUsersQuery({
  //   page: 1,
  //   limit: 100,
  // });
  const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

  

  // Filter users to get team members (excluding subclients)
  const users = usersResponse?.data?.filter(user =>
    user?.created_by === loggedInUser?.username &&
    user?.role_id !== subclientRoleId
  ) || [];

  const handlePipelineChange = (value) => {
    setSelectedPipeline(value);
    form.setFieldValue('stage', undefined);
  };

  const handleCreateUser = () => {
    setIsCreateUserVisible(true);
  };


  const handleCreateUserSuccess = (newUser) => {
    setIsCreateUserVisible(false);
    // Add the newly created user to the selected team members
    const currentMembers = form.getFieldValue('deal_members') || [];
    form.setFieldValue('deal_members', [...currentMembers, newUser.id]);
  };

  React.useEffect(() => {
    if (initialValues) {
      // Parse assigned_to if it's a string
      let assignedTo = initialValues.assigned_to;
      if (typeof assignedTo === 'string') {
        try {
          assignedTo = JSON.parse(assignedTo);
        } catch (e) {
          assignedTo = { assigned_to: [] };
        }
      }

      // Parse products if it's a string
      let selectedProducts = [];
      if (typeof initialValues.products === 'string') {
        try {
          const parsedProducts = JSON.parse(initialValues.products);
          selectedProducts = parsedProducts.products || [];
        } catch (e) {
          selectedProducts = [];
        }
      }

      // Parse phone number to separate code and number
      let phoneCode = '91';
      let phoneNumber = '';
      if (initialValues.phone) {
        const phoneMatch = initialValues.phone.match(/\+(\d{1,3})\s*(.+)/);
        if (phoneMatch) {
          phoneCode = phoneMatch[1];
          phoneNumber = phoneMatch[2];
        }
      }

      // Parse the closed date
      const closedDate = initialValues.closedDate ? 
        dayjs(initialValues.closedDate) : 
        null;

      const formValues = {
        leadTitle: initialValues.dealTitle,
        dealName: `${initialValues.firstName} ${initialValues.lastName}`,
        email: initialValues.email,
        phoneCode: phoneCode,
        phone: phoneNumber,
        currency: initialValues.currency || 'INR',
        value: initialValues.value || 0,
        pipeline: initialValues.pipeline,
        stage: initialValues.stage,
        company: initialValues.company_name,
        website: initialValues.website,
        address: initialValues.address,
        source: initialValues.source,
        label: initialValues.label,
        products: selectedProducts,
        closedDate: closedDate,
        status: initialValues.status || 'pending',
        assigned_to: assignedTo?.assigned_to || [],
        is_won: initialValues.is_won
      };

      // Set the selected pipeline for stage filtering
      setSelectedPipeline(initialValues.pipeline);
      
      // Calculate product prices if needed
      const initialProductPrices = {};
      selectedProducts.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product) {
          initialProductPrices[productId] = product.price || 0;
        }
      });
      setSelectedProductPrices(initialProductPrices);

      // Set form values
      form.setFieldsValue(formValues);
    }
  }, [initialValues, form, products]);

  const getRoleColor = (role) => {
    const roleColors = {
      'employee': {
        color: '#D46B08',
        bg: '#FFF7E6',
        border: '#FFD591'
      },
      'admin': {
        color: '#096DD9',
        bg: '#E6F7FF',
        border: '#91D5FF'
      },
      'manager': {
        color: '#08979C',
        bg: '#E6FFFB',
        border: '#87E8DE'
      },
      'default': {
        color: '#531CAD',
        bg: '#F9F0FF',
        border: '#D3ADF7'
      }
    };
    return roleColors[role?.toLowerCase()] || roleColors.default;
  };

  const handleSubmit = async (values) => {
    try {
      // Format phone number
      const formattedPhone = values.phone ? 
        `+${values.phoneCode} ${values.phone}` : 
        null;

      // Prepare submission values
      const submissionValues = {
        dealTitle: values.leadTitle,
        firstName: values.dealName?.split(' ')[0] || '',
        lastName: values.dealName?.split(' ').slice(1).join(' ') || '',
        email: values.email,
        phone: formattedPhone,
        currency: values.currency,
        value: parseFloat(values.value) || 0,
        pipeline: values.pipeline,
        stage: values.stage,
        status: values.status,
        label: values.label,
        closedDate: values.closedDate ? 
          values.closedDate.format('YYYY-MM-DD') : 
          null,
        company_name: values.company,
        address: values.address,
        website: values.website,
        products: { products: values.products || [] },
        assigned_to: {
          assigned_to: values.assigned_to || []
        },
        is_won: values.status === 'won' ? true : 
                values.status === 'lost' ? false : 
                null
      };

      await updateDeal({
        id: initialValues.id,
        ...submissionValues,
      }).unwrap();

      message.success("Deal updated successfully");
      await refetch();
      onCancel();
    } catch (error) {
      console.error("Error updating deal:", error);
      message.error(error?.data?.message || "Failed to update deal");
    }
  };

  const selectStyle = {
    width: '100%',
    height: '48px'
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };
  const formItemStyle = {
    fontSize: "14px",
    fontWeight: "500"
  };

  const handleAddPipelineClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setIsAddPipelineVisible(true);
  };

  // Add handler for value input change
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

  return (
    <>
      <Modal
        title={null}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={800}
        destroyOnClose={true}
        centered
        closeIcon={null}
        className="pro-modal custom-modal lead-form-modal"
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
                Edit Deal
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Update deal information
              </Text>
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            phoneCode: '91',
            currency: 'INR',

          }}
          className="lead-form"
          style={{ padding: '24px' }}
        >
          {/* Deal Details Section */}
          <div className="section-title" style={{ marginBottom: '16px' }}>
            <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Deal Details</Text>
          </div>
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <Form.Item
              name="leadTitle"
              label={<span style={formItemStyle}>Lead Title</span>}
            >
              <Input
                prefix={<FiHash style={{ color: "#1890ff", fontSize: "16px", marginRight: "8px" }} />}
                placeholder="Enter lead title"
                style={{
                  height: "48px",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>

            <Form.Item
              name="dealName"
              label={<span style={formItemStyle}>Deal Name</span>}
            >
              <Input
                prefix={<FiBriefcase style={{ color: "#1890ff", fontSize: "16px", marginRight: "8px" }} />}
                placeholder="Enter deal name"
                style={{
                  height: "48px",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={formItemStyle}>Email</span>}
            >
              <Input
                prefix={<FiMail style={{ color: "#1890ff", fontSize: "16px", marginRight: "8px" }} />}
                placeholder="Enter email"
                style={{
                  height: "48px",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>

            {/* Deal Value */}
            <Form.Item
              name="value"
              label={<span style={formItemStyle}>Deal Value</span>}
              className="combined-input-item"
            >
              <Input.Group compact className="value-input-group">
                <Form.Item
                  name="currency"
                  noStyle
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

            {/* Phone Number */}
            <Form.Item
              name="phoneGroup"
              label={<span style={formItemStyle}>Phone Number</span>}
              className="combined-input-item"
            >
              <Input.Group compact className="phone-input-group">
                <Form.Item
                  name="phoneCode"
                  noStyle
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
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>

            <Form.Item
              name="pipeline"
              label="Pipeline"
            >
              <Select
                placeholder="Select Pipeline"
                onChange={handlePipelineChange}
                suffixIcon={<FiChevronDown />}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={handleAddPipelineClick}
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      Add New Pipeline
                    </Button>
                  </div>
                )}
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
              label="Stage"
            >
              <Select
                placeholder="Select Stage"
                disabled={!selectedPipeline}
                suffixIcon={<FiChevronDown />}
              >
                {filteredStages.map((stage) => (
                  <Option key={stage.id} value={stage.id}>
                    {stage.stageName}
                  </Option>
                ))}
              </Select>
            </Form.Item>


            {/* Company Name */}
            <Form.Item
              name="company"
              label={<span style={formItemStyle}>Company Name</span>}
            >
              <Input
                prefix={<FiBriefcase style={{ color: "#1890ff", fontSize: "16px", marginRight: "8px" }} />}
                placeholder="Enter company name"
                style={{
                  height: "48px",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>

            {/* Website */}
            <Form.Item
              name="website"
              label={<span style={formItemStyle}>Website</span>}
              rules={[
                { type: "url", message: "Please enter a valid website URL" },
              ]}
            >
              <Input
                prefix={<FiGlobe style={{ color: "#1890ff", fontSize: "16px", marginRight: "8px" }} />}
                placeholder="Enter website"
                style={{
                  height: "48px",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>

            {/* Address */}
            <Form.Item
              name="address"
              label={<span style={formItemStyle}>Address</span>}
            >
              <Input
                prefix={<FiMapPin style={{ color: "#1890ff", fontSize: "16px", marginRight: "8px" }} />}
                placeholder="Enter address"
                style={{
                  height: "48px",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>

            {/* Source */}
            <Form.Item
              name="source"
              label={<span style={formItemStyle}>Source</span>}
              rules={[{ required: true, message: "Please select source" }]}
            >
              <Select
                placeholder="Select source"
                style={selectStyle}
                popupClassName="custom-select-dropdown"
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

            <Form.Item
              name="label"
              label={<span style={formItemStyle}>Label</span>}
            >
              <Select
                placeholder="Select label"
                style={selectStyle}
                suffixIcon={<FiChevronDown size={14} />}
                popupClassName="custom-select-dropdown"
              >
                {labels.map(label => (
                  <Option key={label.id} value={label.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: label.color || '#1890ff'
                      }}></div>
                      {label.name}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            </div>
          

            <Form.Item
              name="products"
              label={<Text style={formItemStyle}>Products</Text>}
              className="products-section"
            >
              <Select
                mode="multiple"
                placeholder="Select products"
                style={{ width: '100%' }}
                optionFilterProp="children"
                showSearch
                onChange={handleProductsChange}
                popupClassName="products-dropdown"
              >
                {products?.map((product) => (
                  <Option key={product.id} value={product.id}>
                    <div className="product-option">
                      <div className="product-image">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<FiBox className="product-icon" />';
                            }}
                          />
                        ) : (
                          <FiBox className="product-icon" />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column',marginLeft: '8px' }}>
                        <span style={{ fontWeight: '500' }}>{product.name}</span>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>{product.selling_price}</span>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '32px'
          }}>

            {/* Closed Date */}
            <Form.Item
              name="closedDate"
              label={<span style={formItemStyle}>Closed Date</span>}
            >
              <DatePicker
                size="large"
                format="YYYY-MM-DD"
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

            {/* Status */}
            <Form.Item
              name="status"
              label={<span style={formItemStyle}>Status</span>}
              rules={[
                { required: true, message: "Please select status" },
              ]}
            >
              <Select
                placeholder="Select status"
                style={{
                  height: "48px",
                  borderRadius: "10px",
                }}
              >
                <Option value="won">Won</Option>
                <Option value="lost">Lost</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Team Members Section */}
          <div className="section-title" style={{ marginBottom: '16px' }}>
            <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Team Members</Text>
          </div>
          <div style={{ marginBottom: '32px' }}>
            <Form.Item
              name="assigned_to"
              style={{ marginBottom: '16px' }}
            >
              <Select
                mode="multiple"
                placeholder="Select team members"
                style={{
                  width: '100%',
                  minHeight: '48px'
                }}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button
                      type="text"
                      icon={<FiUserPlus />}
                      onClick={handleCreateUser}
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      Add New User
                    </Button>
                  </>
                )}
              >
                {users?.map((user) => {
                  const role = rolesData?.data?.find(r => r.id === user.role_id)?.role_name || 'User';
                  const roleColor = getRoleColor(role);

                  return (
                    <Option key={user.id} value={user.id}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{user.name || user.username}</span>
                        <span style={{
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: roleColor.bg,
                          color: roleColor.color,
                          gap: '8px',
                          textTransform: 'capitalize'
                        }}>
                          {role}
                        </span>
                      </div>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button
              onClick={handleCancel}
              style={{
                height: '44px',
                padding: '0 24px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{
                height: '44px',
                padding: '0 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Update Deal
            </Button>
          </div>
        </Form>
      </Modal>

      <AddPipelineModal
        isOpen={isAddPipelineVisible}
        onClose={() => setIsAddPipelineVisible(false)}
      />

      <CreateUser
        visible={isCreateUserVisible}
        onCancel={() => setIsCreateUserVisible(false)}
        onSubmit={handleCreateUserSuccess}
      />
    </>
  );
};

export default EditDeal;
