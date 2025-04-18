import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Button,
    Typography,
    Select,
    Divider,
    message,
    DatePicker,
} from 'antd';
import { FiPackage, FiX, FiCalendar, FiToggleRight, FiDollarSign } from 'react-icons/fi';
import { useGetAllPlansQuery } from '../plans/services/planApi';
import { useAssignPlanMutation } from './services/companyApi';
import moment from 'moment';

const { Text } = Typography;
const { Option } = Select;

const CreateUpgradePlan = ({ open, onCancel, companyId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            form.resetFields();
        }
    }, [open, form]);

    // Handle modal close
    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    // Fetch plans using RTK Query
    const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery({
        page: 1,
        limit: 100,
    });

    // Assign upgrade plan mutation
    const [assignUpgradePlan] = useAssignPlanMutation();

    // Extract plans from the API response
    const plans = React.useMemo(() => {
        if (!plansData?.data) return [];
        return plansData.data.map(plan => ({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            duration: plan.duration
        }));
    }, [plansData]);

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'trial', label: 'Trial' },
    ];

    const paymentStatusOptions = [
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'Unpaid' },
    ];

    const handleSubmit = async (values) => {
        try {
            if (!companyId) {
                message.error('Company ID is required');
                return;
            }

            setLoading(true);

            const formattedValues = {
                client_id: companyId,
                plan_id: values.plan,
                start_date: values.startDate.format('YYYY-MM-DD'),
                end_date: values.endDate.format('YYYY-MM-DD'),
                status: values.status,
                payment_status: values.paymentStatus
            };

            const response = await assignUpgradePlan(formattedValues).unwrap();

            if (response.success) {
                message.success('Upgrade plan assigned successfully');
                form.resetFields();
                handleCancel();
            } else {
                throw new Error(response.message || 'Failed to assign upgrade plan');
            }
        } catch (error) {
            console.error('Error details:', error);
            message.error(error?.data?.message || 'Failed to assign upgrade plan');
        } finally {
            setLoading(false);
        }
    };

    // Validate end date should be after start date
    const validateEndDate = (_, value) => {
        const startDate = form.getFieldValue('startDate');
        if (startDate && value && value.isBefore(startDate)) {
            return Promise.reject('End date should be after start date');
        }
        return Promise.resolve();
    };

    // Add these functions back
    const calculateEndDate = (startDate, duration) => {
        if (!startDate || !duration) return null;

        if (duration.toLowerCase() === 'lifetime') {
            return moment(startDate).add(100, 'years');
        }

        let endDate = moment(startDate);
        const durationMatch = duration.match(/^(\d+)\s*(Month|Year)s?$/i);

        if (durationMatch) {
            const value = parseInt(durationMatch[1], 10);
            const unit = durationMatch[2].toLowerCase();

            switch (unit) {
                case 'month':
                    endDate = endDate.add(value, 'months');
                    break;
                case 'year':
                    endDate = endDate.add(value, 'years');
                    break;
                default:
                    break;
            }
        }

        return endDate;
    };

    // Handle plan selection to auto-calculate end date
    const handlePlanChange = (planId) => {
        const selectedPlan = plans.find(p => p.id === planId);
        const startDate = form.getFieldValue('startDate');

        if (selectedPlan && startDate) {
            const endDate = calculateEndDate(startDate, selectedPlan.duration);
            form.setFieldValue('endDate', endDate);
        }
    };

    // Handle start date change to auto-calculate end date
    const handleStartDateChange = (date) => {
        const planId = form.getFieldValue('plan');
        const selectedPlan = plans.find(p => p.id === planId);

        if (selectedPlan && date) {
            const endDate = calculateEndDate(date, selectedPlan.duration);
            form.setFieldValue('endDate', endDate);
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={520}
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
                    onClick={handleCancel}
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
                        transition: 'all 0.3s ease'
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
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
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
                        <FiPackage style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            Create Upgrade Plan
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            Fill in the plan information
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                style={{ padding: '24px' }}
            >
                <Form.Item
                    name="plan"
                    label={
                        <span>
                            Plan
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select a plan' }]}
                >
                    <Select
                        placeholder="Select Plan"
                        size="large"
                        loading={plansLoading}
                        onChange={handlePlanChange}
                        style={{
                            width: '100%',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        dropdownStyle={{
                            padding: '8px',
                            borderRadius: '10px',
                        }}
                        prefix={<FiPackage style={{ color: '#1890ff', fontSize: '16px' }} />}
                    >
                        {plans.map(plan => (
                            <Option key={plan.id} value={plan.id}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 500 }}>{plan.name}</span>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="startDate"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Start Date
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select start date' }]}
                >
                    <DatePicker
                        style={{
                            width: '100%',
                            height: '48px',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                        }}
                        format="DD-MM-YYYY"
                        placeholder="dd-mm-yyyy"
                        suffixIcon={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                        onChange={handleStartDateChange}
                    />
                </Form.Item>

                <Form.Item
                    name="endDate"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            End Date
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select end date' }]}
                >
                    <DatePicker
                        style={{
                            width: '100%',
                            height: '48px',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                        }}
                        format="DD-MM-YYYY"
                        placeholder="dd-mm-yyyy"
                        suffixIcon={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                        disabled={true}
                    />
                </Form.Item>

                <Form.Item
                    name="status"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Status
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select status' }]}
                >
                    <Select
                        placeholder="Select Status"
                        size="large"
                        style={{
                            width: '100%',
                            height: '48px',
                        }}
                    >
                        {statusOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="paymentStatus"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Payment Status
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select payment status' }]}
                >
                    <Select
                        placeholder="Select Payment Status"
                        size="large"
                        style={{
                            width: '100%',
                            height: '48px',
                        }}
                        suffixIcon={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                    >
                        {paymentStatusOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Divider style={{ margin: '24px 0' }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <Button
                        size="large"
                        onClick={handleCancel}
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
                        Create Upgrade Plan
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateUpgradePlan;