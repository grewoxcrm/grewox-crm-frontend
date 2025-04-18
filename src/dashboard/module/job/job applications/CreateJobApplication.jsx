import React, { useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Select,
    DatePicker,
    TimePicker,
    Upload,
    message,
    Tag,
    InputNumber
} from 'antd';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiDollarSign, FiX, FiClock, FiUpload } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useCreateJobApplicationMutation, useUpdateJobApplicationMutation } from './services/jobApplicationApi';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useGetAllCountriesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import ColumnGroup from 'antd/es/table/ColumnGroup';

dayjs.extend(customParseFormat);

const { Text } = Typography;
const { Option } = Select;

const statuses = [
    'pending',
    'shortlisted',
    'interviewed',
    'rejected'
];

const experienceLevels = [
    'Entry Level',
    '1-3 years',
    '3-5 years',
    '5-7 years',
    '7+ years'
];

const CreateJobApplication = ({ open, onCancel, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [createJobApplication, { isLoading: isCreating }] = useCreateJobApplicationMutation();
    const [updateJobApplication, { isLoading: isUpdating }] = useUpdateJobApplicationMutation();
    const { data: jobs, isLoading: isLoadingJobs } = useGetAllJobsQuery();
    const { data: countries, isLoading: countriesLoading } = useGetAllCountriesQuery();

    const getFieldRules = (fieldName) => {
        if (!isEditing) {
            return [{ required: true, message: `Please enter ${fieldName}` }];
        }
        return []; // No validation rules in edit mode
    };

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) {
                // Parse the phone object if it exists
                let phoneCode = '+91'; // Default to India's code
                let phoneNumber = '';
                
                // Find the country by ID and get its phone code
                if (initialValues.phoneCode) {
                    const country = countries?.find(c => c.id === initialValues.phoneCode);
                    if (country) {
                        phoneCode = country.phoneCode;
                    }
                }

                // Get phone number
                if (initialValues.phone) {
                    phoneNumber = initialValues.phone;
                }

                const formattedValues = {
                    ...initialValues,
                    phoneCode: phoneCode || '+91', // Ensure phoneCode is never null
                    phoneNumber,
                    interview_date: initialValues.interview_date ? dayjs(initialValues.interview_date) : undefined,
                    interview_time: initialValues.interview_time ? dayjs(initialValues.interview_time, 'HH:mm A') : undefined
                };
                form.setFieldsValue(formattedValues);
            } else {
                // Set default values for new application
                form.setFieldsValue({
                    phoneCode: '+91', // Set default phone code for new applications
                    status: 'pending'
                });
            }
        }
    }, [open, form, initialValues, countries]);

    const handleSubmit = async (values) => { 
        try {
            // Create FormData instance
            const formData = new FormData();
            
            // Extract file and phone details
            const { cv_path, phoneCode, phoneNumber, ...otherValues } = values;

            // Add the file if it exists
            if (cv_path?.fileList?.[0]?.originFileObj) {
                formData.append('file', cv_path.fileList[0].originFileObj);
            }

            // Find the country ID from the selected phone code
            const selectedCountry = countries?.find(c => c.phoneCode === phoneCode);
            if (!selectedCountry) {
                message.error('Please select a valid phone code');
                return;
            }

            // Format phone data as a string
            formData.append('phoneCode', selectedCountry.id);
            formData.append('phone', phoneNumber || '');

            // Add all other fields to formData, excluding any duplicate phone field
            const { phone, ...cleanValues } = otherValues;
            const payload = {
                ...cleanValues,
                client_id: localStorage.getItem('client_id'),
                created_by: localStorage.getItem('user_id')
            };

            // Append all other fields to formData
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            if (isEditing) {
                await updateJobApplication({
                    id: initialValues.id,
                    data: formData
                }).unwrap();
                message.success('Job application updated successfully');
            } else {
                await createJobApplication(formData).unwrap();
                message.success('Job application created successfully');
            }

            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Operation failed:', error);
            message.error(error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} job application`);
        }
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending'},
        { value: 'shortlisted', label: 'Shortlisted'},
        { value: 'interviewed', label: 'Interviewed'},
        { value: 'selected', label: 'Selected'},
        { value: 'rejected', label: 'Rejected' }
    ];

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={720}
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
                        <FiUser style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            {isEditing ? 'Edit Application' : 'Create New Application'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update application information'
                                : 'Fill in the information to create application'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ ...initialValues, status: 'pending' }}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="job"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Job Position {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}</span>}
                        rules={getFieldRules('job position')}
                    >
                        <Select
                            placeholder="Select job position"
                            loading={isLoadingJobs}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                            }}
                        >
                            {jobs?.data?.map((job) => (
                                <Option key={job.id} value={job.id}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FiBriefcase style={{ color: '#1890ff', fontSize: '16px', marginRight: '8px' }} />
                                        <span>{job.title}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Name {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}</span>}
                        rules={getFieldRules('name')}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter name"
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
                        name="email"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Email {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}</span>}
                        rules={getFieldRules('email')}
                    >
                        <Input
                            prefix={<FiMail style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter email"
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
                        name="phone"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Phone Number {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                            </span>
                        }
                        // rules={getFieldRules('phone')}
                    >
                        <Input.Group compact className="phone-input-group" style={{
                            display: 'flex',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            overflow: 'hidden'
                        }}>
                            <Form.Item
                                name="phoneCode"
                                noStyle
                                initialValue="+91"
                            >
                                <Select
                                    size="large"
                                    style={{
                                        width: '80px',
                                        height: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                    }}
                                    loading={countriesLoading}
                                    className="phone-code-select"
                                    dropdownStyle={{
                                        padding: '8px',
                                        borderRadius: '10px',
                                        backgroundColor: 'white',
                                    }}
                                    showSearch
                                    optionFilterProp="children"
                                    defaultValue="+91"
                                >
                                    {countries?.map(country => (
                                        <Option 
                                            key={country.id} 
                                            value={country.phoneCode}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                color: '#262626',
                                                cursor: 'pointer',
                                            }}>
                                                <span>{country.phoneCode}</span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="phoneNumber"
                                noStyle
                                // rules={getFieldRules('phone')}
                            >
                                <Input
                                    size="large"
                                    type="number"
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        borderLeft: '1px solid #e6e8eb',
                                        borderRadius: 0,
                                        height: '46px',
                                        backgroundColor: 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    placeholder="Enter 10-digit phone number"
                                    maxLength={10}
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>

                    <Form.Item
                        name="location"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Location {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}</span>}
                        rules={getFieldRules('location')}
                    >
                        <Input
                            placeholder="Enter location"
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
                        name="total_experience"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Total Experience {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}</span>}
                        rules={getFieldRules('total experience')}
                    >
                        <Select
                        listHeight={100}
                        dropdownStyle={{
                          Height: '100px',
                          overflowY: 'auto',
                          scrollbarWidth: 'thin',
                          scrollBehavior: 'smooth'
                        }}
                            placeholder="Select total experience"
                            size="large"
                            style={{
                                borderRadius: '10px',
                                height: '48px',
                            }}
                        >
                            {experienceLevels.map(level => (
                                <Option key={level} value={level}>{level}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="current_location"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Current Location {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}</span>}
                        rules={getFieldRules('current location')}
                    >
                        <Input
                            placeholder="Enter current location"
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
                        name="notice_period"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Notice Period {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}</span>}
                        rules={getFieldRules('notice period')}
                    >
                        <Input
                            prefix={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter notice period"
                            size="large"
                            type="number"
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
                        name="applied_source"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Applied Source {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}</span>}
                        rules={getFieldRules('applied source')}
                    >
                        <Input
                            placeholder="Enter applied source"
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
                        name="status"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Status {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}</span>}
                        rules={getFieldRules('status')}
                        initialValue="pending"
                    >
                        <Select
                            placeholder="Select status"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px'
                            }}
                        >
                            {statusOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                   
                                        {option.label}
                                    
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="cv_path"
                    label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Resume/CV {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}</span>}
                    rules={getFieldRules('status')}
                    className="full-width"  
                >
                    <Upload.Dragger
                        name="cv_path"
                        multiple={false}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept=".pdf,.doc,.docx"
                    >
                        <p className="ant-upload-drag-icon">
                            <FiUpload style={{ fontSize: '24px', color: '#1890ff' }} />
                        </p>
                        <p className="ant-upload-text">Click or drag file to upload resume</p>
                        <p className="ant-upload-hint">
                            Support for PDF, DOC, DOCX files
                        </p>
                    </Upload.Dragger>
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', gridColumn: '1 / -1' }}>
                    <Button
                        onClick={onCancel}
                        size="large"
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px',
                            height: '48px',
                            border: '1px solid #e6e8eb',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                            border: 'none',
                        }}
                        loading={isEditing ? isUpdating : isCreating}
                    >
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateJobApplication; 