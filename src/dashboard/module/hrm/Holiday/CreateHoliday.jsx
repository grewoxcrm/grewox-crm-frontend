import React from 'react';
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
import { FiCalendar, FiFileText, FiX } from 'react-icons/fi';
import { useCreateHolidayMutation } from './services/holidayApi';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

const CreateHoliday = ({ open, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    
    // API hooks
    const [createHoliday, { isLoading: isCreating }] = useCreateHolidayMutation();

    const handleSubmit = async (values) => {
        try {
            // Convert dates to ISO string format
            const formattedValues = {
                ...values,
                start_date: values.start_date?.toISOString(),
                end_date: values.end_date?.toISOString()
            };

            const response = await createHoliday(formattedValues).unwrap();
            message.success('Holiday created successfully');
            form.resetFields();
            onCancel(); // Close the modal
            if (onSubmit) {
                onSubmit(response);
            }
        } catch (error) {
            console.error('Failed to create holiday:', error);
            message.error(error?.data?.message || 'Failed to create holiday');
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
                        <FiCalendar style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            Create New Holiday
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            Fill in the information to create holiday
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
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Holiday Name
                        </span>
                    }
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
                            transition: 'all 0.3s ease',
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="leave_type"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Leave Type
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select leave type' }]}
                >
                    <Select
                        placeholder="Select leave type"
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
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Start Date
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select start date' }]}
                >
                    <DatePicker
                        suffix={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Select start date"
                        size="large"
                        format="DD-MM-YYYY"
                        style={{
                            width: '100%',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="end_date"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            End Date
                        </span>
                    }
                    rules={[
                        { required: true, message: 'Please select end date' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || !getFieldValue('start_date')) {
                                    return Promise.resolve();
                                }
                                if (dayjs(value).isSameOrAfter(dayjs(getFieldValue('start_date')))) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('End date must be after start date'));
                            },
                        }),
                    ]}
                >
                    <DatePicker
                        placeholder="Select end date"
                        size="large"
                        format="DD-MM-YYYY"
                        style={{
                            width: '100%',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
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
                        loading={isCreating}
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
                        Create Holiday
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateHoliday;
