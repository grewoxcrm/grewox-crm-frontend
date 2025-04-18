import React, { useState } from 'react';
import { Card, Timeline, Button, Modal, Form, Input, DatePicker, Select, Progress, Tag } from 'antd';
import { FiPlus, FiFlag, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import './milestones.scss';

const ProjectMilestones = ({ project }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Dummy data for demonstration
    const milestones = [
        {
            id: 1,
            title: 'Project Planning Phase',
            description: 'Complete project planning and documentation',
            dueDate: '2024-04-01',
            status: 'completed',
            progress: 100,
        },
        {
            id: 2,
            title: 'Design Phase',
            description: 'Complete UI/UX design and prototypes',
            dueDate: '2024-04-15',
            status: 'in-progress',
            progress: 65,
        },
        {
            id: 3,
            title: 'Development Phase',
            description: 'Complete core development features',
            dueDate: '2024-05-01',
            status: 'pending',
            progress: 0,
        },
    ];

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

    const handleAddMilestone = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            console.log('New milestone values:', values);
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    return (
        <div className="project-milestones">
            <Card
                title="Project Milestones"
                extra={
                    <Button
                        type="primary"
                        icon={<FiPlus />}
                        onClick={handleAddMilestone}
                    >
                        Add Milestone
                    </Button>
                }
            >
                <Timeline
                    mode="left"
                    items={milestones.map(milestone => ({
                        dot: <FiFlag className={`timeline-dot ${milestone.status}`} />,
                        children: (
                            <div className="milestone-item">
                                <div className="milestone-header">
                                    <h4>{milestone.title}</h4>
                                    <Tag color={getStatusColor(milestone.status)}>
                                        {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                                    </Tag>
                                </div>
                                <p className="description">{milestone.description}</p>
                                <div className="milestone-info">
                                    <span className="date">
                                        <FiCalendar />
                                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                    </span>
                                    <div className="progress-wrapper">
                                        <Progress
                                            percent={milestone.progress}
                                            size="small"
                                            status={milestone.status === 'completed' ? 'success' : 'active'}
                                        />
                                    </div>
                                </div>
                            </div>
                        ),
                    }))}
                />
            </Card>

            <Modal
                title="Add New Milestone"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Add Milestone"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter milestone title' }]}
                    >
                        <Input prefix={<FiFlag />} placeholder="Enter milestone title" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea
                            placeholder="Enter milestone description"
                            rows={4}
                        />
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

export default ProjectMilestones; 