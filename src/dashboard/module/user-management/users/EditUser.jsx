import React from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { FiX, FiEdit2 } from 'react-icons/fi';
import { useUpdateUserMutation } from './services/userApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
const EditUser = ({ visible, onCancel, initialValues }) => {
    const [form] = Form.useForm();
    const [updateUser, { isLoading }] = useUpdateUserMutation();
    const { data: rolesData } = useGetRolesQuery();

    const currentUser = useSelector(state => state.auth.user);

    const filteredRoles = rolesData?.data?.filter(role =>
        role.created_by === currentUser?.username
    ) || [];

    const handleSubmit = async (values) => {
        console.log(values);
        try {
            const response = await updateUser({
                id: initialValues.id,
                ...values
            }).unwrap();

            if (response.success) {
                message.success('User updated successfully');
                form.resetFields();
                onCancel();
            } else {
                message.error(response.message || 'Failed to update user');
            }
        } catch (error) {
            message.error(error.data?.message || 'An error occurred while updating the user');
        }
    };

    React.useEffect(() => {
        if (visible && initialValues) {
            form.setFieldsValue({
                username: initialValues.username,
                email: initialValues.email,
                role_id: initialValues.role_id,
            });
        }
    }, [visible, initialValues, form]);

    return (
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
                        <FiEdit2 style={{ fontSize: "24px", color: "#ffffff" }} />
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
                            Edit User
                        </h2>
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            Update user information
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
                        name="role_id"
                        label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Role</span>}
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select
                            placeholder="Select role"
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

                    <Form.Item
                        name="password"
                        label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Password</span>}
                        rules={[
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                        extra={<span style={{ color: "#8c8c8c", fontSize: "12px" }}>Leave blank to keep current password</span>}
                    >
                        <Input.Password
                            placeholder="Enter new password (optional)"
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

                    <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <Button
                                onClick={onCancel}
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
                                Update User
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default EditUser; 