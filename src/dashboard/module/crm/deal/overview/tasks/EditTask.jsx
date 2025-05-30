import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Typography, Select, DatePicker, Row, Col, Divider, Upload, message } from 'antd';
import { FiCheckSquare, FiX, FiCalendar, FiFlag, FiMapPin, FiUser, FiUpload } from 'react-icons/fi';
import moment from 'moment';
import { useUpdateTaskMutation } from '../../../task/services/taskApi';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditTask = ({ open, onCancel, onSubmit, initialValues, users = [] }) => {

    const [form] = Form.useForm();
    const [updateTask, { isLoading }] = useUpdateTaskMutation();
    const [fileList, setFileList] = useState([]);

    const filterAssignTo = (assignTo) => {
        try {
            // Handle string JSON case
            if (typeof assignTo === 'string') {
                const parsed = JSON.parse(assignTo);
                return parsed?.assignedusers || [];
            }

            // Handle object case
            if (assignTo?.assignedusers) {
                return assignTo.assignedusers;
            }

            return [];
        } catch (error) {
            console.error('Error parsing assignTo:', error);
            return Array.isArray(assignTo) ? assignTo : [];
        }
    };

    useEffect(() => {
        if (initialValues) {

            const formattedValues = {
                taskName: initialValues.taskName || '',
                task_reporter: initialValues.task_reporter || '',
                startDate: initialValues.startDate ? moment(initialValues.startDate) : null,
                dueDate: initialValues.dueDate ? moment(initialValues.dueDate) : null,
                reminder_date: initialValues.reminder_date ? moment(initialValues.reminder_date) : null,
                priority: initialValues.priority || '',
                status: initialValues.status || '',
                description: initialValues.description || '',
                assignTo: filterAssignTo(initialValues.assignTo),
            };

            form.setFieldsValue(formattedValues);
        }
    }, [initialValues, form]);

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();

            // Basic task data
            formData.append("taskName", values.taskName);
            formData.append("task_reporter", values.task_reporter);
            formData.append("startDate", values.startDate?.format("YYYY-MM-DD"));
            formData.append("dueDate", values.dueDate?.format("YYYY-MM-DD"));
            formData.append("reminder_date", values.reminder_date?.format("YYYY-MM-DD"));
            formData.append("priority", values.priority);
            formData.append("status", values.status);
            formData.append("description", values.description);

            // Handle assignTo array
            if (Array.isArray(values.assignTo)) {
                values.assignTo.forEach((userId, index) => {
                    formData.append(`assignTo[assignedusers][${index}]`, userId);
                });
            }

            // Handle file upload
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append("file", fileList[0].originFileObj);
            }

            const response = await updateTask({
                id: initialValues.id,
                data: formData
            }).unwrap();

            message.success('Task updated successfully');
            form.resetFields();
            setFileList([]);
            onSubmit?.(response);
            onCancel();
        } catch (error) {
            console.error('Update Error:', error);
            message.error(error?.data?.message || 'Failed to update task');
        }
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
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
                    background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                        <FiCheckSquare style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{ margin: '0', fontSize: '24px', fontWeight: '600', color: '#ffffff' }}>
                            Edit Task
                        </h2>
                        <Text style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)' }}>
                            Update task information
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
                    name="taskName"
                    label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Task Name</span>}
                    rules={[
                        { required: true, message: 'Please enter task name' },
                        { max: 100, message: 'Task name cannot exceed 100 characters' }
                    ]}
                >
                    <Input
                        prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter task name"
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

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="startDate"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Start Date</span>}
                            rules={[{ required: true, message: 'Please select start date' }]}
                        >
                            <DatePicker
                                size="large"
                                format="YYYY-MM-DD"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                                suffixIcon={<FiCalendar style={{ color: '#1890ff' }} />}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="dueDate"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Due Date</span>}
                            rules={[{ required: true, message: 'Please select due date' }]}
                        >
                            <DatePicker
                                size="large"
                                format="YYYY-MM-DD"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                                suffixIcon={<FiCalendar style={{ color: '#1890ff' }} />}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="priority"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Priority</span>}
                            rules={[{ required: true, message: 'Please select priority' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select priority"
                                style={{ width: '100%', borderRadius: '10px' }}
                                suffixIcon={<FiFlag style={{ color: '#1890ff' }} />}
                            >
                                <Option value="High">High</Option>
                                <Option value="Medium">Medium</Option>
                                <Option value="Low">Low</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="status"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Status</span>}
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select status"
                                style={{ width: '100%', borderRadius: '10px' }}
                            >
                                <Option value="Todo">Todo</Option>
                                <Option value="In Progress">In Progress</Option>
                                <Option value="Completed">Completed</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="assignTo"
                    label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Assign To</span>}
                    rules={[{ required: true, message: 'Please select assignees' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Select assignees"
                        size="large"
                        style={{ width: '100%', borderRadius: '10px' }}
                        suffixIcon={<FiUser style={{ color: '#1890ff' }} />}
                        optionFilterProp="children"
                        showSearch
                    >
                        {users.map(user => (
                            <Option key={user.id} value={user.id}>
                                {user.username || user.email}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="task_reporter"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Task Reporter</span>}
                            rules={[{ required: true, message: 'Please select task reporter' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Select task reporter"
                                size="large"
                                style={{ width: '100%', borderRadius: '10px' }}
                                suffixIcon={<FiUser style={{ color: '#1890ff' }} />}
                                optionFilterProp="children"
                            >
                                {users.map(user => (
                                    <Option key={user.id} value={user.id}>
                                        {user.username || user.email}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="reminder_date"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Reminder Date</span>}
                        >
                            <DatePicker
                                size="large"
                                format="YYYY-MM-DD"
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                                suffixIcon={<FiCalendar style={{ color: '#1890ff' }} />}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="description"
                    label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Description</span>}
                >
                    <TextArea
                        placeholder="Enter task description"
                        rows={4}
                        style={{
                            borderRadius: '10px',
                            padding: '12px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="file"
                    label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Task File</span>}
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                        if (Array.isArray(e)) {
                            return e;
                        }
                        return e?.fileList;
                    }}
                >
                    <Upload
                        maxCount={1}
                        fileList={fileList}
                        onChange={handleFileChange}
                        beforeUpload={(file) => {
                            const isValidFileType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
                            const isValidFileSize = file.size / 1024 / 1024 < 5;

                            if (!isValidFileType) {
                                message.error('You can only upload JPG/PNG/PDF files!');
                                return Upload.LIST_IGNORE;
                            }
                            if (!isValidFileSize) {
                                message.error('File must be smaller than 5MB!');
                                return Upload.LIST_IGNORE;
                            }

                            return false;
                        }}
                        customRequest={({ onSuccess }) => {
                            onSuccess('ok');
                        }}
                    >
                        <Button
                            icon={<FiUpload style={{ marginRight: '8px' }} />}
                            style={{
                                width: '100%',
                                height: '48px',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            Click to Upload File
                        </Button>
                    </Upload>
                </Form.Item>

                <Divider style={{ margin: '24px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
                        Update Task
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditTask;