import React from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Space,
    Select,
    Switch,
    Divider,
    DatePicker,
} from "antd";
import {
    FiFileText,
    FiX,
    FiPlus,
    FiMinus,
    FiCalendar,
    FiMapPin,
} from "react-icons/fi";
import "./CustomForm.scss";
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const fieldTypes = [
    { value: 'string', label: 'Text Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'boolean', label: 'Yes/No (Boolean)' },
    { value: 'text', label: 'Long Text' }
];

const CreateCustomForm = ({ open, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        try {
            // Transform fields array to object format
            const fieldsObject = values.fields.reduce((acc, field) => {
                acc[field.name] = {
                    type: field.type,
                    required: field.required
                };
                return acc;
            }, {});

            const formData = {
                ...values,
                fields: fieldsObject,
                start_date: values.event_dates[0].toISOString(),
                end_date: values.event_dates[1].toISOString(),
            };
            delete formData.event_dates;

            await onSubmit(formData);
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
                            Create Custom Form
                        </h2>
                        <Text
                            style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            Create a new custom form with dynamic fields
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
                <Form.Item
                    name="title"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiFileText style={{ marginRight: "8px", color: "#1890ff" }} />
                            Form Title <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please enter form title" }]}
                >
                    <Input
                        placeholder="Enter form title"
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

                <Form.Item
                    name="description"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiFileText style={{ marginRight: "8px", color: "#1890ff" }} />
                            Description <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please enter form description" }]}
                >
                    <TextArea
                        placeholder="Enter form description"
                        rows={4}
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

                <Divider style={{ margin: "24px 0" }}>Event Details</Divider>

                <Form.Item
                    name="event_name"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiCalendar style={{ marginRight: "8px", color: "#1890ff" }} />
                            Event Name <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please enter event name" }]}
                >
                    <Input
                        placeholder="Enter event name"
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

                <Form.Item
                    name="event_location"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiMapPin style={{ marginRight: "8px", color: "#1890ff" }} />
                            Event Location <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please enter event location" }]}
                >
                    <Input
                        placeholder="Enter event location"
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

                <Form.Item
                    name="event_dates"
                    label={
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            <FiCalendar style={{ marginRight: "8px", color: "#1890ff" }} />
                            Event Dates <span style={{ color: '#ff4d4f' }}>*</span>
                        </span>
                    }
                    rules={[{ required: true, message: "Please select event dates" }]}
                >
                    <RangePicker
                        format="YYYY-MM-DD"
                        placeholder={["Start Date", "End Date"]}
                        style={{
                            width: "100%",
                            borderRadius: "10px",
                            padding: "8px 16px",
                            height: "48px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e6e8eb",
                        }}
                    />
                </Form.Item>

                <Divider style={{ margin: "24px 0" }}>Form Fields</Divider>

                <Form.List
                    name="fields"
                    initialValue={[{ name: '', type: 'string', required: false }]}
                >
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8, width: '100%' }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'name']}
                                        rules={[{ required: true, message: 'Missing field name' }]}
                                        style={{ flex: 1 }}
                                    >
                                        <Input
                                            placeholder="Field name"
                                            style={{
                                                borderRadius: "10px",
                                                padding: "8px 16px",
                                                backgroundColor: "#f8fafc",
                                                border: "1px solid #e6e8eb",
                                            }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'type']}
                                        rules={[{ required: true, message: 'Missing field type' }]}
                                    >
                                        <Select
                                            style={{
                                                width: 130,
                                                borderRadius: "10px",
                                            }}
                                            placeholder="Field type"
                                        >
                                            {fieldTypes.map(type => (
                                                <Option key={type.value} value={type.value}>
                                                    {type.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'required']}
                                        valuePropName="checked"
                                        initialValue={false}
                                    >
                                        <Switch checkedChildren="Required" unCheckedChildren="Optional" />
                                    </Form.Item>
                                    <Button
                                        type="text"
                                        icon={<FiMinus />}
                                        onClick={() => remove(name)}
                                        style={{
                                            color: "#ff4d4f",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                    icon={<FiPlus />}
                                    style={{
                                        borderRadius: "10px",
                                        height: "44px",
                                    }}
                                >
                                    Add Field
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

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
                        Create Form
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateCustomForm;