import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Select,
    DatePicker,
    Upload,
    message,
    Spin
} from 'antd';
import { FiUser, FiMail, FiPhone, FiX, FiUpload } from 'react-icons/fi';
import { useCreateTicketMutation, useUpdateTicketMutation } from './services/ticketApi';
import { useGetEmployeesQuery } from '../../hrm/Employee/services/employeeApi';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
];

const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
];

const CreateTicket = ({ open, onCancel, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
    const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
    
    const { data: employeesData, isLoading: isLoadingEmployees, error: employeesError } = useGetEmployeesQuery();
    
    const employees = React.useMemo(() => {
        if (!employeesData) return [];
        return Array.isArray(employeesData) 
            ? employeesData 
            : employeesData.data || [];
    }, [employeesData]);
    
    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) {
                form.setFieldsValue(initialValues);
            }
        }
    }, [open, form, initialValues]);

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
            
            const { attachment, ...otherValues } = values;

            if (attachment?.fileList?.[0]?.originFileObj) {
                formData.append('file', attachment.fileList[0].originFileObj);
            }

            const payload = {
                ...otherValues,
                ticketSubject: values.subject,
                status: values.status || 'open',
                requestor: values.requestor
            };

            console.log('Submitting ticket with payload:', payload);

            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            if (isEditing) {
                await updateTicket({
                    id: initialValues.id,
                    data: formData
                }).unwrap();
                message.success('Ticket updated successfully');
            } else {
                await createTicket(formData).unwrap();
                message.success('Ticket created successfully');
            }

            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Operation failed:', error);
            message.error(error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} ticket`);
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
                            {isEditing ? 'Edit Ticket' : 'Create New Ticket'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update ticket information'
                                : 'Fill in the information to create a support ticket'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ ...initialValues, status: 'open', priority: 'medium' }}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="subject"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Subject</span>}
                        rules={[{ required: true, message: 'Please enter subject' }]}
                    >
                        <Input
                            placeholder="Enter ticket subject"
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
                        name="requestor"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Requestor</span>}
                        rules={[{ required: true, message: 'Please select an employee as requestor' }]}
                    >
                        <Select
                            placeholder="Select employee"
                            size="large"
                            loading={isLoadingEmployees}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
                            }
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                            }}
                        >
                            {employees.map(employee => (
                                <Option key={employee.id} value={employee.id}>
                                    {employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Priority</span>}
                        rules={[{ required: true, message: 'Please select priority' }]}
                        initialValue="medium"
                    >
                        <Select
                            placeholder="Select priority"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px'
                            }}
                        >
                            {priorityOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="agent"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Agent</span>}
                    >
                        <Input
                            placeholder="Enter agent"
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

                    {isEditing && (
                        <Form.Item
                            name="status"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Status</span>}
                            rules={[{ required: true, message: 'Please select status' }]}
                            initialValue="open"
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
                    )}
                </div>

                <Form.Item
                    name="description"
                    label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Description</span>}
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <TextArea
                        placeholder="Enter detailed description of your issue"
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

                <Form.Item
                    name="attachment"
                    label="Attachment"
                    className="full-width"
                >
                    <Upload.Dragger
                        name="attachment"
                        multiple={false}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    >
                        <p className="ant-upload-drag-icon">
                            <FiUpload style={{ fontSize: '24px', color: '#1890ff' }} />
                        </p>
                        <p className="ant-upload-text">Click or drag file to upload</p>
                        <p className="ant-upload-hint">
                            Support for PDF, DOC, DOCX, JPG, JPEG, PNG files
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

export default CreateTicket;
