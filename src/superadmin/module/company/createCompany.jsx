import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Divider, message } from 'antd';
import { FiUser, FiMail, FiLock, FiBriefcase, FiX } from 'react-icons/fi';
import { useCreateCompanyMutation, useUpdateCompanyMutation, useVerifySignupMutation, useResendSignupOtpMutation } from './services/companyApi';

const { Text } = Typography;

const CreateCompany = ({ open, onCancel, isEditing, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
    const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
    const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [sessionToken, setSessionToken] = useState(null);
    const [verifySignup] = useVerifySignupMutation();
    const [resendSignupOtp] = useResendSignupOtpMutation();

    const handleSubmit = async (values) => {
        try {
            if (isEditing) {
                await updateCompany({ id: initialValues.id, data: values }).unwrap();
                message.success('Company updated successfully');
                form.resetFields();
                onCancel();
            } else {
                const response = await createCompany(values).unwrap();
                if (response.success) {
                    setSessionToken(response.data.sessionToken);
                    setIsOtpModalVisible(true);
                    message.success(response.message || 'Please verify your email to complete registration');
                } else {
                    message.error(response.message || 'Failed to create company');
                }
            }
        } catch (error) {
            message.error(error?.data?.message || 'Something went wrong');
        }
    };

    const handleOtpSubmit = async () => {
        try {
            setOtpLoading(true);
            const otpValue = await otpForm.validateFields();

            const verifyResponse = await verifySignup({
                otp: otpValue.otp,
                token: sessionToken
            }).unwrap();

            if (verifyResponse.success) {
                message.success('Company verified successfully');
                setIsOtpModalVisible(false);
                otpForm.resetFields();
                form.resetFields();
                onCancel();
            } else {
                message.error(verifyResponse.message || 'Failed to verify OTP');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to verify OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            const response = await resendSignupOtp({
                token: sessionToken
            }).unwrap();

            if (response.success) {
                message.success('OTP resent successfully');
            } else {
                message.error(response.message || 'Failed to resend OTP');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to resend OTP');
        }
    };

    const OtpModal = () => (
        <Modal
            title={null}
            open={isOtpModalVisible}
            onCancel={() => {
                setIsOtpModalVisible(false);
                otpForm.resetFields();
            }}
            footer={null}
            width={420}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            styles={{
                body: {
                    padding: 0,
                    overflow: "hidden",
                    borderRadius: "8px",
                },
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    padding: "24px",
                    color: "#ffffff",
                    position: "relative",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
            >
                <Button
                    type="text"
                    onClick={() => {
                        setIsOtpModalVisible(false);
                        otpForm.resetFields();
                    }}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        color: "#ffffff",
                        width: "32px",
                        height: "32px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(8px)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                    }}
                >
                    <FiX style={{ fontSize: "20px" }} />
                </Button>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        }}
                    >
                        <FiLock style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: "0",
                                fontSize: "24px",
                                fontWeight: "600",
                                color: "#ffffff",
                                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            Verify OTP
                        </h2>
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            Enter the OTP sent to your email
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ padding: "24px" }}>
                <Form
                    form={otpForm}
                    layout="vertical"
                    onFinish={handleOtpSubmit}
                >
                    <Form.Item
                        name="otp"
                        rules={[
                            { required: true, message: 'Please enter OTP' },
                            { len: 6, message: 'OTP must be 6 digits' },
                            { pattern: /^[0-9]+$/, message: 'OTP must contain only numbers' }
                        ]}
                    >
                        <Input
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            style={{
                                borderRadius: "8px",
                                height: "40px",
                                fontSize: "16px",
                                textAlign: "center",
                                letterSpacing: "8px",
                                fontWeight: "600"
                            }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={otpLoading}
                            block
                            style={{
                                height: "40px",
                                borderRadius: "8px",
                                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                border: "none",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}
                        >
                            Verify & Create Company
                        </Button>
                    </Form.Item>

                    <div style={{
                        textAlign: 'center',
                        marginTop: '16px',
                        fontSize: '14px',
                        color: '#8c8c8c'
                    }}>
                        Didn't receive OTP? <Button
                            type="link"
                            style={{ padding: '0 4px' }}
                            onClick={handleResendOtp}
                        >
                            Resend
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );

    return (
        <>
        <Modal
            title={null}
            open={open}
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
                            Create New Company
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                           Fill in the information to create company
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialValues}
                requiredMark={false}
                style={{
                    padding: '24px'
                }}
            >
                <Form.Item
                    name="username"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Username
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter username' }]}
                >
                    <Input
                        prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter username"
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
                    name="email"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Email
                        </span>
                    }
                    rules={[
                        { required: true, message: 'Please enter email' },
                        { type: 'email', message: 'Please enter a valid email' }
                    ]}
                >
                    <Input
                        prefix={<FiMail style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter email"
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
                    name="password"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Password
                        </span>
                    }
                    rules={[
                        { required: !isEditing, message: 'Please enter password' },
                        { min: 6, message: 'Password must be at least 6 characters' }
                    ]}
                    extra={
                        <Text type="secondary" style={{
                            fontSize: '12px',
                            marginTop: '4px',
                            display: 'block'
                        }}>
                            Password must be at least 6 characters long
                        </Text>
                    }
                >
                    <Input.Password
                        prefix={<FiLock style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter password"
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
                        htmlType="submit"
                        loading={isCreating || isUpdating}
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
                        {isEditing ? 'Update Account' : 'Create Account'}
                    </Button>
                </div>
            </Form>
        </Modal>

            <OtpModal />
        </>
    );
};

export default CreateCompany;