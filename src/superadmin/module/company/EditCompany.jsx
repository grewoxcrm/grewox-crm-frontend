import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Upload,
    Button,
    Typography,
    Divider,
    message,
    Select
} from 'antd';
import {
    FiUser,
    FiPhone,
    FiMapPin,
    FiGlobe,
    FiDollarSign,
    FiX,
    FiCamera,
    FiBriefcase,
    FiFileText,
    FiVideo,
    FiPercent,
    FiCreditCard,
    FiBox
} from 'react-icons/fi';
import { useUpdateCompanyMutation } from './services/companyApi';
import { useGetAllCountriesQuery } from '../settings/services/settingsApi';

const { Text } = Typography;
const { Option } = Select;

const EditCompany = ({ visible, onCancel, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
    const [fileList, setFileList] = useState([]);

    // Fetch countries for phone codes
    const { data: countries, isLoading: countriesLoading } = useGetAllCountriesQuery({
        page: 1,
        limit: 100
    });

    useEffect(() => {
        if (visible && initialValues) {
            form.setFieldsValue({
                firstName: initialValues?.firstName || '',
                lastName: initialValues?.lastName || '',
                phoneCode: initialValues?.phoneCode || '91', // Default to India (+91)
                phone: initialValues?.phone || '',
                bankname: initialValues?.bankname || '',
                ifsc: initialValues?.ifsc || '',
                banklocation: initialValues?.banklocation || '',
                accountholder: initialValues?.accountholder || '',
                accountnumber: initialValues?.accountnumber || '',
                gstIn: initialValues?.gstIn || '',
                city: initialValues?.city || '',
                state: initialValues?.state || '',
                website: initialValues?.website || '',
                accounttype: initialValues?.accounttype || '',
                country: initialValues?.country || '',
                zipcode: initialValues?.zipcode || '',
                address: initialValues?.address || '',
            });

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
                const formData = new FormData();

                // Check if there's a profile picture
                const hasProfilePic = fileList.length > 0;
                if (!hasProfilePic) {
                    message.error('Please upload a company logo');
                    return;
                }

                // Add file if exists
                const hasNewProfilePic = fileList.length > 0 && fileList[0].originFileObj;
                if (hasNewProfilePic) {
                    formData.append('profilePic', fileList[0].originFileObj);
                }

                // Add all form values to formData
                Object.keys(values).forEach(key => {
                    if (key !== 'profilePic' && values[key] !== undefined && values[key] !== '') {
                        formData.append(key, values[key]);
                    }
                });

                // Call the update mutation
                updateCompany({ 
                    id: initialValues.id, 
                    data: formData 
                })
                    .unwrap()
                    .then(() => {
                        message.success('Company updated successfully');
                        onCancel(); // Close the modal
                    })
                    .catch((error) => {
                        message.error(error?.data?.message || 'Failed to update company');
                    });
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
            width={720}
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
                        {/* <FiBriefcase style={{ fontSize: '24px', color: '#ffffff' }} /> */}
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            Edit Company
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            Update company information and settings
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
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ marginRight: '16px' }}>
                        <Form.Item
                            name="profilePic"
                            noStyle
                            rules={[{ required: true, message: 'Please upload a company logo' }]}
                        >
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
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '500' }}>Company Logo</h3>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {fileList.length > 0 && fileList[0].originFileObj ? (
                                <>Selected: {fileList[0].name}</>
                            ) : (
                                <>Click to upload or change company logo</>
                            )}
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
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
                        rules={[{ required: true, message: 'Please enter first name' }]}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter first name"
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
                        name="lastName"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Last Name
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter last name' }]}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter last name"
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
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Phone Number
                            </span>
                        }
                        required
                        style={{ gridColumn: '1 / 2' }}
                    >
                        <Input.Group compact className="phone-input-group" style={{
                            display: 'flex',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            overflow: 'hidden'
                        }}>
                            <Form.Item
                                name="phoneCode"
                                noStyle
                                rules={[{ required: true, message: 'Required' }]}
                                initialValue="91"
                            >
                                <Select
                                    size="large"
                                    style={{
                                        width: '80px',
                                        height: '48px'
                                    }}
                                    loading={countriesLoading}
                                    className="phone-code-select"
                                    dropdownStyle={{
                                        padding: '8px',
                                        borderRadius: '10px',
                                    }}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {countries?.map(country => (
                                        <Option key={country.phoneCode} value={country.phoneCode}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: '#1890ff', fontWeight: 500 }}>{country.phoneCode}</span>
                                                <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                                    ({country.countryCode})
                                                </span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="phone"
                                noStyle
                                rules={[
                                    { required: true, message: 'Please enter phone number' },
                                    {
                                        pattern: /^\d{10}$/,
                                        message: 'Phone number must be exactly 10 digits (e.g., 9876543210)'
                                    },
                                    {
                                        validator: (_, value) => {
                                            if (value && !/^\d+$/.test(value)) {
                                                return Promise.reject('Please enter only numbers');
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <Input
                                    size="large"
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        borderLeft: '1px solid #e6e8eb',
                                        borderRadius: 0,
                                        height: '48px',
                                        backgroundColor: 'transparent'
                                    }}
                                    placeholder="Enter 10-digit phone number"
                                    // prefix={<FiPhone style={{ color: '#1890ff' }} />}
                                    maxLength={10}
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>

                    <Form.Item
                        name="website"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Website
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiGlobe style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter website URL"
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
                        name="gstIn"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                GST Number
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiFileText style={{ color: '#1890ff', fontSize: '16px' }} />} 
                            placeholder="Enter GST number"
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
                </div>

                <Divider orientation="left" style={{ margin: '0 0 24px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#262626' }}>
                        Address Information
                    </span>
                </Divider>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
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
                        style={{ gridColumn: 'span 2' }}
                    >
                        <Input.TextArea
                            placeholder="Enter address"
                            rows={4}
                            style={{
                                borderRadius: '10px',
                                padding: '12px 16px',
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
                    >
                        <Input
                            prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter city"
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
                        name="state"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                State
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter state"
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
                        name="country"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Country
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter country"
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
                        name="zipcode"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Zip Code
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter zip code"
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
                </div>

                <Divider orientation="left" style={{ margin: '0 0 24px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#262626' }}>
                        Bank Information
                    </span>
                </Divider>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
                    <Form.Item
                        name="bankname"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Bank Name
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiBriefcase style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter bank name"
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
                        name="accounttype"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Account Type
                            </span>
                        }
                    >
                        <Select
                            placeholder="Select account type"
                            size="large"
                            style={{
                                width: '100%',
                                height: '48px'
                            }}
                            dropdownStyle={{
                                padding: '8px',
                                borderRadius: '10px',
                            }}
                            prefix={<FiBox style={{ color: '#1890ff', fontSize: '16px' }} />}
                        >
                            <Option value="savings">Savings</Option>
                            <Option value="current">Current</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="accountholder"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Account Holder Name
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter account holder name"
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
                        name="accountnumber"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Account Number
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiCreditCard style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter account number"
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
                        name="ifsc"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                IFSC Code
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiFileText style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter IFSC code"
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
                        name="banklocation"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Bank Location
                            </span>
                        }
                    >
                        <Input
                            prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter bank location"
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
                </div>

                <Divider style={{ margin: '0 0 24px' }} />

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
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        onClick={handleSubmit}
                        loading={isUpdating || loading}
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                        }}
                    >
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditCompany; 