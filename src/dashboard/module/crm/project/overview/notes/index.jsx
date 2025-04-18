import React, { useState } from 'react';
import { Card, List, Button, Modal, Form, Input, Tag, Tooltip, Avatar } from 'antd';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiUser } from 'react-icons/fi';
import './notes.scss';

const ProjectNotes = ({ project }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Dummy data for demonstration
    const notes = [
        {
            id: 1,
            title: 'Client Meeting Notes',
            content: 'Discussed project requirements and timeline. Client emphasized the importance of mobile responsiveness.',
            category: 'meeting',
            createdBy: {
                name: 'John Doe',
                avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
            },
            createdAt: '2024-03-15T10:30:00'
        },
        {
            id: 2,
            title: 'Design Review Feedback',
            content: 'UI color scheme needs adjustment. Navigation structure approved. Need to improve mobile menu.',
            category: 'design',
            createdBy: {
                name: 'Jane Smith',
                avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
            },
            createdAt: '2024-03-16T14:20:00'
        },
        {
            id: 3,
            title: 'Technical Implementation Notes',
            content: 'API integration plan outlined. Need to implement caching for better performance.',
            category: 'technical',
            createdBy: {
                name: 'Mike Johnson',
                avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
            },
            createdAt: '2024-03-17T09:15:00'
        }
    ];

    const categories = [
        { value: 'meeting', color: '#1890ff', label: 'Meeting' },
        { value: 'design', color: '#722ed1', label: 'Design' },
        { value: 'technical', color: '#52c41a', label: 'Technical' },
        { value: 'general', color: '#faad14', label: 'General' }
    ];

    const getCategoryColor = (category) => {
        const found = categories.find(c => c.value === category);
        return found ? found.color : '#d9d9d9';
    };

    const handleAddNote = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            console.log('New note values:', values);
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleEdit = (record) => {
        console.log('Edit note:', record);
    };

    const handleDelete = (record) => {
        console.log('Delete note:', record);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="project-notes">
            <Card
                title="Project Notes"
                extra={
                    <Button
                        type="primary"
                        icon={<FiPlus />}
                        onClick={handleAddNote}
                    >
                        Add Note
                    </Button>
                }
            >
                <List
                    itemLayout="vertical"
                    dataSource={notes}
                    renderItem={note => (
                        <List.Item
                            key={note.id}
                            actions={[
                                <div className="note-meta" key="meta">
                                    <span className="created-by">
                                        <FiUser />
                                        <Avatar src={note.createdBy.avatar} size="small" />
                                        {note.createdBy.name}
                                    </span>
                                    <span className="created-at">
                                        <FiClock />
                                        {formatDate(note.createdAt)}
                                    </span>
                                </div>,
                                <div className="note-actions" key="actions">
                                    <Button
                                        type="text"
                                        icon={<FiEdit2 />}
                                        className="edit-button"
                                        onClick={() => handleEdit(note)}
                                    />
                                    <Button
                                        type="text"
                                        icon={<FiTrash2 />}
                                        className="delete-button"
                                        onClick={() => handleDelete(note)}
                                    />
                                </div>
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <div className="note-header">
                                        <h4>{note.title}</h4>
                                        <Tag color={getCategoryColor(note.category)}>
                                            {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                                        </Tag>
                                    </div>
                                }
                                description={note.content}
                            />
                        </List.Item>
                    )}
                />
            </Card>

            <Modal
                title="Add New Note"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Add Note"
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
                        <Input placeholder="Enter note title" />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: 'Please select category' }]}
                    >
                        <Input.Group>
                            {categories.map(category => (
                                <Tooltip title={category.label} key={category.value}>
                                    <Tag
                                        className={`category-tag ${form.getFieldValue('category') === category.value ? 'selected' : ''}`}
                                        color={category.color}
                                        onClick={() => form.setFieldsValue({ category: category.value })}
                                    >
                                        {category.label}
                                    </Tag>
                                </Tooltip>
                            ))}
                        </Input.Group>
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Content"
                        rules={[{ required: true, message: 'Please enter content' }]}
                    >
                        <Input.TextArea
                            placeholder="Enter note content"
                            rows={6}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectNotes; 