import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Divider, Upload, message } from 'antd';
import { FiFileText, FiX, FiType, FiAlignLeft, FiUpload } from 'react-icons/fi';

const { TextArea } = Input;
const { Text } = Typography;

const CreatePolicy = ({ open, onClose, onSubmit }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const handleSubmit = async (values) => {
        try {
            await form.validateFields();
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('description', values.description);

            // Check if there's a new file to upload
            const hasNewFile = fileList.length > 0 && fileList[0].originFileObj;
            if (hasNewFile) {
                formData.append('file', fileList[0].originFileObj);
            }

            onSubmit(formData);
            form.resetFields();
            setFileList([]);
            onClose();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const beforeUpload = (file) => {
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('File must be smaller than 5MB!');
            return false;
        }

        return true;
    };

    const handleChange = ({ fileList }) => {
        // Ensure we have the file name for newly uploaded files
        const updatedFileList = fileList.map(file => {
            if (file.originFileObj && !file.name) {
                return {
                    ...file,
                    name: file.originFileObj.name
                };
            }
            return file;
        });

        setFileList(updatedFileList);
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onClose}
            footer={null}
            width={520}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                '--antd-arrow-background-color': '#ffffff'
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden'
                }
            }}
        >
            <div className="modal-header" style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                padding: '24px',
                color: '#ffffff',
                position: 'relative'
            }}>
                <Button
                    type="text"
                    onClick={onClose}
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
                        transition: 'all 0.3s ease'
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
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <FiFileText style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            Create New Policy
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            Fill in the information to create policy
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                style={{
                    padding: '24px'
                }}
            >
                <Form.Item
                    name="title"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Policy Title
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter policy title' }]}
                >
                    <Input
                        prefix={<FiType style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter policy title"
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
                    name="description"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Description
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter policy description' }]}
                >
                    <TextArea
                        prefix={<FiAlignLeft style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter policy description"
                        size="large"
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
                    name="file"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Policy File
                        </span>
                    }
                >
                    <Upload
                        beforeUpload={beforeUpload}
                        onChange={handleChange}
                        fileList={fileList}
                        maxCount={1}
                        accept=".pdf,.doc,.docx"
                    >
                        <Button
                            icon={<FiUpload />}
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            Upload Policy File
                        </Button>
                    </Upload>
                </Form.Item>

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '24px'
                }}>
                    <Button
                        size="large"
                        onClick={onClose}
                        style={{
                            padding: '8px 24px',
                            height: '44px',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            fontWeight: '500'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)'
                        }}
                    >
                        Create Policy
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreatePolicy;