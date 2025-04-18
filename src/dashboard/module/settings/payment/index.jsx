import React, { useState } from 'react';
import { Card, Form, Input, Switch, Button, message, Row, Col, Typography, Breadcrumb } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './payment.scss';

const { Title, Text } = Typography;

const PaymentSettings = () => {
    const [form] = Form.useForm();
    const [razorpayEnabled, setRazorpayEnabled] = useState(false);
    const [phonepayEnabled, setPhonepayEnabled] = useState(false);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            console.log('Form values:', values);
            message.success('Payment settings saved successfully!');
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <div className="payment-settings-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/settings">Settings</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Payment</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Payment</Title>
                    <Text type="secondary">Configure your payment gateway settings</Text>
                </div>
            </div>

            <div className="page-contents">
                <Form
                    form={form}
                    layout="vertical"
                    className="settings-form"
                >
                    <Row gutter={[24, 24]}>
                        {/* Razorpay Settings */}
                        <Col xs={24} lg={12}>
                            <Card className="gateway-card">
                                <div className="card-header">
                                    <div className="title-section">
                                        <Title level={5}>Razorpay Settings</Title>
                                    </div>
                                    <div className="action-section">
                                        <Switch
                                            checked={razorpayEnabled}
                                            onChange={(checked) => setRazorpayEnabled(checked)}
                                            className="gateway-switch"
                                        />
                                    </div>
                                </div>
                                <div className="card-content">
                                    <Form.Item
                                        label="Key ID"
                                        name="razorpayKeyId"
                                        rules={[{ required: razorpayEnabled, message: 'Please enter Key ID' }]}
                                    >
                                        <Input
                                            placeholder="Enter Razorpay Key ID"
                                            className="settings-input"
                                            disabled={!razorpayEnabled}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Secret Key"
                                        name="razorpaySecretKey"
                                        rules={[{ required: razorpayEnabled, message: 'Please enter Secret Key' }]}
                                    >
                                        <Input.Password
                                            placeholder="Enter Razorpay Secret Key"
                                            className="settings-input"
                                            disabled={!razorpayEnabled}
                                        />
                                    </Form.Item>
                                </div>
                            </Card>
                        </Col>

                        {/* PhonePay Settings */}
                        <Col xs={24} lg={12}>
                            <Card className="gateway-card">
                                <div className="card-header">
                                    <div className="title-section">
                                        <Title level={5}>PhonePay Settings</Title>
                                    </div>
                                    <div className="action-section">
                                        <Switch
                                            checked={phonepayEnabled}
                                            onChange={(checked) => setPhonepayEnabled(checked)}
                                            className="gateway-switch"
                                        />
                                    </div>
                                </div>
                                <div className="card-content">
                                    <Form.Item
                                        label="Merchant ID"
                                        name="phonepayMerchantId"
                                        rules={[{ required: phonepayEnabled, message: 'Please enter Merchant ID' }]}
                                    >
                                        <Input
                                            placeholder="Enter PhonePay Merchant ID"
                                            className="settings-input"
                                            disabled={!phonepayEnabled}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Secret Key"
                                        name="phonepaySecretKey"
                                        rules={[{ required: phonepayEnabled, message: 'Please enter Secret Key' }]}
                                    >
                                        <Input.Password
                                            placeholder="Enter PhonePay Secret Key"
                                            className="settings-input"
                                            disabled={!phonepayEnabled}
                                        />
                                    </Form.Item>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <div className="footer-actions">
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            className="save-button"
                        >
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default PaymentSettings;
