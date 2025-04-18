import React, { useState } from 'react';
import { Card, Table, Button, Tag, Upload, Modal, Form, Input, Select } from 'antd';
import { FiUpload, FiDownload, FiTrash2, FiFile, FiImage, FiFileText } from 'react-icons/fi';
import './files.scss';

const ProjectFiles = ({ project }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Dummy data for demonstration
    const files = [
        {
            id: 1,
            name: 'Project Requirements.pdf',
            type: 'document',
            size: '2.5 MB',
            uploadedBy: 'John Doe',
            uploadDate: '2024-03-15',
            status: 'active'
        },
        {
            id: 2,
            name: 'Design Mockups.fig',
            type: 'design',
            size: '15 MB',
            uploadedBy: 'Jane Smith',
            uploadDate: '2024-03-16',
            status: 'active'
        },
        {
            id: 3,
            name: 'Project Timeline.xlsx',
            type: 'spreadsheet',
            size: '1.2 MB',
            uploadedBy: 'Mike Johnson',
            uploadDate: '2024-03-17',
            status: 'archived'
        }
    ];

    const columns = [
        {
            title: 'File Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="file-info">
                    <FileIcon type={record.type} />
                    <div className="file-details">
                        <h4>{text}</h4>
                        <span>{record.size}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Uploaded By',
            dataIndex: 'uploadedBy',
            key: 'uploadedBy',
        },
        {
            title: 'Upload Date',
            dataIndex: 'uploadDate',
            key: 'uploadDate',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'success' : 'default'}>
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

    const FileIcon = ({ type }) => {
        switch (type) {
            case 'document':
                return <FiFileText className="file-icon document" />;
            case 'design':
                return <FiImage className="file-icon design" />;
            case 'spreadsheet':
                return <FiFile className="file-icon spreadsheet" />;
            default:
                return <FiFile className="file-icon" />;
        }
    };

    const handleUpload = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    return (
        <div className="project-files">
            <Card
                title="Project Files"
                extra={
                    <Button
                        type="primary"
                        icon={<FiUpload />}
                        onClick={handleUpload}
                    >
                        Upload File
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={files}
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            <Modal
                title="Upload File"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Upload"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="file"
                        label="File"
                    >
                        <Upload.Dragger
                            name="file"
                            multiple={false}
                            action="/upload.do"
                            onChange={info => {
                                console.log(info);
                            }}
                        >
                            <p className="ant-upload-drag-icon">
                                <FiUpload />
                            </p>
                            <p className="ant-upload-text">
                                Click or drag file to this area to upload
                            </p>
                        </Upload.Dragger>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea
                            placeholder="Enter file description"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectFiles; 