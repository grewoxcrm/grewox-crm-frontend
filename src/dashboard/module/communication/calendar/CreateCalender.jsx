import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    TimePicker,
    Typography,
    DatePicker,
    Badge,
    Select,
    message,
    Row,
    Col
} from 'antd';
import {
    FiCalendar,
    FiClock,
    FiX,
    FiTag
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useCreateCalendarEventMutation } from './services/calendarApi';

const { Text } = Typography;
const { Option } = Select;

// Simple label options with colors
const labelOptions = [
    { value: 'personal', label: 'Personal', color: '#1890ff' },
    { value: 'work', label: 'Work', color: '#52c41a' },
    { value: 'important', label: 'Important', color: '#ff4d4f' },
    { value: 'other', label: 'Other', color: '#faad14' }
];

const CreateEvent = ({ open, onCancel, selectedDate }) => {
    const [form] = Form.useForm();
    const [createCalendarEvent, { isLoading }] = useCreateCalendarEventMutation();

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                date: selectedDate ? dayjs(selectedDate) : dayjs(),
                label: 'other',
                color: '#faad14',
                eventType: 'meeting'
            });
        }
    }, [open, selectedDate, form]);

    const handleStartTimeChange = (time) => {
        console.log('Start Time Selected:', time ? time.format('HH:mm:ss') : null);
        form.setFieldsValue({ endDate: null }); // Reset end time when start time changes
        form.validateFields(['endDate']); // Revalidate end time
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            const formattedDate = selectedDate ? 
                dayjs(selectedDate).format('YYYY-MM-DD') : 
                dayjs().format('YYYY-MM-DD');
            
            // Create event data
            const eventData = {
                name: values.name.trim(),
                startDate: dayjs(`${formattedDate} ${values.startDate.format('HH:mm')}`).toISOString(),
                endDate: dayjs(`${formattedDate} ${values.endDate.format('HH:mm')}`).toISOString(),
                label: values.label || 'other',
                color: values.color || '#faad14',
                event_type: 'meeting' // Default event type
            };

           
            // Submit event using the mutation
            try {
                await createCalendarEvent(eventData).unwrap();
                message.success('Event created successfully');
                form.resetFields();
                onCancel();
            } catch (apiError) {
                console.error('API Error:', apiError);
                message.error(apiError?.data?.message || 'Failed to create event');
            }

        } catch (error) {
            console.error('Form validation error:', error);
            if (error.errorFields) {
                error.errorFields.forEach(field => {
                    message.error(`${field.name}: ${field.errors[0]}`);
                });
            } else {
                message.error('Please fill all required fields correctly');
            }
        }
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
                            Create Event
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {selectedDate ? 
                                `Create a new event for ${dayjs(selectedDate).format('MMMM D, YYYY')}` : 
                                'Create a new event'
                            }
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Event Title Field */}
                    <Form.Item
                        name="name"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Event Title</span>}
                        rules={[{ required: true, message: 'Please enter event title' }]}
                        style={{ gridColumn: 'span 2' }}
                    >
                        <Input
                            placeholder="Enter event title"
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                            }}
                        />
                    </Form.Item>

                    {/* Label Field */}
                    <Form.Item
                        name="label"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Label</span>}
                        rules={[{ required: true, message: 'Please select a label' }]}
                    >
                        <Select
                            placeholder="Select label"
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                            }}
                            onChange={(value) => {
                                const selectedOption = labelOptions.find(option => option.value === value);
                                if (selectedOption) {
                                    form.setFieldsValue({ color: selectedOption.color });
                                }
                            }}
                        >
                            {labelOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Badge color={option.color} />
                                        <span style={{ marginLeft: '8px' }}>{option.label}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Time Fields with Validation */}
                    <Row gutter={16} style={{ gridColumn: 'span 2' }}>
                        <Col span={12}>
                            <Form.Item
                                name="startDate"
                                label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Start Time</span>}
                                rules={[{ required: true, message: 'Please select start time' }]}
                            >
                                <TimePicker
                                    size="large"
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        borderRadius: '10px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e6e8eb',
                                    }}
                                    format="HH:mm"
                                    minuteStep={15}
                                    onChange={handleStartTimeChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="endDate"
                                label={<span style={{ fontSize: '14px', fontWeight: '500' }}>End Time</span>}
                                rules={[
                                    { required: true, message: 'Please select end time' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const startTime = getFieldValue('startDate');
                                            if (!value || !startTime || value.isAfter(startTime)) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('End time must be after start time'));
                                        },
                                    }),
                                ]}
                            >
                                <TimePicker
                                    size="large"
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        borderRadius: '10px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e6e8eb',
                                    }}
                                    format="HH:mm"
                                    minuteStep={15}
                                    disabledTime={() => {
                                        const startTime = form.getFieldValue('startDate');
                                        if (!startTime) return {};

                                        return {
                                            disabledHours: () => {
                                                const hours = [];
                                                for (let i = 0; i < startTime.hour(); i++) {
                                                    hours.push(i);
                                                }
                                                return hours;
                                            },
                                            disabledMinutes: (selectedHour) => {
                                                const minutes = [];
                                                if (selectedHour === startTime.hour()) {
                                                    for (let i = 0; i < startTime.minute(); i++) {
                                                        minutes.push(i);
                                                    }
                                                }
                                                return minutes;
                                            }
                                        };
                                    }}
                                    onChange={(time) => {
                                        console.log('End Time Selected:', time ? time.format('HH:mm:ss') : null);
                                        form.setFieldsValue({ endDate: time });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    {/* Hidden color field */}
                    <Form.Item
                        name="color"
                        hidden={true}
                    >
                        <Input type="hidden" />
                    </Form.Item>
                </div>

                {/* Form Actions */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        marginTop: '24px'
                    }}
                >
                    <Button
                        size="large"
                        onClick={onCancel}
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px',
                            height: '48px',
                            border: '1px solid #e6e8eb',
                        }}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={isLoading}
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                            border: 'none',
                        }}
                    >
                        Create Event
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateEvent;