import React, { useEffect } from "react";
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
import { useUpdateCategoryMutation } from "../souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../../auth/services/authSlice";

const { Text } = Typography;
const { Option } = Select;

const EditCategoryModal = ({ visible, onCancel, category }) => {
  const [form] = Form.useForm();
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        color: category.color,
        status: category.status,
      });
    }
  }, [category, form]);

  const handleSubmit = async (values) => {
    try {
      await updateCategory({
        id: category?._id,
        ...values,
        updated_by: currentUser?.username,
      }).unwrap();
      
      message.success("Category updated successfully");
      onCancel();
    } catch (error) {
      message.error(error?.data?.message || "Failed to update category");
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="custom-modal"
    >
      <div className="modal-header">
        <Button type="text" onClick={onCancel} className="close-button">
          <FiX style={{ fontSize: "20px" }} />
        </Button>
        <div className="header-content">
          <div className="header-icon">
            <FiTag style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2>Edit Category</h2>
            <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
              Update category details
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="category-form"
      >
        <Form.Item
          name="name"
          label={
            <span>
              <FiType style={{ marginRight: "8px" }} />
              Category Name
            </span>
          }
          rules={[{ required: true, message: "Please enter category name" }]}
        >
          <Input placeholder="Enter category name" />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <span>
              <FiInfo style={{ marginRight: "8px" }} />
              Description
            </span>
          }
        >
          <Input.TextArea
            placeholder="Enter category description"
            rows={4}
          />
        </Form.Item>

        <Form.Item
          name="color"
          label={
            <span>
              <FiTag style={{ marginRight: "8px" }} />
              Category Color
            </span>
          }
          rules={[{ required: true, message: "Please select a color" }]}
        >
          <ColorPicker />
        </Form.Item>

        <Form.Item
          name="status"
          label={
            <span>
              <FiToggleRight style={{ marginRight: "8px" }} />
              Status
            </span>
          }
        >
          <Select>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Form.Item>

        <div className="form-actions">
          <Button onClick={onCancel} className="cancel-button">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="submit-button"
          >
            Update Category
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditCategoryModal; 