import React, { useState } from 'react';
import { Card, Table, Button, Tag, Modal, Form, Input, DatePicker, Select, InputNumber } from 'antd';
import { FiPlus, FiFileText, FiDollarSign, FiCalendar, FiDownload, FiSend, FiEye } from 'react-icons/fi';
import './invoices.scss';

const ProjectInvoices = ({ project }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Dummy data for demonstration
    const invoices = [
        {
            id: 'INV-2024-001',
            date: '2024-03-15',
            dueDate: '2024-04-15',
            amount: 5000,
            status: 'paid',
            description: 'Project Phase 1 Development',
            client: 'Acme Corporation'
        },
        {
            id: 'INV-2024-002',
            date: '2024-03-20',
            dueDate: '2024-04-20',
            amount: 3500,
            status: 'pending',
            description: 'UI/UX Design Services',
            client: 'Acme Corporation'
        },
        {
            id: 'INV-2024-003',
            date: '2024-03-25',
            dueDate: '2024-04-25',
            amount: 2800,
            status: 'overdue',
            description: 'Additional Feature Development',
            client: 'Acme Corporation'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'overdue':
                return 'error';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Invoice',
            dataIndex: 'id',
            key: 'id',
            render: (text, record) => (
                <div className="invoice-info">
                    <FiFileText className="invoice-icon" />
                    <div className="invoice-details">
                        <h4>{text}</h4>
                        <p>{record.description}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <div className="amount-info">
                    <FiDollarSign />
                    <span>{amount.toLocaleString()}</span>
                </div>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => (
                <div className="date-info">
                    <FiCalendar />
                    <span>{new Date(date).toLocaleDateString()}</span>
                </div>
            ),
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date) => (
                <div className="date-info">
                    <FiCalendar />
                    <span>{new Date(date).toLocaleDateString()}</span>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="action-buttons">
                    <Button
                        type="text"
                        icon={<FiEye />}
                        className="view-button"
                        onClick={() => handleView(record)}
                    />
                    <Button
                        type="text"
                        icon={<FiDownload />}
                        className="download-button"
                        onClick={() => handleDownload(record)}
                    />
                    <Button
                        type="text"
                        icon={<FiSend />}
                        className="send-button"
                        onClick={() => handleSend(record)}
                    />
                </div>
            ),
        },
    ];

    const handleAddInvoice = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            console.log('New invoice values:', values);
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleView = (record) => {
        console.log('View invoice:', record);
    };

    const handleDownload = (record) => {
        console.log('Download invoice:', record);
    };

    const handleSend = (record) => {
        console.log('Send invoice:', record);
    };

    return (
        <div className="project-invoices">
            <Card
                title="Project Invoices"
                extra={
                    <Button
                        type="primary"
                        icon={<FiPlus />}
                        onClick={handleAddInvoice}
                    >
                        Create Invoice
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={invoices}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        total: invoices.length,
                        showTotal: (total) => `Total ${total} invoices`
                    }}
                />
            </Card>

            <Modal
                title="Create New Invoice"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Create Invoice"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input placeholder="Enter invoice description" />
                    </Form.Item>

                    <div className="form-row">
                        <Form.Item
                            name="amount"
                            label="Amount"
                            rules={[{ required: true, message: 'Please enter amount' }]}
                        >
                            <InputNumber
                                prefix={<FiDollarSign />}
                                style={{ width: '100%' }}
                                placeholder="Enter amount"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="date"
                            label="Invoice Date"
                            rules={[{ required: true, message: 'Please select date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <div className="form-row">
                        <Form.Item
                            name="dueDate"
                            label="Due Date"
                            rules={[{ required: true, message: 'Please select due date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select placeholder="Select status">
                                <Select.Option value="pending">Pending</Select.Option>
                                <Select.Option value="paid">Paid</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <Input.TextArea
                            placeholder="Enter additional notes"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectInvoices; 