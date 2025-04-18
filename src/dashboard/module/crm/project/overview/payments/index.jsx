import React, { useState } from 'react';
import { Card, Table, Button, Tag, Modal, Form, Input, DatePicker, InputNumber, Select } from 'antd';
import { FiPlus, FiCreditCard, FiDollarSign, FiCalendar, FiFileText, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './payments.scss';

const ProjectPayments = ({ project }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Dummy data for demonstration
    const payments = [
        {
            id: 'PAY-2024-001',
            invoiceId: 'INV-2024-001',
            amount: 5000,
            date: '2024-03-15',
            method: 'credit_card',
            status: 'completed',
            reference: 'TXN123456'
        },
        {
            id: 'PAY-2024-002',
            invoiceId: 'INV-2024-002',
            amount: 3500,
            date: '2024-03-20',
            method: 'bank_transfer',
            status: 'pending',
            reference: 'TXN123457'
        },
        {
            id: 'PAY-2024-003',
            invoiceId: 'INV-2024-003',
            amount: 2800,
            date: '2024-03-25',
            method: 'paypal',
            status: 'failed',
            reference: 'TXN123458'
        }
    ];

    const paymentMethods = [
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'cash', label: 'Cash' }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'credit_card':
                return <FiCreditCard />;
            case 'bank_transfer':
                return <FiDollarSign />;
            case 'paypal':
                return <FiDollarSign />;
            default:
                return <FiDollarSign />;
        }
    };

    const columns = [
        {
            title: 'Payment',
            dataIndex: 'id',
            key: 'id',
            render: (text, record) => (
                <div className="payment-info">
                    {getMethodIcon(record.method)}
                    <div className="payment-details">
                        <h4>{text}</h4>
                        <p>Invoice: {record.invoiceId}</p>
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
            title: 'Method',
            dataIndex: 'method',
            key: 'method',
            render: (method) => (
                <Tag>
                    {method.split('_').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                </Tag>
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
                        icon={<FiFileText />}
                        className="receipt-button"
                        onClick={() => handleViewReceipt(record)}
                    />
                    <Button
                        type="text"
                        icon={<FiEdit2 />}
                        className="edit-button"
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        type="text"
                        icon={<FiTrash2 />}
                        className="delete-button"
                        onClick={() => handleDelete(record)}
                    />
                </div>
            ),
        },
    ];

    const handleAddPayment = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            console.log('New payment values:', values);
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleViewReceipt = (record) => {
        console.log('View receipt:', record);
    };

    const handleEdit = (record) => {
        console.log('Edit payment:', record);
    };

    const handleDelete = (record) => {
        console.log('Delete payment:', record);
    };

    return (
        <div className="project-payments">
            <Card
                title="Project Payments"
                extra={
                    <Button
                        type="primary"
                        icon={<FiPlus />}
                        onClick={handleAddPayment}
                    >
                        Add Payment
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={payments}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        total: payments.length,
                        showTotal: (total) => `Total ${total} payments`
                    }}
                />
            </Card>

            <Modal
                title="Add New Payment"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Add Payment"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="invoiceId"
                        label="Invoice"
                        rules={[{ required: true, message: 'Please select invoice' }]}
                    >
                        <Select placeholder="Select invoice">
                            <Select.Option value="INV-2024-001">INV-2024-001</Select.Option>
                            <Select.Option value="INV-2024-002">INV-2024-002</Select.Option>
                            <Select.Option value="INV-2024-003">INV-2024-003</Select.Option>
                        </Select>
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
                            label="Payment Date"
                            rules={[{ required: true, message: 'Please select date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <div className="form-row">
                        <Form.Item
                            name="method"
                            label="Payment Method"
                            rules={[{ required: true, message: 'Please select payment method' }]}
                        >
                            <Select placeholder="Select payment method">
                                {paymentMethods.map(method => (
                                    <Select.Option key={method.value} value={method.value}>
                                        {method.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="reference"
                            label="Reference"
                            rules={[{ required: true, message: 'Please enter reference' }]}
                        >
                            <Input placeholder="Enter payment reference" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <Input.TextArea
                            placeholder="Enter payment notes"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectPayments; 