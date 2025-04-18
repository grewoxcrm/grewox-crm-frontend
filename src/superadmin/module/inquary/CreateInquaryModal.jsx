import React from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    message,
    Select,
    DatePicker,
    Typography,
} from "antd";
import { useCreateInquiryMutation, useUpdateInquiryMutation } from './services/inquaryApi';
import moment from "moment";
import {
    FiX,
    FiMessageSquare,
    FiUser,
    FiMail,
    FiPhone,
    FiBookmark,
    FiMessageCircle
} from 'react-icons/fi';

const { TextArea } = Input;
const { Text } = Typography;

const CreateInquaryModal = ({ open, onCancel, onSubmit, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [createInquiry] = useCreateInquiryMutation();
    const [updateInquiry] = useUpdateInquiryMutation();

    // Set form values when editing
    React.useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
            });
        } else {
            form.resetFields();
        }
    }, [initialValues, form]);

    const handleCancel = () => {
        form.resetFields();
        onCancel?.();
    };

    const onFinish = async (values) => {
        try {
            const formattedValues = {
                name: values.name,
                email: values.email,
                phone: values.phone,
                subject: values.subject,
                message: values.message
            };

            if (isEditing) {
                await updateInquiry({
                    id: initialValues.id,
                    data: formattedValues
                }).unwrap();
                message.success("Inquiry updated successfully");
            } else {
                await createInquiry(formattedValues).unwrap();
                message.success("Inquiry created successfully");
            }

            handleCancel();
            onSubmit?.();
        } catch (error) {
            console.error("Operation failed:", error);
            message.error(error?.data?.message || "Operation failed");
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={520}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                "--antd-arrow-background-color": "#ffffff",
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: "8px",
                    overflow: "hidden",
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
                }}
            >
                <Button
                    type="text"
                    onClick={handleCancel}
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
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                    }}
                >
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
                        }}
                    >
                        <FiMessageSquare style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: "0",
                                fontSize: "24px",
                                fontWeight: "600",
                                color: "#ffffff",
                            }}
                        >
                            {isEditing ? "Edit Inquiry" : "Create New Inquiry"}
                        </h2>
                        <Text
                            style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            {isEditing
                                ? "Update inquiry information"
                                : "Fill in the information to create inquiry"}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                style={{
                    padding: "24px",
                }}
            >
                <Form.Item
                    name="name"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Name
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please input the name!",
                        },
                    ]}
                >
                    <Input
                        prefix={<FiUser style={{ color: "#1890ff", fontSize: "16px" }} />}
                        placeholder="Enter name"
                        size="large"
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Email
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            type: "email",
                            message: "Please input a valid email!",
                        },
                    ]}
                >
                    <Input
                        prefix={<FiMail style={{ color: "#1890ff", fontSize: "16px" }} />}
                        placeholder="Enter email"
                        size="large"
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Phone
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please input the phone number!",
                        },
                    ]}
                >
                    <Input
                        prefix={<FiPhone style={{ color: "#1890ff", fontSize: "16px" }} />}
                        placeholder="Enter phone number"
                        size="large"
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="subject"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Subject
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please input the subject!",
                        },
                    ]}
                >
                    <Input
                        prefix={<FiBookmark style={{ color: "#1890ff", fontSize: "16px" }} />}
                        placeholder="Enter subject"
                        size="large"
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="message"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            Message
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please input the message!",
                        },
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter message"
                        style={{
                            borderRadius: "10px",
                            padding: "8px 16px",
                        }}
                    />
                </Form.Item>

                <Form.Item className="form-actions" style={{ marginBottom: 0, marginTop: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                        <Button
                            onClick={handleCancel}
                            size="large"
                            style={{
                                borderRadius: "10px",
                                padding: "6px 20px",
                                height: "40px",
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={{
                                borderRadius: "10px",
                                padding: "6px 20px",
                                height: "40px",
                                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                border: "none",
                            }}
                        >
                            {isEditing ? "Update" : "Create"}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateInquaryModal; 