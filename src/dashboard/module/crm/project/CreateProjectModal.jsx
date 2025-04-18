import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Select, Divider, DatePicker, InputNumber } from 'antd';
import {
    FiUser, FiX, FiBriefcase,
    FiTag, FiFolder, FiCalendar, FiClock, FiUsers,
    FiUserPlus, FiShield
} from 'react-icons/fi';
import { useGetAllCurrenciesQuery } from '../../settings/services/settingsApi';
import { useGetAllSubclientsQuery } from '../../user-management/subclient/services/subClientApi';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import CreateSubclient from '../../user-management/subclient/CreateSubclient';
import CreateUser from '../../user-management/users/CreateUser';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const CreateProjectModal = ({ visible, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: currencies, isLoading: currenciesLoading } = useGetAllCurrenciesQuery();
    const { data: subclientsResponse, isLoading: subclientsLoading } = useGetAllSubclientsQuery();
    const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
    const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
    const [isCreateSubclientVisible, setIsCreateSubclientVisible] = useState(false);
    const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
    const [projectMembersOpen, setProjectMembersOpen] = useState(false);

    const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;
    // Extract subclients array from response
    const subclients = subclientsResponse?.data || [];
    // Extract users array from response
    const users = usersResponse?.data?.filter(user =>
        user?.created_by === loggedInUser?.username &&
        user?.role_id !== subclientRoleId
    ) || [];



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

    const calculateDuration = (dates) => {
        if (!dates || dates.length !== 2) return '';
        const [start, end] = dates;
        if (!start || !end) return '';

        // Calculate the difference in days
        const diffDays = end.diff(start, 'days');

        // Convert to months and days
        const months = Math.floor(diffDays / 30);
        const remainingDays = diffDays % 30;

        if (months > 0 && remainingDays > 0) {
            return `${months} Month${months > 1 ? 's' : ''} ${remainingDays} Day${remainingDays > 1 ? 's' : ''}`;
        } else if (months > 0) {
            return `${months} Month${months > 1 ? 's' : ''}`;
        } else {
            return `${remainingDays} Day${remainingDays > 1 ? 's' : ''}`;
        }
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        const duration = calculateDuration(dates);
        form.setFieldValue('estimated_duration', duration);
    };

    const handleSubmit = () => {
        form.validateFields().then(values => {
            const [startDate, endDate] = values.project_duration || [];
            const formattedData = {
                project_name: values.project_name,
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                project_members: {
                    project_members: values.project_members || []
                },
                project_category: values.project_category,
                project_description: values.project_description || null,
                client: values.client,
                currency: values.currency,
                budget: values.budget,
                estimatedmonths: null,
                estimatedhours: values.estimated_hours || null,
                tag: values.tag,
                status: values.status
            };
            onSubmit(formattedData);
        });
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    const handleCreateSubclient = () => {
        setIsCreateSubclientVisible(true);
    };

    const handleCreateSubclientSuccess = (newClient) => {
        setIsCreateSubclientVisible(false);
        // Set the newly created client in the form
        form.setFieldValue('client', newClient.id);
    };

    const handleCreateUser = () => {
        setIsCreateUserVisible(true);
    };

    const handleCreateUserSuccess = (newUser) => {
        setIsCreateUserVisible(false);
        // Add the newly created user to the selected project members
        const currentMembers = form.getFieldValue('project_members') || [];
        form.setFieldValue('project_members', [...currentMembers, newUser.id]);
    };

    const formItemStyle = {
        marginBottom: '24px'
    };

    const inputStyle = {
        borderRadius: '10px',
        height: '48px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e6e8eb',
        width: '100%'
    };

    const selectStyle = {
        ...inputStyle,
        '.ant-select-selector': {
            height: '48px !important',
            padding: '0 16px !important',
            display: 'flex !important',
            alignItems: 'center !important'
        },
        '.ant-select-selection-search-input': {
            height: '48px !important'
        },
        '.ant-select-selection-item': {
            lineHeight: '48px !important',
            height: '48px !important'
        },
        '.ant-select-selection-placeholder': {
            lineHeight: '48px !important'
        }
    };

    const multipleSelectStyle = {
        ...inputStyle,
        '.ant-select-selector': {
            minHeight: '48px !important',
            height: 'auto !important',
            maxHeight: '120px !important',
            overflowY: 'auto !important',
            padding: '4px 8px !important',
            display: 'flex !important',
            alignItems: 'flex-start !important',
            flexWrap: 'wrap !important'
        },
        '.ant-select-selection-overflow': {
            display: 'flex !important',
            flexWrap: 'wrap !important',
            gap: '4px !important',
            width: '100% !important'
        },
        '.ant-select-selection-overflow-item': {
            flex: '0 0 auto !important'
        }
    };

    const rangePickerStyle = {
        ...inputStyle,
        '.ant-picker-input': {
            height: '48px !important'
        },
        input: {
            height: '48px !important'
        }
    };

    const numberInputStyle = {
        ...inputStyle,
        '.ant-input-number-input-wrap': {
            height: '48px !important'
        },
        input: {
            height: '48px !important',
            lineHeight: '48px !important'
        }
    };

    const labelStyle = {
        fontSize: '14px',
        fontWeight: '500',
        display: 'inline-block'
    };

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={720}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                '--antd-arrow-background-color': '#ffffff'
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden'
                }
            }}
        >
            <div className="modal-header" style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                padding: '24px',
                color: '#ffffff',
                position: 'relative'
            }}>
                <Button
                    type="text"
                    icon={<FiX />}
                    onClick={handleCancel}
                    style={{
                        color: '#ffffff',
                        position: 'absolute',
                        right: '24px',
                        top: '24px',
                    }}
                />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <FiBriefcase style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            Create New Project
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            Fill in the information to create project
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                style={{
                    padding: '24px'
                }}
                initialValues={{
                    currency: 'INR',
                    status: 'not-started'
                }}
            >
                <div style={{ marginBottom: '24px' }}>
                    <Form.Item
                        name="project_name"
                        label={<span style={labelStyle}>Project Name *</span>}
                        style={formItemStyle}
                        rules={[
                            { required: true, message: 'Please enter project name' },
                            { min: 3, message: 'Project name must be at least 3 characters' }
                        ]}
                    >
                        <Input
                            prefix={<FiFolder style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter project name"
                            style={inputStyle}
                        />
                    </Form.Item>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '14px',
                    marginBottom: '24px'
                }}>
                    <Form.Item
                        name="project_category"
                        label={<span style={labelStyle}>Category *</span>}
                        style={formItemStyle}
                        rules={[{ required: true, message: 'Please select category' }]}
                    >
                        <Select
                            placeholder="Select project category"
                            style={selectStyle}
                            suffixIcon={<FiFolder style={{ color: '#1890ff', fontSize: '16px' }} />}
                            listHeight={100}
                            dropdownStyle={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                                scrollbarWidth: 'thin',
                                scrollBehavior: 'smooth'
                            }}
                        >
                            <Option value="web">Web Development</Option>
                            <Option value="mobile">Mobile App</Option>
                            <Option value="design">Design</Option>
                            <Option value="marketing">Marketing</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="project_duration"
                        label={<span style={labelStyle}>Project Duration *</span>}
                        style={formItemStyle}
                        rules={[{ required: true, message: 'Please select project duration' }]}
                    >
                        <RangePicker
                            style={rangePickerStyle}
                            format="DD-MM-YYYY"
                            separator="to"
                            suffixIcon={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder={['Start Date', 'End Date']}
                            onChange={handleDateRangeChange}
                        />
                    </Form.Item>

                    <Form.Item
                        name="estimated_duration"
                        label={<span style={labelStyle}>Estimated Duration *</span>}
                        style={formItemStyle}
                        rules={[{ required: true, message: 'Please enter estimated duration' }]}
                    >
                        <Input
                            prefix={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                            style={inputStyle}
                            placeholder="Auto-calculated from duration (editable)"
                        />
                    </Form.Item>

                    <Form.Item
                        name="client"
                        label={<span style={labelStyle}>Client *</span>}
                        style={formItemStyle}
                        rules={[{ required: true, message: 'Please select client' }]}
                    >
                        <Select
                            placeholder="Select client"
                            style={selectStyle}
                            suffixIcon={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            listHeight={100}
                            dropdownStyle={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                                scrollbarWidth: 'thin',
                                scrollBehavior: 'smooth'
                            }}
                            showSearch
                            loading={subclientsLoading}
                            optionFilterProp="children"
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Button
                                        type="text"
                                        icon={<FiUserPlus style={{ fontSize: '16px', color: '#ffffff' }} />}
                                        onClick={handleCreateSubclient}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '8px 12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                            color: '#ffffff',
                                            marginTop: '4px',
                                            border: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)';
                                        }}
                                    >
                                        Add New Client
                                    </Button>
                                </>
                            )}
                        >
                            {Array.isArray(subclients) && subclients.map(client => (
                                <Option key={client.id} value={client.id}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        width: '100%'
                                    }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
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
                                            {client.profilePic ? (
                                                <img
                                                    src={client.profilePic}
                                                    alt={client.username}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                client.username?.charAt(0) || <FiUser />
                                            )}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            flex: 1
                                        }}>
                                            <span style={{
                                                fontWeight: 500,
                                                color: 'rgba(0, 0, 0, 0.85)'
                                            }}>
                                                {client.username}
                                            </span>
                                        </div>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="project_members"
                    label={<span style={labelStyle}>Project Members *</span>}
                    style={{ marginBottom: '24px' }}
                    rules={[{ required: true, message: 'Please select project members' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Select project members"
                        style={multipleSelectStyle}
                        suffixIcon={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                        loading={usersLoading}
                        maxTagCount={3}
                        maxTagTextLength={10}
                        optionFilterProp="children"
                        showSearch
                        open={projectMembersOpen}
                        onDropdownVisibleChange={setProjectMembersOpen}
                        listHeight={100}
                        dropdownStyle={{
                            maxHeight: '120px',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                            scrollBehavior: 'smooth'
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
                                            setProjectMembersOpen(false);
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
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
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
                                            gap: '8px',
                                            flex: 1,
                                            justifyContent: 'space-between'
                                        }}>
                                            <span style={{
                                                fontWeight: 500,
                                                color: 'rgba(0, 0, 0, 0.85)'
                                            }}>
                                                {user.username}
                                            </span>
                                            <div className="role-wrapper" style={{
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
                                                    textTransform: 'capitalize',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    {userRole?.role_name || 'User'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '24px' }}>
                    <Form.Item
                        name="price_group"
                        label={<span style={labelStyle}>Budget *</span>}
                        style={{ flex: 1 }}
                    >
                        <Input.Group compact className="price-input-group" style={{
                            display: 'flex',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            overflow: 'hidden',
                            marginBottom: 0
                        }}>
                            <Form.Item
                                name="currency"
                                noStyle
                                rules={[{ required: true }]}
                            >
                                <Select
                                    size="large"
                                    style={{
                                        width: '100px',
                                        height: '48px'
                                    }}
                                    loading={currenciesLoading}
                                    className="currency-select"
                                    dropdownStyle={{
                                        padding: '8px',
                                        borderRadius: '10px',
                                    }}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {currencies?.map(currency => (
                                        <Option key={currency.currencyCode} value={currency.currencyCode}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>{currency.currencyIcon}</span>
                                                <span>{currency.currencyCode}</span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="budget"
                                noStyle
                                rules={[{ required: true, message: 'Please enter budget' }]}
                            >
                                <InputNumber
                                    placeholder="Enter budget amount"
                                    size="large"
                                    style={{
                                        flex: 1,
                                        width: '100%',
                                        border: 'none',
                                        borderLeft: '1px solid #e6e8eb',
                                        borderRadius: 0,
                                        height: '48px',
                                        padding: '0 16px'
                                    }}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    className="price-input"
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>

                    <Form.Item
                        name="estimated_hours"
                        label={<span style={labelStyle}>Estimated Hours *</span>}
                        style={{ flex: 1 }}
                        rules={[{ required: false, message: 'Please enter estimated hours' }]}
                    >
                        <InputNumber
                            prefix={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                            style={numberInputStyle}
                            placeholder="Enter estimated hours"
                            min={1}
                        />
                    </Form.Item>

                    <Form.Item
                        name="tag"
                        label={<span style={labelStyle}>Tag *</span>}
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Please select tag' }]}
                    >
                        <Select
                            placeholder="Select tag"
                            style={selectStyle}
                            suffixIcon={<FiTag style={{ color: '#1890ff', fontSize: '16px' }} />}
                            dropdownStyle={{ borderRadius: '10px' }}
                        >
                            <Option value="urgent">Urgent</Option>
                            <Option value="normal">Normal</Option>
                            <Option value="low">Low Priority</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label={<span style={labelStyle}>Status *</span>}
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select
                            placeholder="Select status"
                            style={selectStyle}
                            suffixIcon={<FiBriefcase style={{ color: '#1890ff', fontSize: '16px' }} />}
                            dropdownStyle={{ borderRadius: '10px' }}
                        >
                            <Option value="not-started">Not Started</Option>
                            <Option value="in-progress">In Progress</Option>
                            <Option value="completed">Completed</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="project_description"
                    label={<span style={labelStyle}>Description *</span>}
                    style={{ marginBottom: '24px' }}
                    rules={[{ required: true, message: 'Please enter project description' }]}
                >
                    <TextArea
                        placeholder="Enter project description"
                        style={{
                            borderRadius: '10px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                            padding: '12px 16px',
                            minHeight: '120px'
                        }}
                    />
                </Form.Item>

                <Divider style={{ margin: '24px 0' }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <Button
                        onClick={handleCancel}
                        style={{
                            height: '44px',
                            padding: '0 24px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={loading}
                        style={{
                            height: '44px',
                            padding: '0 24px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            background: '#1890ff',
                            border: 'none'
                        }}
                    >
                        Create Project
                    </Button>
                </div>
            </Form>

            <CreateSubclient
                open={isCreateSubclientVisible}
                onCancel={() => setIsCreateSubclientVisible(false)}
                onSuccess={handleCreateSubclientSuccess}
            />

            <CreateUser
                visible={isCreateUserVisible}
                onCancel={() => setIsCreateUserVisible(false)}
                onSubmit={handleCreateUserSuccess}
            />

            <style jsx>{`
                .currency-select .ant-select-selector {
                    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
                    border: none !important;
                    color: white !important;
                    height: 48px !important;
                    line-height: 46px !important;
                    padding: 0 12px !important;
                    display: flex;
                    align-items: center;
                    box-shadow: none !important;
                }

                .currency-select .ant-select-selection-item {
                    color: white !important;
                    // font-weight: 500 !important;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    height: 46px !important;
                    line-height: 46px !important;
                    font-size: 14px;
                }

                .currency-select .ant-select-arrow {
                    color: white !important;
                }

                .currency-select .ant-select-clear {
                    background: transparent !important;
                    color: white !important;
                    opacity: 0.8;
                }

                .currency-select .ant-select-clear:hover {
                    opacity: 1;
                }

                .currency-select.ant-select-status-error:not(.ant-select-disabled):not(.ant-select-customize-input) .ant-select-selector {
                    border-color: rgba(255, 255, 255, 0.3) !important;
                }

                .currency-select.ant-select-status-error .ant-select-arrow {
                    color: white !important;
                }

                .currency-select .ant-select-selection-search-input {
                    color: white !important;
                }

                .currency-select .ant-select-selection-placeholder {
                    color: rgba(255, 255, 255, 0.8) !important;
                }

                .currency-select .ant-select-dropdown {
                    padding: 8px !important;
                }

                .currency-select .ant-select-item {
                    padding: 8px 12px !important;
                    border-radius: 6px !important;
                }

                .currency-select .ant-select-item-option-content {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                }

                .currency-select .ant-select-item-option-selected {
                    background-color: #e6f4ff !important;
                    font-weight: 500 !important;
                }

                .price-input-group {
                    margin-bottom: 0 !important;
                    display: flex !important;
                    width: 100% !important;

                    .ant-select-selector,
                    .ant-input-number {
                        height: 46px !important;
                        line-height: 46px !important;
                    }

                    .ant-select-selector {
                        border: none !important;
                        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
                        color: white !important;
                        padding: 0 16px !important;
                        display: flex;
                        align-items: center;
                        box-shadow: none !important;
                        height: 46px !important;
                    }

                    .ant-select-selection-item {
                        color: white !important;
                        // font-weight: 500 !important;
                        display: flex;
                        align-items: center;
                        height: 46px !important;
                        line-height: 46px !important;
                    }

                    .price-input {
                        flex: 1 !important;
                        width: calc(100% - 100px) !important;
                    }

                    .ant-input-number {
                        background-color: transparent;
                        height: 46px !important;
                        
                        &:hover, &:focus {
                            border-color: transparent !important;
                            box-shadow: none !important;
                        }

                        .ant-input-number-input-wrap {
                            height: 46px !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            
                            input {
                                height: 46px !important;
                                font-size: 14px;
                                padding: 0 16px;
                                line-height: 46px !important;
                            }
                        }

                        .ant-input-number-handler-wrap {
                            display: none;
                        }
                    }

                    &:hover {
                        border-color: #1890ff;
                        
                        .ant-select-selector {
                            background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%) !important;
                        }
                    }

                    &:focus-within {
                        border-color: #1890ff;
                        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
                    }
                }

                .ant-picker-range {
                    .ant-picker-input {
                        height: 46px !important;
                        display: flex !important;
                        align-items: center !important;
                        
                        input {
                            height: 46px !important;
                            font-size: 14px !important;
                            color: rgba(0, 0, 0, 0.85) !important;
                            padding: 0 !important;
                        }
                    }

                    .ant-picker-range-separator {
                        color: rgba(0, 0, 0, 0.45) !important;
                        padding: 0 8px !important;
                        align-items: center !important;
                        display: flex !important;
                    }

                    .ant-picker-suffix {
                        color: #1890ff !important;
                        margin-left: 8px !important;
                    }

                    &:hover {
                        border-color: #1890ff !important;
                    }

                    &.ant-picker-focused {
                        border-color: #1890ff !important;
                        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
                    }
                }

                .ant-picker-dropdown {
                    .ant-picker-header {
                        padding: 12px !important;
                        border-bottom: 1px solid #f0f0f0 !important;
                    }

                    .ant-picker-panel-container {
                        border-radius: 10px !important;
                        overflow: hidden !important;
                    }

                    .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
                        background: #1890ff !important;
                    }

                    .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,
                    .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner {
                        background: #1890ff !important;
                    }

                    .ant-picker-cell-in-view.ant-picker-cell-in-range::before {
                        background: #e6f4ff !important;
                    }
                }

                .ant-select-dropdown {
                    padding: 8px !important;
                    border-radius: 10px !important;
                    
                    .ant-select-item {
                        padding: 8px 12px !important;
                        border-radius: 6px !important;
                        
                        &:hover {
                            background-color: #f5f5f5 !important;
                        }
                        
                        &.ant-select-item-option-selected {
                            background-color: #e6f4ff !important;
                            font-weight: 500 !important;
                        }
                    }
                }

                .ant-select-selection-placeholder {
                    color: rgba(0, 0, 0, 0.45) !important;
                    font-size: 14px !important;
                    display: flex !important;
                    align-items: center !important;
                    height: 100% !important;
                }

                .ant-select-selection-search {
                    display: flex !important;
                    align-items: center !important;
                    height: 100% !important;
                    
                    input {
                        height: 100% !important;
                    }
                }

                .ant-select-selection-item {
                    display: flex !important;
                    align-items: center !important;
                    height: 100% !important;
                    padding-right: 24px !important;
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

                .ant-select-multiple .ant-select-selector {
                    min-height: 48px !important;
                    height: auto !important;
                    max-height: 120px !important;
                    overflow-y: auto !important;
                    padding: 4px 8px !important;
                    display: flex !important;
                    align-items: flex-start !important;
                    flex-wrap: wrap !important;
                }

                .ant-select-multiple .ant-select-selection-overflow {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 4px !important;
                    width: 100% !important;
                }

                .ant-select-multiple .ant-select-selection-overflow-item {
                    flex: 0 0 auto !important;
                }

                .ant-select-multiple .ant-select-selection-item {
                    height: 28px !important;
                    line-height: 26px !important;
                    background: #f0f7ff !important;
                    border: 1px solid #91caff !important;
                    border-radius: 6px !important;
                    color: #0958d9 !important;
                    font-size: 13px !important;
                    margin: 2px !important;
                    padding: 0 8px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                }

                .ant-select-multiple .ant-select-selection-search {
                    width: auto !important;
                    margin: 2px !important;
                }

                .ant-select-multiple .ant-select-selection-search-input {
                    min-width: 60px !important;
                    height: 28px !important;
                    line-height: 26px !important;
                }

                .ant-select-multiple .ant-select-selection-placeholder {
                    padding: 0 8px !important;
                    line-height: 40px !important;
                }

                /* Custom scrollbar styles */
                .ant-select-multiple .ant-select-selector::-webkit-scrollbar {
                    width: 6px !important;
                }

                .ant-select-multiple .ant-select-selector::-webkit-scrollbar-track {
                    background: #f0f0f0 !important;
                    border-radius: 3px !important;
                }

                .ant-select-multiple .ant-select-selector::-webkit-scrollbar-thumb {
                    background: #d9d9d9 !important;
                    border-radius: 3px !important;
                }

                .ant-select-multiple .ant-select-selector::-webkit-scrollbar-thumb:hover {
                    background: #bfbfbf !important;
                }
            `}</style>
        </Modal>
    );
};

export default CreateProjectModal;