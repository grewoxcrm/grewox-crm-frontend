import React, { useEffect } from 'react';
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
    DatePicker
} from 'antd';
import { FiUser, FiFileText, FiMapPin, FiBriefcase, FiDollarSign, FiX, FiClock, FiCalendar } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useCreateJobOnboardingMutation, useUpdateJobOnboardingMutation } from './services/jobOnboardingApi';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const statuses = [
    'pending',
    'in_progress',
    'completed',
    'delayed'
];

const salaryTypes = [
    'Monthly',
    'Annual',
    'Weekly',
    'Hourly'
];

const salaryDurations = [
    'Monthly',
    'Annual',
    'Weekly',
    'Hourly'
];

const jobTypes = [
    'Full-Time',
    'Part-Time',
    'Contract',
];

const CreateJobOnboarding = ({ open, onCancel, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [createJobOnboarding, { isLoading: isCreating }] = useCreateJobOnboardingMutation();
    const [updateJobOnboarding, { isLoading: isUpdating }] = useUpdateJobOnboardingMutation();
    const { data: currencies, isLoading: currenciesLoading } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    useEffect(() => {
        if (currencies?.length && !isEditing) {
            const defaultCurrency = currencies.find(c => c.currencyCode === 'INR') || currencies[0];
            form.setFieldValue('currency', defaultCurrency.id);
        }
    }, [currencies, form, isEditing]);

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (isEditing && initialValues) {
                const formattedValues = {
                    Interviewer: initialValues.Interviewer,
                    joining_date: initialValues.JoiningDate ? dayjs(initialValues.JoiningDate) : undefined,
                    days_of_week: initialValues.DaysOfWeek,
                    salary: initialValues.Salary,
                    currency: initialValues.Currency?.id || initialValues.Currency,
                    salary_type: initialValues.SalaryType,
                    salary_duration: initialValues.SalaryDuration,
                    job_type: initialValues.JobType,
                    status: initialValues.Status?.toLowerCase()
                };
                form.setFieldsValue(formattedValues);
            } else {
                const defaultCurrency = currencies?.find(c => c.currencyCode === 'INR') || currencies?.[0];
                form.setFieldsValue({
                    currency: defaultCurrency?.id,
                    status: 'pending',
                    salary_type: 'Monthly'
                });
            }
        }
    }, [open, isEditing, initialValues, form, currencies]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            const selectedCurrency = currencies?.find(c => c.id === values.currency);
            
            const formData = {
                Interviewer: values.Interviewer,
                JoiningDate: values.joining_date?.format('YYYY-MM-DD'),
                DaysOfWeek: values.days_of_week,
                Salary: values.salary,
                Currency: values.currency.toString(),
                SalaryType: values.salary_type,
                SalaryDuration: values.salary_duration,
                JobType: values.job_type,
                Status: values.status?.charAt(0).toUpperCase() + values.status?.slice(1),
                client_id: localStorage.getItem('client_id'),
                created_by: localStorage.getItem('user_id')
            };

            console.log('FormData being sent:', formData);

            const data = {
                ...formData,
                created_by: localStorage.getItem('user_id')
            }

            if (isEditing) {
                await updateJobOnboarding({
                    id: initialValues.id,
                    data,
                    updated_by: localStorage.getItem('user_id')
                }).unwrap();
                message.success('Job onboarding updated successfully');
            } else {
                await createJobOnboarding(data).unwrap();
                message.success('Job onboarding created successfully');
            }

            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Operation failed:', error);
            const errorMessage = error?.data?.message || error?.error?.message || `Failed to ${isEditing ? 'update' : 'create'} job onboarding`;
            message.error(errorMessage);
        }
    };

    const getFieldRules = (fieldName) => {
        if (!isEditing) {
            return [{ required: true, message: `Please enter ${fieldName}` }];
        }
        return []; // No validation rules in edit mode
    };

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
                            {isEditing ? 'Edit Onboarding' : 'Create New Onboarding'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update onboarding information'
                                : 'Fill in the information to create onboarding'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    status: 'pending',
                    salary_type: 'Monthly'
                }}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="Interviewer"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Interviewer {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                            </span>
                        }
                        rules={getFieldRules('interviewer')}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter interviewer"
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
                        name="joining_date"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Joining Date {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                            </span>
                        }
                        rules={getFieldRules('joining date')}
                    >
                        <DatePicker
                            prefix={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Select joining date"
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
                        name="days_of_week"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Days of Week {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                            </span>
                        }
                        rules={getFieldRules('days of week')}
                    >
                        <Input
                            prefix={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter days of week"
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

                    <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="salary"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Expected Salary {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                            </span>
                        }
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
                                        rules={getFieldRules('currency')}
                                    >
                                        <Select
                                            size="large"
                                            style={{
                                                width: '80px',
                                                height: '48px'
                                            }}
                                            loading={currenciesLoading}
                                            className="currency-select"
                                            defaultValue={currencies?.find(c => c.currencyCode === 'INR')?.id}
                                            showSearch
                                            optionFilterProp="children"
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
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span>{currency.currencyIcon}</span>
                                                        <span>{currency.currencyCode}</span>
                                                    </div>
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                            <Form.Item
                                name="salary"
                                noStyle
                                rules={getFieldRules('salary')}
                            >
                                <Input
                                    placeholder="Enter price"
                                    size="large"
                                    style={{
                                        flex: 1,
                                        width: '100%',
                                        border: 'none',
                                        borderLeft: '1px solid #e6e8eb',
                                        borderRadius: 0,
                                        height: '48px',
                                    }}
                                    className="price-input"
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>

                </div>

                    <Form.Item
                        name="salary_type"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Salary Type {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                            </span>
                        }
                        rules={getFieldRules('salary type')}
                    >
                        <Select
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            {salaryTypes.map(type => (
                                <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="salary_duration"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Salary Duration {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                            </span>
                        }
                        rules={getFieldRules('salary duration')}
                    >
                        <Select
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            {salaryDurations.map(duration => (
                                <Option key={duration} value={duration}>{duration}</Option>
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
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            {statuses.map(status => (
                                <Option key={status} value={status}>
                                    {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="job_type"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Job Type {!isEditing && <span style={{ color: '#ff4d4f' }}>*</span>}
                            </span>
                        }
                        rules={getFieldRules('job type')}
                    >
                        <Select
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                            }}
                        >
                            {jobTypes.map(type => (
                                <Option key={type} value={type}>
                                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

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
                        loading={isCreating || isUpdating}
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
                        {isEditing ? 'Update Onboarding' : 'Create Onboarding'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateJobOnboarding; 