import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Divider,
  message,
  InputNumber,
} from "antd";
import {
  FiUser,
  FiMail,
  FiX,
  FiBriefcase,
  FiMapPin,
  FiCamera,
  FiChevronDown,
  FiTag,
  FiUserPlus,
  FiShield,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateLeadMutation } from "./services/LeadApi";
import { useGetAllCurrenciesQuery, useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import CreateUser from '../../user-management/users/CreateUser';
import { useGetSourcesQuery, useGetStatusesQuery, useGetCategoriesQuery } from '../crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery } from '../crmsystem/leadstage/services/leadStageApi';
import { PlusOutlined } from '@ant-design/icons';
import AddPipelineModal from "../crmsystem/pipeline/AddPipelineModal";

const { Text } = Typography;
const { Option } = Select;

const EditLead = ({ open, onCancel, initialValues, pipelines, currencies, countries, categoriesData, sourcesData, statusesData }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);
  const dispatch = useDispatch();
  const [updateLead, { isLoading }] = useUpdateLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectRef = React.useRef(null);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const { data: stagesData } = useGetLeadStagesQuery();
  // Get sources data


  // Replace the hardcoded statuses with API data
  const statuses = statusesData?.data || [];
  const sources = sourcesData?.data || [];
  const categories = categoriesData?.data || [];
  // Fetch users data with roles
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();

  // Filter stages to only show lead type stages
  const stages = stagesData?.filter(stage => stage.stageType === "lead") || [];

  // Get subclient role ID to filter it out
  const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

  // Filter users to get team members (excluding subclients)
  const users = usersResponse?.data?.filter(user =>
    user?.created_by === loggedInUser?.username &&
    user?.role_id !== subclientRoleId
  ) || [];

  // Find default currency and phone code
  const inrCurrency = currencies?.find(c => c.currencyCode === 'INR');
  const indiaCountry = countries?.find(c => c.countryCode === 'IN');
  const defaultCurrency = inrCurrency?.id || 'JJXdfl6534FX7PNEIC3qJTK';
  const defaultPhoneCode = indiaCountry?.id || 'K9GxyQ8rrXQycdLQNkGhczL';

  // Interest level options
  const interestLevels = [
    { value: "high", label: "High Interest", color: "#52c41a" },
    { value: "medium", label: "Medium Interest", color: "#faad14" },
    { value: "low", label: "Low Interest", color: "#ff4d4f" },
  ];

  // Add getRoleColor function
  const getRoleColor = (role) => {
    const roleColors = {
      'employee': {
        color: '#D46B08',
        bg: '#FFF7E6',
        border: '#FFD591'
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
    form.setFieldValue('leadStage', undefined);
  };

  // Handle add pipeline click
  const handleAddPipelineClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setIsAddPipelineVisible(true);
  };

  // Set form values when initialValues changes
  useEffect(() => {
    if (initialValues) {
      // Parse phone number to extract country code and number
      const phoneMatch = initialValues.telephone?.match(/^\+(\d+)\s(.*)$/);
      const phoneNumber = phoneMatch ? phoneMatch[2] : initialValues.telephone || '';

      // Find country by phone code
      const phoneCode = phoneMatch ? phoneMatch[1] : '';
      const country = countries?.find(c => c.phoneCode.replace('+', '') === phoneCode);
      const countryId = country?.id || defaultPhoneCode;

      // Find currency by code
      const currencyObj = currencies?.find(c => c.currencyCode === initialValues.currency);
      const currencyId = currencyObj?.id || defaultCurrency;

      // Set selected pipeline
      setSelectedPipeline(initialValues.pipeline);

      // Parse lead_members from string if needed
      let leadMembers = [];
      try {
        if (typeof initialValues.lead_members === 'string') {
          const parsedMembers = JSON.parse(initialValues.lead_members);
          leadMembers = parsedMembers.lead_members || [];
        } else if (initialValues.lead_members?.lead_members) {
          leadMembers = initialValues.lead_members.lead_members;
        }
      } catch (error) {
        console.error('Error parsing lead_members:', error);
      }

      console.log(initialValues, "initialValues")
      form.setFieldsValue({
        ...initialValues,
        phoneCode: countryId,
        telephone: phoneNumber,
        currency: currencyId,
        leadValue: initialValues.leadValue,
        lead_members: leadMembers,
        pipeline: initialValues.pipeline,
        leadStage: initialValues.leadStage
      });

      if (initialValues.profilePic) {
        setFileList([
          {
            uid: "-1",
            name: "profile-picture.png",
            status: "done",
            url: initialValues.profilePic,
          },
        ]);
      }
    }
  }, [initialValues, form, defaultPhoneCode, defaultCurrency, countries, currencies]);

  const handleSubmit = async (values) => {
    try {
      // Get the selected country's phone code
      const selectedCountry = countries.find(c => c.id === values.phoneCode);

      // Format phone number with country code
      const formattedPhone = values.telephone ?
        `+${selectedCountry?.phoneCode?.replace('+', '')} ${values.telephone}` :
        null;

      // Get the selected currency
      const selectedCurrency = currencies.find(c => c.id === values.currency);

      // Format lead value
      const leadValue = values.leadValue || 0;

      // Format lead_members as an object (not a string)
      const leadMembers = {
        lead_members: values.lead_members || []
      };

      // Format the payload with all required fields
      const formData = {
        id: initialValues.id,
        leadTitle: values.leadTitle,
        firstName: values.firstName || '',
        lastName: values.lastName || '',
        email: values.email || '',
        telephone: formattedPhone,
        company_name: values.company_name || '',
        address: values.address || '',
        leadValue: leadValue,
        currency: selectedCurrency?.currencyCode || defaultCurrency,
        lead_members: leadMembers,
        pipeline: values.pipeline,
        leadStage: values.leadStage,
        status: values.status || 'active',
        source: values.source || 'website',
        category: values.category || '',
        interest_level: values.interest_level || 'medium',
        assigned: values.assigned || [],
        files: values.files || [],
        tags: values.tags || [],
        profilePic: fileList[0]?.url || initialValues?.profilePic || '',
        created_by: loggedInUser?.username || '',
        updated_by: loggedInUser?.username || ''
      };

      // Remove any undefined or null values
      Object.keys(formData).forEach(key => {
        if (formData[key] === undefined || formData[key] === null) {
          delete formData[key];
        }
      });

      await updateLead({ id: initialValues.id, data: formData }).unwrap();
      message.success("Lead updated successfully");
      onCancel();
    } catch (error) {
      console.error("Update Lead Error:", error);
      message.error(
        error.data?.message || "Failed to update lead"
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
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

  // Add these consistent styles
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
    }
  };

  if (isLoading) {
    return (
      <Modal
        open={open}
        footer={null}
        closable={false}
        centered
        width={800}
      >
        <div style={{
          padding: "48px 24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div>Loading lead data...</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
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
          zIndex: 1000
        },
        content: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        wrapper: {
          zIndex: 1001
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
              Edit Lead
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update lead information
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ padding: "24px" }}
      >
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
            name="leadStage"
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
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const currencyCode = option?.children?.props?.children?.[1]?.props?.children;
                    const currencyIcon = option?.children?.props?.children?.[0]?.props?.children;
                    return (
                      currencyCode?.toString().toLowerCase().includes(input.toLowerCase()) ||
                      currencyIcon?.toString().toLowerCase().includes(input.toLowerCase())
                    );
                  }}
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
                  style={{ width: 'calc(100% - 120px)', padding: '0px 16px' }}
                  placeholder="Enter amount"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                  step={1}
                />
              </Form.Item>
            </Input.Group>
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

        {/* Team Members Section */}
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
              popupClassName="custom-select-dropdown"
              showSearch
              optionFilterProp="children"
              maxTagCount={5}
              maxTagTextLength={15}
              loading={usersLoading}
              open={teamMembersOpen}
              onDropdownVisibleChange={setTeamMembersOpen}
              filterOption={(input, option) => {
                const username = option?.username?.toLowerCase();
                return username?.includes(input.toLowerCase());
              }}
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
                  <Option key={user.id} value={user.id} username={user.username}>
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
                        alignItems: 'center',
                        flex: 1
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
                        gap: '8px'
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

        {/* Basic Information */}
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
              <Form.Item
                name="phoneCode"
                noStyle
                initialValue={defaultPhoneCode}
                rules={[{ required: true, message: 'Please select country code' }]}
              >
                <Select
                  style={{ width: '120px' }}
                  className="phone-code-select"
                  dropdownMatchSelectWidth={120}
                  suffixIcon={<FiChevronDown size={14} />}
                  popupClassName="custom-select-dropdown"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const countryCode = option?.children?.props?.children?.[0]?.props?.children;
                    const phoneCode = option?.children?.props?.children?.[1]?.props?.children;
                    return (
                      countryCode?.toString().toLowerCase().includes(input.toLowerCase()) ||
                      phoneCode?.toString().toLowerCase().includes(input.toLowerCase())
                    );
                  }}
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
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^\d+$/, message: 'Please enter valid phone number' }
                ]}
              >
                <Input
                  style={{ width: 'calc(100% - 120px)' }}
                  placeholder="Enter phone number"
                  maxLength={15}
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
            Update Lead
          </Button>
        </div>
      </Form>

      <CreateUser
        open={isCreateUserVisible}
        onCancel={() => setIsCreateUserVisible(false)}
        onSuccess={handleCreateUserSuccess}
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
              padding: 8px 12px !important;
              height: 48px !important;
              border-top-right-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
              border-right: none !important;
            }
            
            .ant-select-selection-search {
              input {
                height: 100% !important;
              }
            }

            .ant-select-selection-item {
              padding-right: 20px !important;
              // font-weight: 500 !important;
            }

            .ant-select-selection-placeholder {
              color: #9CA3AF !important;
            }
          }

          .value-input-group, .phone-input-group {
            display: flex !important;
            align-items: stretch !important;
            width: 100% !important;

            .ant-select {
              .ant-select-selector {
                height: 100% !important;
                border-top-right-radius: 0 !important;
                border-bottom-right-radius: 0 !important;
              }
            }

            .ant-input-number, .ant-input {
              height: 48px !important;
              border-top-left-radius: 0 !important;
              border-bottom-left-radius: 0 !important;
              border-left: none !important;

              &:focus, &-focused {
                box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
                border-color: #1890ff !important;

                & + .ant-select .ant-select-selector {
                  border-color: #1890ff !important;
                }
              }
            }

            .ant-input-number {
              .ant-input-number-input {
                height: 46px !important;
                padding: 0 16px !important;
              }
            }

            .ant-input {
              padding: 8px 16px !important;
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
              height: auto !important;
              padding: 4px 8px !important;
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

export default EditLead;
