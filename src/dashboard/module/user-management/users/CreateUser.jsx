import React, { useState } from 'react';
import { Modal, Form, Input, Button, Select, message, Tooltip, Space } from 'antd';
import { FiX, FiUserPlus, FiPlus, FiLock } from 'react-icons/fi';
import { useCreateUserMutation, useResendOtpMutation, useVerifySignupMutation, useResendSignupOtpMutation } from './services/userApi';
import { useCreateRoleMutation, useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
import CreateRole from '../../hrm/role/CreateRole';

const CreateUser = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [createUser, { isLoading }] = useCreateUserMutation();
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
    const { data: rolesData, refetch: refetchRoles } = useGetRolesQuery();
    const currentUser = useSelector(state => state.auth.user);
    const [isCreateRoleVisible, setIsCreateRoleVisible] = useState(false);
    const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
    const [userFormData, setUserFormData] = useState(null);
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendOtp] = useResendOtpMutation();
    const [sessionToken, setSessionToken] = useState(null);
    const [verifySignup] = useVerifySignupMutation();
    const [resendSignupOtp] = useResendSignupOtpMutation();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const response = await createUser(values).unwrap();

            if (response.success) {
                setUserFormData(values);
                // Store the session token
                setSessionToken(response.data.sessionToken);
                setIsOtpModalVisible(true);
                message.success(response.message || 'Please verify your email to complete registration');
            } else {
                message.error(response.message || 'Failed to create user');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to create user');
        }
    };

    const handleOtpSubmit = async () => {
        try {
            setOtpLoading(true);
            const otpValue = await otpForm.validateFields();

            // Pass both OTP and token
            const verifyResponse = await verifySignup({
                otp: otpValue.otp,
                token: sessionToken // Pass token in the request payload
            }).unwrap();

            if (verifyResponse.success) {
                message.success('User verified successfully');
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
                // Update session token with new one from response
                setSessionToken(response.data.sessionToken);
                message.success('OTP resent successfully');
            } else {
                message.error(response.message || 'Failed to resend OTP');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to resend OTP');
        }
    };

    const filteredRoles = rolesData?.data?.filter(role =>
        role.created_by === currentUser?.username
    ) || [];

    const handleCreateSubmit = async (formData) => {
        try {
            await createRole(formData).unwrap();
            message.success('Role created successfully');
            setIsCreateRoleVisible(false);
            refetchRoles();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to create role');
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
                            Verify & Create User
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
                open={visible}
                onCancel={() => {
                    form.resetFields();
                    onCancel();
                }}
                footer={null}
                width={520}
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
                        onClick={onCancel}
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
                            <FiUserPlus style={{ fontSize: "24px", color: "#ffffff" }} />
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
                                Create New User
                            </h2>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    fontSize: "14px",
                                    color: "rgba(255, 255, 255, 0.85)",
                                }}
                            >
                                Add a new user to the system
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "24px" }}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        style={{
                            background: "#ffffff",
                            borderRadius: "8px",
                        }}
                    >
                        <Form.Item
                            name="username"
                            label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Username</span>}
                            rules={[
                                { required: true, message: 'Please enter username' },
                                { min: 3, message: 'Username must be at least 3 characters' }
                            ]}
                        >
                            <Input
                                placeholder="Enter username"
                                style={{
                                    borderRadius: "8px",
                                    border: "1px solid #d9d9d9",
                                    boxShadow: "none",
                                    height: "40px",
                                    fontSize: "14px",
                                    transition: "all 0.3s ease",
                                    ":hover": {
                                        borderColor: "#40a9ff",
                                    },
                                    ":focus": {
                                        borderColor: "#40a9ff",
                                        boxShadow: "0 0 0 2px rgba(24, 144, 255, 0.2)",
                                    },
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Email</span>}
                            rules={[
                                { required: true, message: 'Please enter email' },
                                { type: 'email', message: 'Please enter a valid email' }
                            ]}
                        >
                            <Input
                                placeholder="Enter email"
                                style={{
                                    borderRadius: "8px",
                                    border: "1px solid #d9d9d9",
                                    boxShadow: "none",
                                    height: "40px",
                                    fontSize: "14px",
                                    transition: "all 0.3s ease",
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Password</span>}
                            rules={[
                                { required: true, message: 'Please enter password' },
                                { min: 8, message: 'Password must be at least 8 characters' },
                                {
                                    pattern: /^[a-zA-Z0-9!@#$%^&*]{8,30}$/,
                                    message: 'Password must contain only letters, numbers and special characters'
                                }
                            ]}
                            extra={<span style={{ color: "#8c8c8c", fontSize: "12px" }}>Password must be at least 8 characters long</span>}
                        >
                            <Input.Password
                                placeholder="Enter password"
                                style={{
                                    borderRadius: "8px",
                                    border: "1px solid #d9d9d9",
                                    boxShadow: "none",
                                    height: "40px",
                                    fontSize: "14px",
                                    transition: "all 0.3s ease",
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="role_id"
                            label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Role</span>}
                            rules={[{ required: true, message: 'Please select a role' }]}
                        >
                            <Select
                                placeholder="Select role"
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <div
                                            style={{
                                                padding: '8px',
                                                borderTop: '1px solid #f0f0f0',
                                            }}
                                        >
                                            <Button
                                                type="primary"
                                                icon={<FiPlus size={16} style={{ color: '#ffffff' }} />}
                                                block
                                                onClick={() => setIsCreateRoleVisible(true)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                                                    color: '#ffffff',
                                                    fontWeight: 500,
                                                    border: 'none',
                                                    height: '36px',
                                                    borderRadius: '6px',
                                                    transition: 'all 0.3s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.opacity = "0.85";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.opacity = "1";
                                                }}
                                            >
                                                Create New Role
                                            </Button>
                                        </div>
                                    </>
                                )}
                                options={filteredRoles.map(role => ({
                                    label: role.role_name,
                                    value: role.id
                                })) || []}
                                style={{
                                    width: "100%",
                                    height: "40px",
                                }}
                                dropdownStyle={{
                                    borderRadius: "8px",
                                    padding: "8px",
                                }}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <Button
                                    onClick={() => {
                                        form.resetFields();
                                        onCancel();
                                    }}
                                    style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        padding: "0 24px",
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "#40a9ff";
                                        e.currentTarget.style.color = "#40a9ff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "#d9d9d9";
                                        e.currentTarget.style.color = "rgba(0, 0, 0, 0.88)";
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isLoading}
                                    style={{
                                        borderRadius: "8px",
                                        boxShadow: "none",
                                        height: "40px",
                                        padding: "0 24px",
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                        border: "none",
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = "0.85";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = "1";
                                    }}
                                >
                                    Create User
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>

            <CreateRole
                visible={isCreateRoleVisible}
                onCancel={() => setIsCreateRoleVisible(false)}
                onSubmit={handleCreateSubmit}
                loading={isCreating}
            />

            <OtpModal />
        </>
    );
};

export default CreateUser;