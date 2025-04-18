import React, { useState } from 'react';
import { Card, Table, Button, Tag, Modal, Form, Input, Select, DatePicker, Avatar, Tooltip } from 'antd';
import { FiPlus, FiCheckSquare, FiCalendar, FiClock, FiUser, FiFlag } from 'react-icons/fi';
import './tasks.scss';

const ProjectTasks = ({ project }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Dummy data for demonstration
    const tasks = [
        {
            id: 1,
            title: 'Design System Implementation',
            description: 'Implement the new design system components',
            assignee: {
                name: 'John Doe',
                avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
            },
            dueDate: '2024-04-01',
            priority: 'high',
            status: 'in-progress',
            milestone: 'Design Phase'
        },
        {
            id: 2,
            title: 'API Integration',
            description: 'Integrate backend APIs with frontend',
            assignee: {
                name: 'Jane Smith',
                avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
            },
            dueDate: '2024-04-15',
            priority: 'medium',
            status: 'pending',
            milestone: 'Development Phase'
        },
        {
            id: 3,
            title: 'User Testing',
            description: 'Conduct user testing sessions',
            assignee: {
                name: 'Mike Johnson',
                avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
            },
            dueDate: '2024-04-30',
            priority: 'low',
            status: 'completed',
            milestone: 'Testing Phase'
        }
    ];

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return '#f5222d';
            case 'medium':
                return '#faad14';
            case 'low':
                return '#52c41a';
            default:
                return '#1890ff';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in-progress':
                return 'processing';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Task',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div className="task-info">
                    <div className="task-title">
                        <h4>{text}</h4>
                        <p>{record.description}</p>
                    </div>
                    <Tag color={getPriorityColor(record.priority)} className="priority-tag">
                        {record.priority.toUpperCase()}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Assignee',
            dataIndex: 'assignee',
            key: 'assignee',
            render: (assignee) => (
                <div className="assignee-info">
                    <Avatar src={assignee.avatar} size={32} />
                    <span>{assignee.name}</span>
                </div>
            ),
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date) => (
                <div className="due-date">
                    <FiCalendar />
                    <span>{new Date(date).toLocaleDateString()}</span>
                </div>
            ),
        },
        {
            title: 'Milestone',
            dataIndex: 'milestone',
            key: 'milestone',
            render: (milestone) => (
                <div className="milestone-info">
                    <FiFlag />
                    <span>{milestone}</span>
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
        }
    ];

    const handleAddTask = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            console.log('New task values:', values);
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    return (
        <div className="project-tasks">
            <Card
                title="Project Tasks"
                extra={
                    <Button
                        type="primary"
                        icon={<FiPlus />}
                        onClick={handleAddTask}
                    >
                        Add Task
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={tasks}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        total: tasks.length,
                        showTotal: (total) => `Total ${total} tasks`
                    }}
                />
            </Card>

            <Modal
                title="Add New Task"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Add Task"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter task title' }]}
                    >
                        <Input prefix={<FiCheckSquare />} placeholder="Enter task title" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea
                            placeholder="Enter task description"
                            rows={4}
                        />
                    </Form.Item>

                    <Form.Item
                        name="assignee"
                        label="Assignee"
                        rules={[{ required: true, message: 'Please select assignee' }]}
                    >
                        <Select placeholder="Select assignee">
                            <Select.Option value="john">John Doe</Select.Option>
                            <Select.Option value="jane">Jane Smith</Select.Option>
                            <Select.Option value="mike">Mike Johnson</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dueDate"
                        label="Due Date"
                        rules={[{ required: true, message: 'Please select due date' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Priority"
                        rules={[{ required: true, message: 'Please select priority' }]}
                    >
                        <Select placeholder="Select priority">
                            <Select.Option value="high">High</Select.Option>
                            <Select.Option value="medium">Medium</Select.Option>
                            <Select.Option value="low">Low</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="milestone"
                        label="Milestone"
                        rules={[{ required: true, message: 'Please select milestone' }]}
                    >
                        <Select placeholder="Select milestone">
                            <Select.Option value="design">Design Phase</Select.Option>
                            <Select.Option value="development">Development Phase</Select.Option>
                            <Select.Option value="testing">Testing Phase</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select placeholder="Select status">
                            <Select.Option value="pending">Pending</Select.Option>
                            <Select.Option value="in-progress">In Progress</Select.Option>
                            <Select.Option value="completed">Completed</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectTasks; 