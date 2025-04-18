import React, { useState } from 'react';
import { Card, Table, Button, Tag, Modal, Form, Input, DatePicker, InputNumber, Select } from 'antd';
import { FiPlus, FiFileText, FiDollarSign, FiCalendar, FiDownload, FiSend, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './estimates.scss';

const ProjectEstimates = ({ project }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Dummy data for demonstration
    const estimates = [
        {
            id: 'EST-2024-001',
            title: 'Initial Project Scope',
            description: 'Project planning and development estimate',
            amount: 15000,
            date: '2024-03-15',
            validUntil: '2024-04-15',
            status: 'approved',
            client: 'Acme Corporation'
        },
        {
            id: 'EST-2024-002',
            title: 'Additional Features',
            description: 'Estimate for additional feature development',
            amount: 8500,
            date: '2024-03-20',
            validUntil: '2024-04-20',
            status: 'pending',
            client: 'Acme Corporation'
        },
        {
            id: 'EST-2024-003',
            title: 'Maintenance Contract',
            description: 'Annual maintenance and support estimate',
            amount: 12000,
            date: '2024-03-25',
            validUntil: '2024-04-25',
            status: 'draft',
            client: 'Acme Corporation'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'draft':
                return 'default';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Estimate',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div className="estimate-info">
                    <FiFileText className="estimate-icon" />
                    <div className="estimate-details">
                        <h4>{record.id}</h4>
                        <p>{text}</p>
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
            title: 'Valid Until',
            dataIndex: 'validUntil',
            key: 'validUntil',
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

    const handleAddEstimate = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleDownload = (record) => {
    };

    const handleSend = (record) => {
    };

    const handleEdit = (record) => {
    };

    const handleDelete = (record) => {
    };

    return (
        <div className="project-estimates">
            <Card
                title="Project Estimates"
                extra={
                    <Button
                        type="primary"
                        icon={<FiPlus />}
                        onClick={handleAddEstimate}
                    >
                        Create Estimate
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={estimates}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        total: estimates.length,
                        showTotal: (total) => `Total ${total} estimates`
                    }}
                />
            </Card>

            <Modal
                title="Create New Estimate"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Create Estimate"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter title' }]}
                    >
                        <Input placeholder="Enter estimate title" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea
                            placeholder="Enter estimate description"
                            rows={4}
                        />
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
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select placeholder="Select status">
                                <Select.Option value="draft">Draft</Select.Option>
                                <Select.Option value="pending">Pending</Select.Option>
                                <Select.Option value="approved">Approved</Select.Option>
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
                            name="validUntil"
                            label="Valid Until"
                            rules={[{ required: true, message: 'Please select validity date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="terms"
                        label="Terms and Conditions"
                    >
                        <Input.TextArea
                            placeholder="Enter terms and conditions"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectEstimates; 