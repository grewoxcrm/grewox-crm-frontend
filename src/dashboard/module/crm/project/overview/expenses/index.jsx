import React, { useState } from 'react';
import { Card, Table, Button, Tag, Modal, Form, Input, DatePicker, Select, InputNumber, Upload } from 'antd';
import { FiPlus, FiDollarSign, FiCalendar, FiPaperclip, FiTrash2, FiEdit2 } from 'react-icons/fi';
import './expenses.scss';

const ProjectExpenses = ({ project }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Dummy data for demonstration
    const expenses = [
        {
            id: 1,
            description: 'Software Licenses',
            category: 'Software',
            amount: 1200,
            date: '2024-03-15',
            status: 'approved',
            receipt: 'receipt-001.pdf'
        },
        {
            id: 2,
            description: 'Team Lunch Meeting',
            category: 'Meals',
            amount: 250,
            date: '2024-03-18',
            status: 'pending',
            receipt: 'receipt-002.pdf'
        },
        {
            id: 3,
            description: 'Office Supplies',
            category: 'Supplies',
            amount: 180,
            date: '2024-03-20',
            status: 'rejected',
            receipt: 'receipt-003.pdf'
        }
    ];

    const categories = [
        'Software',
        'Hardware',
        'Travel',
        'Meals',
        'Supplies',
        'Services',
        'Other'
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text, record) => (
                <div className="expense-info">
                    <div className="expense-details">
                        <h4>{text}</h4>
                        <Tag>{record.category}</Tag>
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
            title: 'Receipt',
            dataIndex: 'receipt',
            key: 'receipt',
            render: (receipt) => (
                <Button
                    type="link"
                    icon={<FiPaperclip />}
                    onClick={() => handleViewReceipt(receipt)}
                >
                    View Receipt
                </Button>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="action-buttons">
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

    const handleAddExpense = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleEdit = (record) => {
    };

    const handleDelete = (record) => {
    };

    const handleViewReceipt = (receipt) => {
    };

    return (
        <div className="project-expenses">
            <Card
                title="Project Expenses"
                extra={
                    <Button
                        type="primary"
                        icon={<FiPlus />}
                        onClick={handleAddExpense}
                    >
                        Add Expense
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={expenses}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        total: expenses.length,
                        showTotal: (total) => `Total ${total} expenses`
                    }}
                />
            </Card>

            <Modal
                title="Add New Expense"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Add Expense"
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
                        <Input placeholder="Enter expense description" />
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
                            name="category"
                            label="Category"
                            rules={[{ required: true, message: 'Please select category' }]}
                        >
                            <Select placeholder="Select category"
                                listHeight={100}
                                dropdownStyle={{
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollBehavior: 'smooth'
                                }}
                            >
                                {categories.map(category => (
                                    <Select.Option key={category} value={category}>
                                        {category}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <div className="form-row">
                        <Form.Item
                            name="date"
                            label="Date"
                            rules={[{ required: true, message: 'Please select date' }]}
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
                                <Select.Option value="approved">Approved</Select.Option>
                                <Select.Option value="rejected">Rejected</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="receipt"
                        label="Receipt"
                        rules={[{ required: true, message: 'Please upload receipt' }]}
                    >
                        <Upload.Dragger
                            name="receipt"
                            multiple={false}
                            action="/upload.do"
                            onChange={info => {
                            }}
                        >
                            <p className="ant-upload-drag-icon">
                                <FiPaperclip />
                            </p>
                            <p className="ant-upload-text">
                                Click or drag receipt to upload
                            </p>
                        </Upload.Dragger>
                    </Form.Item>

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

export default ProjectExpenses; 