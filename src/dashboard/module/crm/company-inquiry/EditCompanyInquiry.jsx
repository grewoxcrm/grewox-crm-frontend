import React, { useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Select,
    Row,
    Col,
    Divider,
} from "antd";
import {
    FiFileText,
    FiX,
    FiUser,
    FiPhone,
    FiBriefcase,
    FiMessageSquare,
} from "react-icons/fi";
import "./CompanyInquiry.scss";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const businessCategories = [
    "Technology",
    "Manufacturing",
    "Healthcare",
    "Finance",
    "Retail",
    "Education",
    "Construction",
    "Transportation",
    "Agriculture",
    "Others"
];

const EditCompanyInquiry = ({ open, onCancel, onSubmit, loading, initialValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                _id: initialValues.id,
                fullname: initialValues.fullname,
                phone: initialValues.phone,
                business_category: initialValues.business_category,
                description: initialValues.description
            });
        }
    }, [initialValues, form]);

    const handleSubmit = async (values) => {
        try {
            await onSubmit({
                ...values,
                _id: initialValues?.id
            });
            form.resetFields();
        } catch (error) {
            console.error("Submit Error:", error);
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
                    borderRadius: "8px",
                    overflow: "hidden",
                },
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
                    padding: "24px",
                    color: "#ffffff",
                    position: "relative",
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
                        <FiFileText style={{ fontSize: "24px", color: "#ffffff" }} />
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
                            Edit Company Inquiry
                        </h2>
                        <Text
                            style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            Update company inquiry information
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
                    padding: "24px",
                }}
            >
                <Form.Item name="_id" hidden>
                    <Input />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="fullname"
                            label={
                                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                    <FiUser style={{ marginRight: "8px", color: "#1890ff" }} />
                                    Full Name <span style={{ color: "#ff4d4f" }}>*</span>
                                </span>
                            }
                            rules={[{ required: true, message: "Please enter full name" }]}
                        >
                            <Input
                                placeholder="Enter full name"
                                size="large"
                                style={{
                                    borderRadius: "10px",
                                    padding: "8px 16px",
                                    height: "48px",
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e6e8eb",
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="phone"
                            label={
                                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                    <FiPhone style={{ marginRight: "8px", color: "#1890ff" }} />
                                    Phone <span style={{ color: "#ff4d4f" }}>*</span>
                                </span>
                            }
                            rules={[{ required: true, message: "Please enter phone number" }]}
                        >
                            <Input
                                placeholder="Enter phone number"
                                size="large"
                                style={{
                                    borderRadius: "10px",
                                    padding: "8px 16px",
                                    height: "48px",
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e6e8eb",
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="business_category"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiBriefcase style={{ marginRight: "8px", color: "#1890ff" }} />
                            Business Category <span style={{ color: "#ff4d4f" }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please select business category" }]}
                >
                    <Select
                        placeholder="Select business category"
                        size="large"
                        style={{
                            width: "100%",
                            borderRadius: "10px",
                        }}
                    >
                        {businessCategories.map((category) => (
                            <Option key={category} value={category}>
                                {category}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="description"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiMessageSquare style={{ marginRight: "8px", color: "#1890ff" }} />
                            Description <span style={{ color: "#ff4d4f" }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please enter description" }]}
                >
                    <TextArea
                        placeholder="Enter inquiry description"
                        rows={4}
                        showCount
                        maxLength={500}
                        style={{
                            borderRadius: "10px",
                            padding: "12px 16px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e6e8eb",
                            minHeight: "120px",
                            resize: "vertical",
                        }}
                    />
                </Form.Item>

                <Divider style={{ margin: "24px 0" }} />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                    }}
                >
                    <Button
                        size="large"
                        onClick={onCancel}
                        style={{
                            padding: "8px 24px",
                            height: "44px",
                            borderRadius: "10px",
                            border: "1px solid #e6e8eb",
                            fontWeight: "500",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{
                            padding: "8px 32px",
                            height: "44px",
                            borderRadius: "10px",
                            fontWeight: "500",
                            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                        }}
                    >
                        Update Inquiry
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditCompanyInquiry;