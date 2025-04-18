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
import { useCreateTaskCalendarEventMutation } from './services/taskCalender';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Task type options with colors
const taskTypeOptions = [
    { value: 'task', label: 'Task', color: '#1890ff' },
    { value: 'meeting', label: 'Meeting', color: '#52c41a' },
    { value: 'reminder', label: 'Reminder', color: '#faad14' }
];

const CreateTaskCalendar = ({ open, onCancel, selectedDate }) => {
    const [form] = Form.useForm();
    const [createTaskCalendarEvent, { isLoading }] = useCreateTaskCalendarEventMutation();

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                date: selectedDate ? dayjs(selectedDate) : dayjs(),
                taskType: 'task',
                color: '#1890ff'
            });
        }
    }, [open, selectedDate, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            const formattedDate = selectedDate ? 
                dayjs(selectedDate).format('YYYY-MM-DD') : 
                dayjs().format('YYYY-MM-DD');
                
            // Create task data
            const taskData = {
                taskName: values.taskName.trim(),
                taskDate: formattedDate,
                taskTime: values.start_time.format('HH:mm'),
                taskDescription: values.taskDescription?.trim() || '',
                taskType: values.taskType || 'task',
                color: values.color || '#1890ff'
            };

            console.log('Submitting task:', taskData);

            // Submit task using API mutation
            try {
                await createTaskCalendarEvent(taskData).unwrap();
                message.success('Task created successfully');
                form.resetFields();
                onCancel();
            } catch (apiError) {
                console.error('API Error:', apiError);
                message.error(apiError?.data?.message || 'Failed to create task');
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
                            Create Task
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {selectedDate ? 
                                `Create a new task for ${dayjs(selectedDate).format('MMMM D, YYYY')}` : 
                                'Create a new task'
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
                    {/* Task Title Field */}
                    <Form.Item
                        name="taskName"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Task Title</span>}
                        rules={[{ required: true, message: 'Please enter task title' }]}
                        style={{ gridColumn: 'span 2' }}
                    >
                        <Input
                            placeholder="Enter task title"
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                            }}
                        />
                    </Form.Item>

                    {/* Task Type Field */}
                    <Form.Item
                        name="taskType"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Task Type</span>}
                        rules={[{ required: true, message: 'Please select a task type' }]}
                    >
                        <Select
                            placeholder="Select task type"
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                            }}
                            onChange={(value) => {
                                const selectedOption = taskTypeOptions.find(option => option.value === value);
                                if (selectedOption) {
                                    form.setFieldsValue({ color: selectedOption.color });
                                }
                            }}
                        >
                            {taskTypeOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Badge color={option.color} />
                                        <span style={{ marginLeft: '8px' }}>{option.label}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Start Time Field */}
                    <Form.Item
                        name="start_time"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Task Time</span>}
                        rules={[{ required: true, message: 'Please select task time' }]}
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
                        />
                    </Form.Item>

                    <Form.Item
                        name="taskDescription"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Task Description</span>}
                        rules={[{ required: true, message: 'Please enter task description' }]}
                        style={{ gridColumn: 'span 2' }}
                    >
                        <TextArea
                            placeholder="Enter task description"
                            size="large"
                            rows={4}
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                            }}
                        />
                    </Form.Item>
                    
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
                        Create Task
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateTaskCalendar;