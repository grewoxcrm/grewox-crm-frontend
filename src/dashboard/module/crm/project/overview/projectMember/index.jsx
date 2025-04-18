import React, { useState } from 'react';
import { Card, Avatar, Button, Table, Tag, Modal, Form, Select, Input } from 'antd';
import { FiUserPlus, FiMail, FiPhone, FiBriefcase, FiTrash2, FiEdit2 } from 'react-icons/fi';
import './projectMember.scss';

const ProjectMember = ({ project }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Dummy data for demonstration
    const members = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 234 567 890',
            role: 'Project Manager',
            status: 'active',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1 234 567 891',
            role: 'Developer',
            status: 'active',
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            phone: '+1 234 567 892',
            role: 'Designer',
            status: 'inactive',
            avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
        }
    ];

    const columns = [
        {
            title: 'Member',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <div className="member-info">
                    <Avatar src={record.avatar} size={40} />
                    <div className="member-details">
                        <h4>{record.name}</h4>
                        <span>{record.email}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color="blue">{role}</Tag>
            ),
        },
        {
            title: 'Contact',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => (
                <div className="contact-info">
                    <FiPhone className="icon" />
                    <span>{phone}</span>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'success' : 'error'}>
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
                        icon={<FiEdit2 />}
                        className="edit-button"
                    />
                    <Button
                        type="text"
                        icon={<FiTrash2 />}
                        className="delete-button"
                    />
                </div>
            ),
        },
    ];

    const handleAddMember = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            console.log('New member values:', values);
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    return (
        <div className="project-member">
            <Card
                title="Project Members"
                extra={
                    <Button
                        type="primary"
                        icon={<FiUserPlus />}
                        onClick={handleAddMember}
                    >
                        Add Member
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={members}
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            <Modal
                title="Add New Member"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Add Member"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input prefix={<FiBriefcase />} placeholder="Enter name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter valid email' }
                        ]}
                    >
                        <Input prefix={<FiMail />} placeholder="Enter email" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select role' }]}
                    >
                        <Select placeholder="Select role">
                            <Select.Option value="Project Manager">Project Manager</Select.Option>
                            <Select.Option value="Developer">Developer</Select.Option>
                            <Select.Option value="Designer">Designer</Select.Option>
                            <Select.Option value="QA Engineer">QA Engineer</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone"
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                        <Input prefix={<FiPhone />} placeholder="Enter phone number" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectMember;
