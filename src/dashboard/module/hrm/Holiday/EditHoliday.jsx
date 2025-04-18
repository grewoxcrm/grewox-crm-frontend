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
    DatePicker,
} from 'antd';
import { FiCalendar, FiEdit2, FiFileText, FiX } from 'react-icons/fi';
import { useUpdateHolidayMutation } from './services/holidayApi';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

const EditHoliday = ({ open, onCancel, onSubmit, initialValues }) => {
    const [form] = Form.useForm();
    const [updateHoliday, { isLoading: isUpdating }] = useUpdateHolidayMutation();

    // Effect to set initial values when editing
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                // Convert string dates to dayjs objects
                start_date: initialValues.start_date ? dayjs(initialValues.start_date) : null,
                end_date: initialValues.end_date ? dayjs(initialValues.end_date) : null
            });
        } else {
            form.resetFields();
        }
    }, [form, initialValues]);

    const handleSubmit = async (values) => {
        try {
            if (!initialValues?.id) {
                message.error('Holiday ID is missing');
                return;
            }

            // Format dates before sending to API
            const formattedValues = {
                ...values,
                start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
                end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null
            };

            const response = await updateHoliday({
                id: initialValues.id,
                data: formattedValues
            }).unwrap();

            message.success('Holiday updated successfully');
            form.resetFields();
            onCancel();
            if (onSubmit) {
                onSubmit(response);
            }
        } catch (error) {
            console.error('Failed to update holiday:', error);
            message.error(error?.data?.message || 'Failed to update holiday');
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={520}
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
                        <FiEdit2 style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            Edit Holiday
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            Update holiday information
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
                    padding: '24px',
                }}
            >
                <Form.Item
                    name="holiday_name"
                    label="Holiday Name"
                    rules={[
                        { required: true, message: 'Please enter holiday name' },
                        { max: 100, message: 'Holiday name cannot exceed 100 characters' }
                    ]}
                >
                    <Input
                        prefix={<FiFileText style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter holiday name"
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
                    name="leave_type"
                    label="Holiday Type"
                    rules={[{ required: true, message: 'Please select holiday type' }]}
                >
                    <Select
                        placeholder="Select holiday type"
                        size="large"
                        style={{
                            width: '100%',
                            borderRadius: '10px',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                        }}
                    >
                        <Option value="paid">Paid</Option>
                        <Option value="unpaid">Unpaid</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="start_date"
                    label="Start Date"
                    prefix={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                    rules={[
                        { required: true, message: 'Please select start date' },
                        {
                            validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                if (dayjs.isDayjs(value)) return Promise.resolve();
                                return Promise.reject(new Error('Invalid date'));
                            }
                        }
                    ]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        placeholder="Select start date"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="end_date"
                    label="End Date"
                    rules={[
                        { required: true, message: 'Please select end date' },
                        {
                            validator: async (_, value) => {
                                if (!value) return Promise.resolve();
                                if (!dayjs.isDayjs(value)) {
                                    return Promise.reject(new Error('Invalid date'));
                                }
                                const startDate = form.getFieldValue('start_date');
                                if (startDate && value.isBefore(startDate)) {
                                    return Promise.reject(new Error('End date must be after start date'));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        placeholder="Select end date"
                        size="large"
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
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={isUpdating}
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                        }}
                    >
                        Update Holiday
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditHoliday;
