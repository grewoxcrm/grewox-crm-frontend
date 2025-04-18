import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Typography, Select, Row, Col, Divider, DatePicker, message, Upload, Spin } from 'antd';
import { FiDollarSign, FiX, FiCalendar, FiUser, FiHash, FiUpload, FiBriefcase, FiCreditCard, FiFileText, FiTag } from 'react-icons/fi';
import dayjs from 'dayjs';
import './vendor.scss';
import { useUpdateVendorMutation, useGetVendorByIdQuery } from './services/vendorApi';
import { useGetAllCountriesQuery } from '../../settings/services/settingsApi';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditVendor = ({ onCancel,initialValues,open }) => {
    const [form] = Form.useForm();
    const [updateVendor] = useUpdateVendorMutation();
    const [fileList, setFileList] = useState([]);
    const { data: countries = [], isLoading: countriesLoading } = useGetAllCountriesQuery();

    useEffect(() => {
        if (open && initialValues) {
            form.resetFields();
            
            if (initialValues.file) {
                setFileList([
                    {
                        uid: '-1',
                        name: initialValues.file.split('/').pop(),
                        status: 'done',
                        url: initialValues.file
                    }
                ]);
            } else {
                setFileList([]);
            }

            // Parse the phone object if it exists
            let phoneCode = '+91'; // Default to India's code
            let phoneNumber = '';
            
            // Find the country by ID and get its phone code
            if (initialValues.phonecode) {
                const country = countries?.find(c => c.id === initialValues.phonecode);
                if (country) {
                    phoneCode = country.phoneCode;
                }
            }

            // Get phone number
            if (initialValues.contact) {
                phoneNumber = initialValues.contact;
            }

            const formattedValues = {
                name: initialValues.name,
                contact: phoneNumber,
                phonecode: phoneCode || '+91', // Ensure phoneCode is never null
                email: initialValues.email,
                taxNumber: initialValues.taxNumber,
                address: initialValues.address,
                city: initialValues.city,
                state: initialValues.state,
                country: initialValues.country,
                zipcode: initialValues.zipcode
            };

            console.log('Setting formatted values:', formattedValues);

            form.setFieldsValue(formattedValues);
        }
    }, [open, form, initialValues, countries]);

    const handleSubmit = async (values) => {
        try {
            // Find the country ID from the selected phone code
            const selectedCountry = countries?.find(c => c.phoneCode === values.phonecode);
            if (!selectedCountry) {
                message.error('Please select a valid phone code');
                return;
            }

            const payload = {
                name: values.name,
                contact: values.contact,
                phonecode: selectedCountry.id,
                email: values.email,
                taxNumber: values.taxNumber,
                address: values.address,
                city: values.city,
                state: values.state,
                country: values.country,
                zipcode: values.zipcode
            };

            let response;
            if (fileList?.[0]?.originFileObj) {
                const formData = new FormData();
                formData.append('file', fileList[0].originFileObj);
                Object.entries(payload).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, value);
                    }
                });
                response = await updateVendor({
                    id: initialValues.id,
                    data: formData
                }).unwrap();
            } else {
                response = await updateVendor({
                    id: initialValues.id,
                    data: payload
                }).unwrap();
            }

            if (response.success) {
                message.success('Vendor updated successfully');
                setFileList([]);
                form.resetFields();
                onCancel();
            } else {
                message.error(response.message || 'Failed to update vendor');
            }
        } catch (error) {
            console.error('Failed to update vendor:', error);
            message.error(error.data?.message || 'Failed to update vendor');
        }
    };

  

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                }
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                    padding: '24px',
                    color: '#ffffff',
                    position: 'relative',
                }}
            >
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
                        transition: 'all 0.3s ease',
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
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FiBriefcase style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: '0',
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#ffffff',
                            }}
                        >
                            Edit Vendor
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            Update vendor information
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
                    padding: '24px',
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: 'Please enter name' }]}
                        >
                            <Input
                                placeholder="Enter name"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Contact"
                            style={{ marginBottom: 0 }}
                            required
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
                                    name="phonecode"
                                    noStyle
                                    rules={[{ required: true, message: 'Required' }]}
                                    initialValue="+91"
                                >
                                    <Select
                                        size="large"
                                        style={{
                                            width: '80px',
                                            height: '48px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                        }}
                                        loading={countriesLoading}
                                        className="phone-code-select"
                                        dropdownStyle={{
                                            padding: '8px',
                                            borderRadius: '10px',
                                            backgroundColor: 'white',
                                        }}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {countries?.map(country => (
                                            <Option 
                                                key={country.id} 
                                                value={country.phoneCode}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    color: '#262626',
                                                    cursor: 'pointer',
                                                }}>
                                                    <span>{country.phoneCode}</span>
                                                </div>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name="contact"
                                    noStyle
                                    rules={[
                                        { required: true, message: 'Please enter phone number' },
                                        {
                                            pattern: /^\d{10}$/,
                                            message: 'Phone number must be exactly 10 digits'
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
                                            height: '46px',
                                            backgroundColor: 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                        placeholder="Enter 10-digit phone number"
                                        maxLength={10}
                                    />
                                </Form.Item>
                            </Input.Group>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { type: 'email', message: 'Please enter valid email' }
                            ]}
                        >
                            <Input
                                placeholder="Enter email (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="taxNumber"
                            label="Tax Number"
                        >
                            <Input
                                placeholder="Enter tax number (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="address"
                    label="Address"
                >
                    <TextArea
                        placeholder="Enter address (optional)"
                        rows={4}
                        style={{
                            borderRadius: '10px',
                            padding: '12px 16px',
                            backgroundColor: '#f8fafc',
                        }}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="city"
                            label="City"
                        >
                            <Input
                                placeholder="Enter city (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="state"
                            label="State"
                        >
                            <Input
                                placeholder="Enter state (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="country"
                            label="Country"
                        >
                            <Input
                                placeholder="Enter country (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="zipcode"
                            label="Zipcode"
                        >
                            <Input
                                placeholder="Enter zipcode (optional)"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider style={{ margin: '24px 0' }} />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                    }}
                >
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
                        htmlType="submit"
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
                        Update Vendor
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditVendor;