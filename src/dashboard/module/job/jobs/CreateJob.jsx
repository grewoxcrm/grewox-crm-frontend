import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    message,
    Select,
    InputNumber,
    DatePicker,
    Space,
    Tag
} from 'antd';
import { FiUser, FiFileText, FiMapPin, FiBriefcase, FiDollarSign, FiX, FiClock, FiFolder, FiPlus } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { useCreateJobMutation, useUpdateJobMutation } from './services/jobApi';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import CreateUser from '../../user-management/users/CreateUser';

// Initialize dayjs plugins
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Temporary',
    'Internship'
];

const experienceLevels = [
    'Entry Level',
    '1-3 years',
    '3-5 years',
    '5-7 years',
    '7+ years'
];

const skillOptions = [
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'SQL',
    'HTML/CSS',
    'TypeScript',
    'Docker',
    'AWS',
    // Add more skills as needed
];

const interviewRoundOptions = [
    'Technical Round',
    'HR Round',
    'System Design',
    'Coding Test',
    'Cultural Fit',
    'Final Interview'
];

const CreateJob = ({ open, onCancel, onSubmit, isEditing, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [skillTags, setSkillTags] = useState([]);
    const [interviewTags, setInterviewTags] = useState([]);
    const [inputVisible, setInputVisible] = useState({ skills: false, interview: false });
    const [inputValue, setInputValue] = useState({ skills: '', interview: '' });
    const inputRefs = {
        skills: React.useRef(null),
        interview: React.useRef(null)
    };
    const [createJob] = useCreateJobMutation();
    const [updateJob] = useUpdateJobMutation();
    const { data: currencies, isLoading: currenciesLoading } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });
    const { data: userData, isLoading: isLoadingUsers } = useGetUsersQuery();
    const { data: rolesData } = useGetRolesQuery();

    // Add array of excluded role names - adjust these based on your needs
    const excludedRoleNames = ['employee', 'client', 'sub-client', 'super-admin'];

    // Filter users based on roles
    const filteredUsers = React.useMemo(() => {
        if (!userData?.data || !rolesData?.data) return [];

        const usersList = Array.isArray(userData.data) ? userData.data : [];
        const rolesList = Array.isArray(rolesData.data) ? rolesData.data : [];

        return usersList.filter(user => {
            const userRole = rolesList.find(role => role.id === user.role_id);
            if (!userRole || excludedRoleNames.includes(userRole.role_name.toLowerCase())) {
                return false;
            }
            return true;
        });
    }, [userData, rolesData]);

    useEffect(() => {
        if (currencies?.length && !isEditing) {
            const defaultCurrency = currencies.find(c => c.currencyCode === 'INR') || currencies[0];
            form.setFieldValue('currency', defaultCurrency.id);
        }
    }, [currencies, form, isEditing]);

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) {
                // Format the initial values for editing
                const formattedValues = {
                    ...initialValues,
                    startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
                    endDate: initialValues.endDate ? dayjs(initialValues.endDate) : undefined,
                    title: initialValues.title,
                    category: initialValues.category,
                    location: initialValues.location,
                    totalOpenings: initialValues.totalOpenings,
                    status: initialValues.status,
                    recruiter: initialValues.recruiter,
                    jobType: initialValues.jobType || 'Full-time',
                    workExperience: initialValues.workExperience,
                    currency: initialValues.currency?.id || initialValues.currency,
                    expectedSalary: initialValues.expectedSalary,
                    description: initialValues.description
                };

                // Set the tags for skills and interview rounds
                setSkillTags(initialValues.skills?.Skills || []);
                setInterviewTags(initialValues.interviewRounds?.InterviewRounds || []);

                form.setFieldsValue(formattedValues);
            } else {
                setSkillTags([]);
                setInterviewTags([]);
                // Set default values for new job
                const defaultCurrency = currencies?.find(c => c.currencyCode === 'INR') || currencies?.[0];
                form.setFieldsValue({
                    status: 'active',
                    jobType: 'Full-time',
                    currency: defaultCurrency?.id
                });
            }
        }
    }, [open, form, initialValues, currencies]);

    const handleClose = (removedTag, type) => {
        const tags = type === 'skills' ? skillTags : interviewTags;
        const newTags = tags.filter(tag => tag !== removedTag);
        if (type === 'skills') {
            setSkillTags(newTags);
            form.setFieldsValue({ skills: newTags });
        } else {
            setInterviewTags(newTags);
            form.setFieldsValue({ interviewRounds: newTags });
        }
    };

    const showInput = (type) => {
        setInputVisible({ ...inputVisible, [type]: true });
        setTimeout(() => {
            inputRefs[type].current?.focus();
        }, 100);
    };

    const handleInputConfirm = (type) => {
        const trimmedInput = inputValue[type].trim();
        if (trimmedInput) {
            const tags = type === 'skills' ? skillTags : interviewTags;
            if (!tags.includes(trimmedInput)) {
                const newTags = [...tags, trimmedInput];
                if (type === 'skills') {
                    setSkillTags(newTags);
                    form.setFieldsValue({ skills: newTags });
                } else {
                    setInterviewTags(newTags);
                    form.setFieldsValue({ interviewRounds: newTags });
                }
            }
        }
        setInputVisible({ ...inputVisible, [type]: false });
        setInputValue({ ...inputValue, [type]: '' });
    };

    // Add new function for handling input change
    const handleInputChange = (e, type) => {
        const value = e.target.value;
        if (value[value.length - 1] === ',') {
            // Remove the comma and add the tag
            const newTag = value.slice(0, -1).trim();
            if (newTag) {
                const tags = type === 'skills' ? skillTags : interviewTags;
                if (!tags.includes(newTag)) {
                    const newTags = [...tags, newTag];
                    if (type === 'skills') {
                        setSkillTags(newTags);
                        form.setFieldsValue({ skills: newTags });
                    } else {
                        setInterviewTags(newTags);
                        form.setFieldsValue({ interviewRounds: newTags });
                    }
                }
            }
            setInputValue({ ...inputValue, [type]: '' });
        } else {
            setInputValue({ ...inputValue, [type]: value });
        }
    };

    const getFieldRules = (fieldName) => {
        if (!isEditing) {
            return [{ required: true, message: `Please enter ${fieldName}` }];
        }
        return []; // No validation rules in edit mode
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Format dates properly
            let startDate = null;
            let endDate = null;

            if (values.startDate) {
                if (dayjs.isDayjs(values.startDate)) {
                    startDate = values.startDate.format('YYYY-MM-DD');
                } else {
                    startDate = dayjs(values.startDate).format('YYYY-MM-DD');
                }
            }

            if (values.endDate) {
                if (dayjs.isDayjs(values.endDate)) {
                    endDate = values.endDate.format('YYYY-MM-DD');
                } else {
                    endDate = dayjs(values.endDate).format('YYYY-MM-DD');
                }
            }

            // Get the selected currency details using ID
            const selectedCurrency = currencies?.find(c => c.id === values.currency);

            // Format the data according to the required payload structure
            const formattedValues = {
                title: values.title,
                category: values.category,
                skills: {
                    Skills: values.skills
                },
                location: values.location,
                interviewRounds: {
                    InterviewRounds: values.interviewRounds
                },
                startDate: startDate,
                endDate: endDate,
                totalOpenings: values.totalOpenings || 1,
                status: values.status,
                recruiter: values.recruiter,
                jobType: values.jobType,
                workExperience: values.workExperience,
                currency: values.currency.toString(),
                expectedSalary: values.expectedSalary,
                description: values.description
            };

            // Validate required fields
            const requiredFields = ['title', 'category', 'location', 'jobType', 'workExperience', 'recruiter'];
            for (const field of requiredFields) {
                if (!formattedValues[field]) {
                    console.error(`${field} is missing!`);
                    message.error(`${field} is required`);
                    return;
                }
            }

            // Check if jobType exists, if not, add a default
            if (!formattedValues.jobType) {
                console.error('JobType is missing!');
                formattedValues.jobType = 'Full-time';
            }

            // Ensure title is present
            if (!formattedValues.title) {
                console.error('Title is missing!');
                throw new Error('Title is required');
            }

            if (isEditing && initialValues?.id) {

                await updateJob({
                    id: initialValues.id,
                    data: formattedValues
                }).unwrap();
                message.success('Job updated successfully!');
            } else {
                const response = await createJob(formattedValues).unwrap();
                message.success('Job created successfully!');
            }

            onCancel();
        } catch (error) {
            message.error(error.data?.message || 'Please check your input and try again.');
        }
    };

    return (
        <>
            <Modal
                title={null}
                open={open}
                onCancel={onCancel}
                footer={null}
                width={820}
                destroyOnClose={true}
                centered
                closeIcon={null}
                className="pro-modal custom-modal"
                style={{
                    '--antd-arrow-background-color': '#ffffff',
                }}
                styles={{
                    body: {
                        padding: 0,
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }
                }}
            >
                <div
                    className="modal-header"
                    style={{
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        padding: '24px',
                        color: '#ffffff',
                        position: 'relative',
                    }}
                >
                    <Button
                        type="text"
                        onClick={onCancel}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            color: '#ffffff',
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                    >
                        <FiX style={{ fontSize: '20px' }} />
                    </Button>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}
                    >
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(8px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FiBriefcase style={{ fontSize: '24px', color: '#ffffff' }} />
                        </div>
                        <div>
                            <h2
                                style={{
                                    margin: '0',
                                    fontSize: '24px',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                }}
                            >
                                {isEditing ? 'Edit Job' : 'Create New Job'}
                            </h2>
                            <Text
                                style={{
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                {isEditing
                                    ? 'Update job information'
                                    : 'Fill in the information to create job'}
                            </Text>
                        </div>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        status: 'active',
                        jobType: 'Full-time',
                        currency: 'INR'
                    }}
                    requiredMark={false}
                    style={{
                        padding: '24px',
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="title"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Job Title {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={getFieldRules('job title')}
                        >
                            <Input
                                prefix={<FiBriefcase style={{ color: '#1890ff', fontSize: '16px' }} />}
                                placeholder="Enter job title"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    padding: '8px 16px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e6e8eb',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="category"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Category {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={getFieldRules('category')}
                        >
                            <Input
                                prefix={<FiFolder style={{ color: '#1890ff', fontSize: '16px' }} />}
                                placeholder="Enter job category"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    padding: '8px 16px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e6e8eb',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="skills"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Skills {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={getFieldRules('skills')}
                        >
                            <div style={{
                                minHeight: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                                borderRadius: '10px',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    padding: '8px',
                                    minHeight: '48px'
                                }}>
                                    {skillTags.map((tag) => (
                                        <Tag
                                            key={tag}
                                            closable
                                            onClose={() => handleClose(tag, 'skills')}
                                            style={{
                                                margin: 0,
                                                padding: '6px 10px',
                                                backgroundColor: '#1890ff15',
                                                borderColor: '#1890ff40',
                                                color: '#1890ff',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            {tag}
                                        </Tag>
                                    ))}
                                    <Input
                                        ref={inputRefs.skills}
                                        type="text"
                                        size="middle"
                                        placeholder={skillTags.length === 0 ? "Type skill and add comma" : "Add more skills (use comma)"}
                                        style={{
                                            minWidth: '150px',
                                            flex: 1,
                                            border: 'none',
                                            padding: '4px 8px',
                                            background: 'transparent'
                                        }}
                                        value={inputValue.skills}
                                        onChange={(e) => handleInputChange(e, 'skills')}
                                    />
                                </div>
                            </div>
                        </Form.Item>

                        <Form.Item
                            name="interviewRounds"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Interview Rounds {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={getFieldRules('interview rounds')}
                        >
                            <div style={{
                                minHeight: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                                borderRadius: '10px',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    padding: '8px',
                                    minHeight: '48px'
                                }}>
                                    {interviewTags.map((tag) => (
                                        <Tag
                                            key={tag}
                                            closable
                                            onClose={() => handleClose(tag, 'interview')}
                                            style={{
                                                margin: 0,
                                                padding: '6px 10px',
                                                backgroundColor: '#722ed115',
                                                borderColor: '#722ed140',
                                                color: '#722ed1',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            {tag}
                                        </Tag>
                                    ))}
                                    <Input
                                        ref={inputRefs.interview}
                                        type="text"
                                        size="middle"
                                        placeholder={interviewTags.length === 0 ? "Type round name and add comma" : "Add more rounds (use comma)"}
                                        style={{
                                            minWidth: '150px',
                                            flex: 1,
                                            border: 'none',
                                            padding: '4px 8px',
                                            background: 'transparent'
                                        }}
                                        value={inputValue.interview}
                                        onChange={(e) => handleInputChange(e, 'interview')}
                                    />
                                </div>
                            </div>
                        </Form.Item>

                        <Form.Item
                            name="workExperience"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Work Experience {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={getFieldRules('work experience')}
                        >
                            <Select
                                listHeight={100}
                                dropdownStyle={{
                                    Height: '100px',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollBehavior: 'smooth'
                                }}
                                placeholder="Select work experience"
                                size="large"
                                style={{
                                    width: '100%',
                                    height: '48px',
                                }}
                            >
                                {experienceLevels.map(exp => (
                                    <Option key={exp} value={exp}>{exp}</Option>
                                ))}
                            </Select>
                        </Form.Item>


                        <Form.Item
                            name="recruiter"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Recruiter {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={getFieldRules('recruiter')}
                        >
                            <Select
                                showSearch
                                placeholder="Select recruiter"
                                optionFilterProp="label"
                                size="large"
                                listHeight={100}
                                dropdownStyle={{
                                    Height: '100px',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollBehavior: 'smooth'
                                }}
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                }}
                                filterOption={(input, option) => {
                                    const label = option?.label?.toString() || '';
                                    return label.toLowerCase().includes(input.toLowerCase());
                                }}
                                options={Array.isArray(filteredUsers) ? filteredUsers.map(user => {
                                    const userRole = rolesData?.data?.find(role => role.id === user.role_id);
                                    const roleStyles = {
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

                                    const roleStyle = roleStyles[userRole?.role_name?.toLowerCase()] || roleStyles.default;

                                    return {
                                        label: (
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
                                                            alt={user.name || user.username}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                borderRadius: '50%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    ) : (
                                                        <FiUser style={{ fontSize: '20px' }} />
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
                                                        {user.name || user.username}
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
                                        ),
                                        value: user.id
                                    };
                                }) : []}
                            />
                        </Form.Item>

                        <Form.Item
                            name="startDate"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Start Date {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={getFieldRules('start date')}
                        >
                            <DatePicker
                                size="large"
                                format="DD-MM-YYYY"
                                style={{
                                    width: '100%',
                                    height: '48px',
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="endDate"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    End Date {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={getFieldRules('end date')}
                        >
                            <DatePicker
                                size="large"
                                format="DD-MM-YYYY"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    padding: '8px 16px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e6e8eb',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="jobType"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Job Type {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={getFieldRules('job type')}
                        >
                            <Select
                                listHeight={100}
                                dropdownStyle={{
                                    Height: '100px',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollBehavior: 'smooth'
                                }}
                                placeholder="Select job type"
                                size="large"
                                style={{
                                    width: '100%',
                                    height: '48px',
                                }}
                            >
                                {jobTypes.map(type => (
                                    <Option key={type} value={type}>{type}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="status"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Status {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={getFieldRules('status')}
                        >
                            <Select
                                listHeight={100}
                                dropdownStyle={{
                                    Height: '100px',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollBehavior: 'smooth'
                                }}
                                size="large"
                                style={{
                                    width: '100%',
                                    height: '48px',
                                }}
                            >
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                                <Option value="draft">Draft</Option>
                            </Select>
                        </Form.Item>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item
                                name="expectedSalary"
                                label={
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Expected Salary {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                    </span>
                                }
                                style={{ flex: 1 }}
                                rules={[
                                    {
                                        required: !isEditing,
                                        message: 'Please enter expected salary'
                                    }
                                ]}
                            >
                                <div style={{
                                    display: 'flex',
                                    width: '100%',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e6e8eb',
                                    borderRadius: '10px',
                                    overflow: 'hidden'
                                }}>
                                    <Form.Item
                                        name="currency"
                                        noStyle
                                        rules={[{ required: true, message: 'Please select currency' }]}
                                    >
                                        <Select
                                            size="large"
                                            style={{
                                                width: '120px',
                                                backgroundColor: '#f8fafc'
                                            }}
                                            loading={currenciesLoading}
                                            className="currency-select"
                                            defaultValue={currencies?.find(c => c.currencyCode === 'INR')?.id}
                                            showSearch
                                            optionFilterProp="children"
                                            dropdownMatchSelectWidth={false}
                                            filterOption={(input, option) => {
                                                const currency = currencies?.find(c => c.id === option.value);
                                                return currency?.currencyCode.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                                            }}
                                        >
                                            {currencies?.map(currency => (
                                                <Option
                                                    key={currency.id}
                                                    value={currency.id}
                                                    selected={currency.currencyCode === 'INR'}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span>{currency.currencyIcon}</span>
                                                        <span>{currency.currencyCode}</span>
                                                    </div>
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <div style={{
                                        width: '1px',
                                        backgroundColor: '#e6e8eb',
                                        margin: '8px 0'
                                    }} />
                                    <InputNumber
                                        placeholder="Enter salary amount"
                                        size="large"
                                        min={0}
                                        precision={0}
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#f8fafc',
                                            border: 'none',
                                            borderRadius: 0,
                                            boxShadow: 'none',
                                            padding: '0 8px'
                                        }}
                                        formatter={value => value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                        parser={value => value?.replace(/[^\d]/g, '')}
                                        className="salary-input"
                                    />
                                </div>
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="location"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Job Location {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={getFieldRules('job location')}
                        >
                            <Input
                                prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                                placeholder="Enter job location"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    padding: '8px 16px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e6e8eb',
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="totalOpenings"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Total Openings {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </span>
                            }
                            rules={[
                                {
                                    required: !isEditing,
                                    message: 'Please enter total openings'
                                },
                                {
                                    type: 'number',
                                    min: 1,
                                    message: 'Must be at least 1 opening'
                                }
                            ]}
                        >
                            <InputNumber
                                placeholder="Enter number of openings"
                                size="large"
                                min={1}
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e6e8eb',
                                }}
                                prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                                controls={{
                                    upIcon: <span style={{ fontSize: '12px' }}>▲</span>,
                                    downIcon: <span style={{ fontSize: '12px' }}>▼</span>,
                                }}
                            />
                        </Form.Item>

                    </div>

                    <Form.Item
                        name="description"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Job Description
                            </span>
                        }
                    >
                        <TextArea
                            placeholder="Enter detailed job description"
                            rows={4}
                            style={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    </Form.Item>

                    <Divider style={{ margin: '24px 0' }} />

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                        }}
                    >
                        <Button
                            size="large"
                            onClick={onCancel}
                            style={{
                                padding: '8px 24px',
                                height: '44px',
                                borderRadius: '10px',
                                border: '1px solid #e6e8eb',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="large"
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{
                                padding: '8px 32px',
                                height: '44px',
                                borderRadius: '10px',
                                fontWeight: '500',
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {isEditing ? 'Update Job' : 'Create Job'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <style jsx global>{`
                .custom-modal {
                    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                        background-color: #f8fafc !important;
                        border: 1px solid #e6e8eb !important;
                        border-radius: 10px !important;
                        min-height: 42px !important;
                        padding: 0px 16px !important;
                        display: flex !important;
                        align-items: center !important;
                    }

                    .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
                        border-color: #1890ff !important;
                        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
                    }

                    .ant-select-single .ant-select-selector .ant-select-selection-item,
                    .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
                        display: flex !important;
                        align-items: center !important;
                    }

                    .currency-select {
                        .ant-select-selector {
                            background-color: #f8fafc !important;
                            height: 48px !important;
                            border: none !important;
                            box-shadow: none !important;
                            padding: 0 8px !important;
                            display: flex !important;
                            align-items: center !important;

                            &:hover, &:focus {
                                background-color: #f0f7ff !important;
                            }
                        }

                        &.ant-select-focused .ant-select-selector {
                            background-color: #f0f7ff !important;
                        }
                    }

                    .salary-input {
                        height: 48px !important;

                        &:hover, &:focus {
                            background-color: #f0f7ff !important;
                        }

                        .ant-input-number-input {
                            height: 48px !important;
                            padding: 0 12px !important;
                        }
                    }

                    .ant-input-number-focused {
                        background-color: #f0f7ff !important;
                        box-shadow: none !important;
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
        </>
    );
};

export default CreateJob; 
