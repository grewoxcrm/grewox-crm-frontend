import React, { useState, useEffect } from "react";
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
  InputNumber,
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
  FiCamera,
  FiChevronDown,
  FiTag,
  FiUserPlus,
  FiShield,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useCreateLeadMutation, useGetLeadsQuery } from "./services/LeadApi";
import { useGetAllCurrenciesQuery, useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';

import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import CreateUser from '../../user-management/users/CreateUser';
import { useGetSourcesQuery, useGetStatusesQuery, useGetCategoriesQuery } from '../crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery } from '../crmsystem/leadstage/services/leadStageApi';
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { PlusOutlined } from '@ant-design/icons';
import AddPipelineModal from "../crmsystem/pipeline/AddPipelineModal";

const { Text } = Typography;
const { Option } = Select;

// Find the Indian currency and phone code IDs
const findIndianDefaults = (currencies, countries) => {
  const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
  const indiaCountry = countries?.find(c => c.countryCode === 'IN');
  return {
    defaultCurrency: inrCurrency?.id || 'JJXdfl6534FX7PNEIC3qJTK',
    defaultPhoneCode: indiaCountry?.id || 'K9GxyQ8rrXQycdLQNkGhczL'
  };
};

const CreateLead = ({
  open,
  onCancel,
  pipelines,
  currencies,
  countries,
  sourcesData,
  statusesData,
  categoriesData,
  initialValues
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const dispatch = useDispatch();
  const [createLead, { isLoading }] = useCreateLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectRef = React.useRef(null);

  // Add state to track selected pipeline
  const [selectedPipeline, setSelectedPipeline] = useState(null);

  // Fetch users data with roles
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();

  // Get subclient role ID to filter it out (similar to CreateProjectModal.jsx)
  const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

  // Filter users to get team members (excluding subclients)
  const users = usersResponse?.data?.filter(user =>
    user?.created_by === loggedInUser?.username &&
    user?.role_id !== subclientRoleId
  ) || [];

  // Get stages data
  const { data: stagesData } = useGetLeadStagesQuery();

  // Filter stages to only show lead type stages
  const stages = stagesData?.filter(stage => stage.stageType === "lead") || [];

  // Replace the hardcoded statuses with API data
  const statuses = statusesData?.data || [];
  const sources = sourcesData?.data || [];
  const categories = categoriesData?.data || [];

  // Add interest level options
  const interestLevels = [
    { value: "high", label: "High Interest", color: "#52c41a" },
    { value: "medium", label: "Medium Interest", color: "#faad14" },
    { value: "low", label: "Low Interest", color: "#ff4d4f" },
  ];

  const { defaultCurrency, defaultPhoneCode } = findIndianDefaults(currencies, countries);

  // Add getRoleColor function from CreateProjectModal.jsx
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

  // Filter stages based on selected pipeline
  const filteredStages = stagesData?.filter(
    stage => stage.stageType === "lead" && stage.pipeline === selectedPipeline
  ) || [];

  // Handle pipeline selection change
  const handlePipelineChange = (value) => {
    setSelectedPipeline(value);
    // Clear stage selection when pipeline changes
    form.setFieldValue('stage', undefined);
  };

  // Handle add pipeline click
  const handleAddPipelineClick = (e) => {
    e.stopPropagation();
    setIsAddPipelineVisible(true);
  };

  // Handle initial values when form opens
  useEffect(() => {
    if (open && initialValues) {
      console.log('Setting initial form values:', initialValues); // Debug log
      form.setFieldsValue(initialValues);

      // Double check if inquiry_id is set
      const formValues = form.getFieldsValue();
      console.log('Form values after setting:', formValues); // Debug log
    }
  }, [open, initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      console.log('Form values on submit:', values); // Debug log
      console.log('Initial values reference:', initialValues); // Debug log

      // Get the selected country's phone code
      const selectedCountry = countries.find(c => c.id === values.phoneCode);

      // Format phone number with country code
      const formattedPhone = values.telephone ?
        `+${selectedCountry?.phoneCode?.replace('+', '')} ${values.telephone}` :
        null;

      const formData = {
        ...values,
        inquiry_id: values.inquiry_id || initialValues?.inquiry_id || null, // Ensure inquiry_id is preserved
        telephone: formattedPhone,
        leadStage: values.stage,
        lead_members: {
          lead_members: values.lead_members || []
        },
        assigned: values.assigned || [],
        files: values.files || [],
        status: values.status || 'active',
        source: values.source || 'website',
        pipeline: values.pipeline
      };

      console.log('Submitting lead with data:', formData); // Debug log

      const response = await createLead(formData).unwrap();
      message.success("Lead created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Error creating lead:', error);
      message.error(error.data?.message || "Failed to create lead");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Add these consistent styles
  const formItemStyle = {
    fontSize: "14px",
    fontWeight: "500"
  };

  const inputStyle = {
    height: "48px",
    borderRadius: "10px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc", border: "1px solid #e6e8eb",
    transition: "all 0.3s ease",
    '&.ant-select-focused': {
      borderColor: '#1890ff',
      boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
    }
  };

  const prefixIconStyle = {
    color: "#1890ff",
    fontSize: "16px",
    marginRight: "8px"
  };

  // Add selectStyle for Select components
  const selectStyle = {
    width: '100%',
    height: '48px',
    '& .ant-select-selector': {
      height: '48px !important',
      padding: '8px 16px !important',
      backgroundColor: '#f8fafc !important',
      border: '1px solid #e6e8eb !important',
      borderRadius: '10px !important',
      display: 'flex',
      alignItems: 'center',
    },
    '& .ant-select-selection-search': {
      height: '46px',
      display: 'flex',
      alignItems: 'center',
    },
    '& .ant-select-selection-search-input': {
      height: '46px !important',
    },
    '& .ant-select-selection-placeholder': {
      lineHeight: '32px !important',
      color: '#9CA3AF',
    },
    '& .ant-select-selection-item': {
      lineHeight: '32px !important',
    }
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

  const handleCreateUser = () => {
    setIsCreateUserVisible(true);
  };

  const handleCreateUserSuccess = (newUser) => {
    setIsCreateUserVisible(false);
    // Add the newly created user to the selected team members
    const currentMembers = form.getFieldValue('lead_members') || [];
    form.setFieldValue('lead_members', [...currentMembers, newUser.id]);
  };

  return (
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
            <FiUser style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Create New Lead
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create lead
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="lead-form custom-form"
        style={{ padding: "24px" }}
      >
        {/* Hidden field for inquiry_id */}
        <Form.Item
          name="inquiry_id"
          hidden={true}
        >
          <Input type="hidden" />
        </Form.Item>

        {/* Lead Details - Moved to top */}
        <div className="section-title" style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Lead Details</Text>
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
            rules={[
              { required: true, message: "Please enter lead title" },
              { min: 3, message: "Lead title must be at least 3 characters" },
            ]}
          >
            <Input
              prefix={<FiUser style={prefixIconStyle} />}
              placeholder="Enter lead title"
              style={inputStyle}
            />
          </Form.Item>

          {/* Interest Level */}
          <Form.Item
            name="interest_level"
            label={<span style={formItemStyle}>Interest Level</span>}
          >
            <Select
              placeholder="Select interest level"
              style={selectStyle}
              popupClassName="custom-select-dropdown"
            >
              {interestLevels.map((level) => (
                <Option key={level.value} value={level.value}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: level.color
                    }} />
                    {level.label}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="leadValueGroup"
            label={<span style={formItemStyle}>Lead Value</span>}
            className="combined-input-item"
          >
            <Input.Group compact className="value-input-group">
              <Form.Item
                name="currency"
                noStyle
                initialValue={defaultCurrency}
                rules={[{ required: true, message: 'Please select currency' }]}
              >
                <Select
                  style={{ width: '120px' }}
                  className="currency-select"
                  dropdownMatchSelectWidth={120}
                  suffixIcon={<FiChevronDown size={14} />}
                  popupClassName="custom-select-dropdown"
                  showSearch
                  optionFilterProp="value"
                  filterOption={(input, option) =>
                    (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {currencies?.map((currency) => (
                    <Option key={currency.id} value={currency.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{currency.currencyIcon}</span>
                        <span style={{ fontSize: '14px' }}>{currency.currencyCode}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="leadValue"
                noStyle
                rules={[{ required: true, message: 'Please enter lead value' }]}
              >
                <InputNumber
                  style={{ width: 'calc(100% - 100px)', padding: '0 16px' }}
                  placeholder="Enter amount"
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
            >
              {filteredStages.map((stage) => (
                <Option key={stage.id} value={stage.id}>
                  {stage.stageName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Source Select */}
          <Form.Item
            name="source"
            label={<span style={formItemStyle}>Source</span>}
            rules={[{ required: true, message: "Please select source" }]}
          >
            <Select
              placeholder="Select source"
              style={selectStyle}
              popupClassName="custom-select-dropdown"
              listHeight={100}
              dropdownStyle={{
                maxHeight: '120px',
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

          {/* Status Select */}
          <Form.Item
            name="status"
            label={<span style={formItemStyle}>Status</span>}
          >
            <Select
              placeholder="Select status"
              style={selectStyle}
              popupClassName="custom-select-dropdown"
              listHeight={100}
              dropdownStyle={{
                maxHeight: '120px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollBehavior: 'smooth'
              }}
            >
              {statuses.map((status) => (
                <Option key={status.id} value={status.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: status.color || '#1890ff'
                      }}
                    />
                    {status.name}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Category Select */}
          <Form.Item
            name="category"
            label={<span style={formItemStyle}>Category</span>}
          >
            <Select
              placeholder="Select category"
              style={selectStyle}
              popupClassName="custom-select-dropdown"
              listHeight={100}
              dropdownStyle={{
                maxHeight: '120px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollBehavior: 'smooth'
              }}
            >
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: category.color || '#1890ff'
                      }}
                    />
                    {category.name}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Team Members Section - Updated to match ProjectModal */}
        <div style={{ marginBottom: '32px' }}>
          <Form.Item
            name="lead_members"
            label={<span style={formItemStyle}>Team Members</span>}
            style={{ marginBottom: '16px' }}
          >
            <Select
              mode="multiple"
              placeholder="Select team members"
              style={{
                width: '100%',
                height: 'auto',
                minHeight: '48px'
              }}
              listHeight={200}
              maxTagCount={3}
              maxTagTextLength={15}
              dropdownStyle={{
                maxHeight: '300px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollBehavior: 'smooth'
              }}
              popupClassName="team-members-dropdown"
              showSearch
              optionFilterProp="children"
              loading={usersLoading}
              open={teamMembersOpen}
              onDropdownVisibleChange={setTeamMembersOpen}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '0 8px',
                    justifyContent: 'flex-end'
                  }}>
                    <Button
                      type="text"
                      icon={<FiUserPlus style={{ fontSize: '16px', color: '#ffffff' }} />}
                      onClick={handleCreateUser}
                      style={{
                        height: '36px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)';
                      }}
                    >
                      Add New User
                    </Button>
                    <Button
                      type="text"
                      icon={<FiShield style={{ fontSize: '16px', color: '#1890ff' }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTeamMembersOpen(false);
                      }}
                      style={{
                        height: '36px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: '#ffffff',
                        border: '1px solid #1890ff',
                        color: '#1890ff',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e6f4ff';
                        e.currentTarget.style.borderColor = '#69b1ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = '#1890ff';
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </>
              )}
            >
              {Array.isArray(users) && users.map(user => {
                const userRole = rolesData?.data?.find(role => role.id === user.role_id);
                const roleStyle = getRoleColor(userRole?.role_name);

                return (
                  <Option key={user.id} value={user.id}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '4px 0'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#e6f4ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1890ff',
                        fontSize: '16px',
                        fontWeight: '500',
                        textTransform: 'uppercase'
                      }}>
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt={user.username}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          user.username?.charAt(0) || <FiUser />
                        )}
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '4px'
                      }}>
                        <span style={{
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.85)',
                          fontSize: '14px'
                        }}>
                          {user.username}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginLeft: 'auto'
                      }}>
                        <div
                          className="role-indicator"
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: roleStyle.color,
                            boxShadow: `0 0 8px ${roleStyle.color}`,
                            animation: 'pulse 2s infinite'
                          }}
                        />
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: roleStyle.bg,
                          color: roleStyle.color,
                          border: `1px solid ${roleStyle.border}`,
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}>
                          {userRole?.role_name || 'User'}
                        </span>
                      </div>
                    </div>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </div>

        {/* Basic Information - Moved to bottom */}
        <div className="section-title" style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Basic Information</Text>
        </div>
        <div className="form-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <Form.Item
            name="firstName"
            label={<span style={formItemStyle}>First Name</span>}
          >
            <Input
              prefix={<FiUser style={prefixIconStyle} />}
              placeholder="Enter first name"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={<span style={formItemStyle}>Last Name</span>}
          >
            <Input
              prefix={<FiUser style={prefixIconStyle} />}
              placeholder="Enter last name"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={formItemStyle}>Email</span>}
            rules={[
              { type: "email", message: "Please enter a valid email" }
            ]}
          >
            <Input
              prefix={<FiMail style={prefixIconStyle} />}
              placeholder="Enter email address"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="phoneGroup"
            label={<span style={formItemStyle}>Phone Number</span>}
            className="combined-input-item"
          >
            <Input.Group compact className="phone-input-group">
              <Form.Item name="phoneCode" noStyle initialValue={defaultPhoneCode}>
                <Select
                  style={{ width: '120px' }}
                  className="phone-code-select"
                  dropdownMatchSelectWidth={120}
                  suffixIcon={<FiChevronDown size={14} />}
                  popupClassName="custom-select-dropdown"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children?.props?.children[0]?.props?.children?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {countries?.map((country) => (
                    <Option key={country.id} value={country.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>{country.countryCode}</span>
                        <span style={{ fontSize: '14px' }}>+{country.phoneCode.replace('+', '')}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="telephone"
                noStyle
              >
                <InputNumber
                  style={{ width: 'calc(100% - 100px)', padding: '0 16px' }}
                  placeholder="Enter phone number"
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="company_name"
            label={<span style={formItemStyle}>Company Name</span>}
          >
            <Input
              prefix={<FiBriefcase style={prefixIconStyle} />}
              placeholder="Enter company name"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="address"
            label={<span style={formItemStyle}>Address</span>}
          >
            <Input
              prefix={<FiMapPin style={prefixIconStyle} />}
              placeholder="Enter address"
              style={inputStyle}
            />
          </Form.Item>
        </div>

        <Divider style={{ margin: "24px 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "0 24px 24px"
          }}
        >
          <Button
            size="large"
            onClick={handleCancel}
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
            size="large"
            htmlType="submit"
            loading={isLoading}
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
            Create Lead
          </Button>
        </div>
      </Form>

      {/* Add CreateUser Modal */}
      <CreateUser
        visible={isCreateUserVisible}
        onCancel={() => setIsCreateUserVisible(false)}
        onSubmit={handleCreateUserSuccess}
      />

      <AddPipelineModal
        isOpen={isAddPipelineVisible}
        onClose={() => setIsAddPipelineVisible(false)}
      />

      <style jsx global>{`
        .lead-form-modal {
          .currency-select, .phone-code-select {
            cursor: pointer;
            .ant-select-selector {
              padding: 8px 8px !important;
              height: 48px !important;
            }
            
            .ant-select-selection-search {
              input {
                height: 100% !important;
                color: #fff !important;
              }
            }

            .ant-select-selection-item {
              padding-right: 20px !important;
              // font-weight: 500 !important;
              color: #fff !important;
            }

            .ant-select-selection-placeholder {
              color: #9CA3AF !important;
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

          .ant-select-multiple {
            .ant-select-selector {
              min-height: 48px !important;
              // height: auto !important;
              padding: 0px 16px !important;
              background-color: #f8fafc !important;
              border: 1px solid #e6e8eb !important;
              border-radius: 10px !important;
              display: flex !important;
              align-items: flex-start !important;
              flex-wrap: wrap !important;
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

          .ant-select-dropdown {
            .ant-select-item-option-content {
              white-space: normal !important;
              word-break: break-word !important;
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
        }
      `}</style>
    </Modal>
  );
};

export default CreateLead;
