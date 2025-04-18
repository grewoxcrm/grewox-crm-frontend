import React from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  message,
  ColorPicker,
} from "antd";
import {
  FiTag,
  FiX,
  FiType,
  FiInfo,
  FiToggleRight,
} from "react-icons/fi";
import { useCreateCategoryMutation } from "../souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../auth/services/authSlice";

const { Text } = Typography;
const { Option } = Select;

const AddCategoryModal = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const user = useSelector(selectCurrentUser);

  const handleSubmit = async (values) => {
    try {
      await createCategory({
        id: user?.id,
        data: {
          name: values.name,
          lableType: "category",
        },
      }).unwrap();
      
      message.success("Category created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(error?.data?.message || "Failed to create category");
    }
  };

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
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
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
            }}
          >
            <FiTag style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Add Category
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Create a new category for better organization
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        style={{ padding: "24px" }}
      >
        <Form.Item
          name="name"
          label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Category Name</span>}
          rules={[{ required: true, message: "Please enter the category name" }]}
        >
          <Input
            prefix={<FiType style={{ color: "#9ca3af" }} />}
            placeholder="Enter category name"
            style={{
              borderRadius: "10px",
              padding: "8px 16px",
              height: "48px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
            }}
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <Button
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
            type="primary"
            htmlType="submit"
            loading={isLoading}
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
            Add Category
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal; 