import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Upload,
    Button,
    Typography,
    Divider,
    message
} from 'antd';
import {
    FiUser,
    FiPhone,
    FiX,
    FiCamera,
    FiMapPin,
    FiHome,
    FiMap,
    FiGlobe
} from 'react-icons/fi';

const { Text } = Typography;

const EditProfileModal = ({ visible, onCancel, onSubmit, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    // Reset form when modal opens or closes
    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                firstName: initialValues?.firstName || '',
                lastName: initialValues?.lastName || '',
                phone: initialValues?.phone || '',
                address: initialValues?.address || '',
                city: initialValues?.city || '',
                state: initialValues?.state || '',
                country: initialValues?.country || '',
                zipCode: initialValues?.zipCode || ''
            });

            // Set profile picture if exists
            if (initialValues?.profilePic) {
                setFileList([{
                    uid: '-1',
                    name: 'profile-picture.png',
                    status: 'done',
                    url: initialValues.profilePic,
                }]);
            } else {
                setFileList([]);
            }
        }
    }, [visible, initialValues, form]);

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                // Create FormData for file upload
                const formData = new FormData();

                // Add text fields, including empty values
                Object.keys(values).forEach(key => {
                    if (key !== 'profilePic') {
                        // Send empty string if value is undefined or empty
                        formData.append(key, values[key] || '');
                    }
                });

                // Check if there's a new profile picture to upload
                const hasNewProfilePic = fileList.length > 0 && fileList[0].originFileObj;

                // Add file if exists
                if (hasNewProfilePic) {
                    formData.append('profilePic', fileList[0].originFileObj);
                }

                onSubmit(formData);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must be smaller than 2MB!');
        }

        return isImage && isLt2M;
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

    const uploadButton = (
        <div>
            <FiCamera style={{ fontSize: '18px', color: '#1890ff' }} />
        </div>
    );

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onCancel}
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
                    onClick={onCancel}
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
                        <FiUser style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            Edit Profile
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            Update your personal information
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    firstName: initialValues?.firstName || '',
                    lastName: initialValues?.lastName || '',
                    phone: initialValues?.phone || '',
                    address: initialValues?.address || '',
                    city: initialValues?.city || '',
                    state: initialValues?.state || '',
                    country: initialValues?.country || '',
                    zipCode: initialValues?.zipCode || ''
                }}
                requiredMark={false}
                style={{
                    padding: '24px'
                }}
                autoComplete="off"
            >
                {/* Hidden fields to prevent autofill */}
                <div style={{ display: 'none' }}>
                    <input type="text" autoComplete="chrome-off" />
                    <input type="password" autoComplete="chrome-off" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ marginRight: '16px' }}>
                        <Form.Item name="profilePic" noStyle>
                            <Upload
                                name="profilePic"
                                listType="picture-circle"
                                className="avatar-uploader"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                onChange={handleChange}
                                maxCount={1}
                            >
                                {fileList.length > 0 && (fileList[0].url || fileList[0].originFileObj) ? (
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        {fileList[0].originFileObj ? (
                                            // Show preview for newly selected image
                                            <>
                                                <img
                                                    src={URL.createObjectURL(fileList[0].originFileObj)}
                                                    alt="avatar preview"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'rgba(24, 144, 255, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <div style={{
                                                        background: 'rgba(24, 144, 255, 0.8)',
                                                        color: 'white',
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        borderRadius: '10px'
                                                    }}>
                                                        New
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            // Show existing image
                                            <img
                                                src={fileList[0].url}
                                                alt="avatar"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'rgba(0,0,0,0.4)',
                                            padding: '4px 0',
                                            textAlign: 'center'
                                        }}>
                                            <FiCamera style={{ color: 'white', fontSize: '14px' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: '#f0f2f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px dashed #d9d9d9'
                                    }}>
                                        {uploadButton}
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '500' }}>Profile Picture</h3>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {fileList.length > 0 && fileList[0].originFileObj ? (
                                <>Selected: {fileList[0].name}</>
                            ) : (
                                <>Click to upload or change your profile picture</>
                            )}
                        </Text>
                    </div>
                </div>

                <Form.Item
                    name="firstName"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            First Name
                        </span>
                    }
                    rules={[
                        {
                            transform: (value) => value?.trim() || '',
                            validator: async (_, value) => {
                                if (value?.trim()?.length === 0) {
                                    return Promise.resolve();
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter first name"
                        size="large"
                        autoComplete="off"
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
                    name="lastName"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Last Name
                        </span>
                    }
                    rules={[
                        {
                            transform: (value) => value?.trim() || '',
                            validator: async (_, value) => {
                                if (value?.trim()?.length === 0) {
                                    return Promise.resolve();
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter last name"
                        size="large"
                        autoComplete="off"
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
                    name="phone"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Phone Number
                        </span>
                    }
                    rules={[
                        {
                            transform: (value) => value?.trim() || '',
                            validator: async (_, value) => {
                                if (value?.trim()?.length === 0) {
                                    return Promise.resolve();
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        prefix={<FiPhone style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter phone number"
                        size="large"
                        autoComplete="off"
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
                    name="address"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Address
                        </span>
                    }
                    rules={[
                        {
                            transform: (value) => value?.trim() || '',
                            validator: async (_, value) => {
                                if (value?.trim()?.length === 0) {
                                    return Promise.resolve();
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter address"
                        size="large"
                        autoComplete="off"
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
                    name="city"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            City
                        </span>
                    }
                    rules={[
                        {
                            transform: (value) => value?.trim() || '',
                            validator: async (_, value) => {
                                if (value?.trim()?.length === 0) {
                                    return Promise.resolve();
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        prefix={<FiHome style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter city"
                        size="large"
                        autoComplete="off"
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
                    name="state"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            State
                        </span>
                    }
                    rules={[
                        {
                            transform: (value) => value?.trim() || '',
                            validator: async (_, value) => {
                                if (value?.trim()?.length === 0) {
                                    return Promise.resolve();
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        prefix={<FiMap style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter state"
                        size="large"
                        autoComplete="off"
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
                    name="country"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Country
                        </span>
                    }
                    rules={[
                        {
                            transform: (value) => value?.trim() || '',
                            validator: async (_, value) => {
                                if (value?.trim()?.length === 0) {
                                    return Promise.resolve();
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        prefix={<FiGlobe style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter country"
                        size="large"
                        autoComplete="off"
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
                    name="zipCode"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Zip Code
                        </span>
                    }
                    rules={[
                        {
                            transform: (value) => value?.trim() || '',
                            validator: async (_, value) => {
                                if (value?.trim()?.length === 0) {
                                    return Promise.resolve();
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter zip code"
                        size="large"
                        autoComplete="off"
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

                <Divider style={{ margin: '24px 0' }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <Button
                        size="large"
                        onClick={onCancel}
                        style={{
                            padding: '8px 24px',
                            height: '44px',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        onClick={handleSubmit}
                        loading={loading}
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditProfileModal;
