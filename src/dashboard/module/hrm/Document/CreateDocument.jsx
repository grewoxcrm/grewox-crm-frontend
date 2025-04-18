import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Select,
  Row,
  Col,
  Upload,
  message,
} from "antd";
import { FiX, FiFile, FiUser, FiUpload, FiFileText } from "react-icons/fi";
import { useDispatch } from "react-redux";
import {
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
} from "./services/documentApi";

const { Text } = Typography;
const { TextArea } = Input;

const CreateDocument = ({
  open,
  onCancel,
  onSubmit,
  isEditing,
  initialValues,
  loading,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [createDocument, { isLoading: isCreating }] =
    useCreateDocumentMutation();
  const [updateDocument, { isLoading: isUpdating }] =
    useUpdateDocumentMutation();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      // Create payload object for non-file data
      const payload = {
        name: values.name,
        role: values.role,
        description: values.description,
      };

      // Handle file upload
      if (
        values.file &&
        values.file.fileList &&
        values.file.fileList.length > 0
      ) {
        const file = values.file.fileList[0];
        if (file && file.originFileObj) {
          payload.file = file.originFileObj; // Send the raw File object
        }
      }

      if (isEditing && initialValues?.id) {
        // Update existing document
        await updateDocument({ id: initialValues.id, data: payload }).unwrap();
        message.success("Document updated successfully");
      } else {
        // Create new document
        await createDocument(payload).unwrap();
        message.success("Document created successfully");
      }

      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Form submission error:", error);
      message.error(
        error.data?.message || "Failed to submit form. Please try again."
      );
    }
  };

  const roles = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "employee", label: "Employee" },
    { value: "hr", label: "HR" },
  ];

  const uploadProps = {
    beforeUpload: (file) => {
      const isValidSize = file.size / 1024 / 1024 < 10; // 10MB limit
      if (!isValidSize) {
        message.error("File must be smaller than 10MB!");
        return false;
      }
      return true;
    },
    maxCount: 1,
    accept: ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png",
    multiple: false,
    showUploadList: true,
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
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
            <FiFile style={{ fontSize: "24px", color: "#ffffff" }} />
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
              {isEditing ? "Edit Document" : "Create New Document"}
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              {isEditing
                ? "Update document information"
                : "Fill in the information to create document"}
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
          padding: "24px",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Document Name
                </span>
              }
              rules={[
                { required: true, message: "Please enter document name" },
              ]}
            >
              <Input
                prefix={
                  <FiFile style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter document name"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                  transition: "all 0.3s ease",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="role"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Role
                </span>
              }
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select
                placeholder="Select role"
                options={roles}
                size="large"
                suffixIcon={
                  <FiUser style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                style={{
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Description
            </span>
          }
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <TextArea
            placeholder="Enter document description"
            rows={4}
            prefix={
              <FiFileText style={{ color: "#1890ff", fontSize: "16px" }} />
            }
            style={{
              borderRadius: "10px",
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
              transition: "all 0.3s ease",
              resize: "none",
            }}
          />
        </Form.Item>

        <Form.Item
          name="file"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Upload Document
            </span>
          }
          rules={[
            { required: !isEditing, message: "Please upload a document" },
          ]}
        >
          <Upload.Dragger
            {...uploadProps}
            customRequest={({ file, onSuccess }) => {
              // Store the file in form state with the correct structure
              const fileObj = {
                uid: file.uid,
                name: file.name,
                status: "done",
                originFileObj: file,
                fileList: [
                  {
                    uid: file.uid,
                    name: file.name,
                    status: "done",
                    originFileObj: file,
                  },
                ],
              };
              form.setFieldValue("file", fileObj);
              onSuccess();
            }}
            style={{
              borderRadius: "10px",
              backgroundColor: "#f8fafc",
              border: "1px dashed #e6e8eb",
              padding: "24px",
            }}
          >
            <p className="ant-upload-drag-icon">
              <FiUpload style={{ fontSize: "24px", color: "#1890ff" }} />
            </p>
            <p className="ant-upload-text">Click or drag file to upload</p>
            <p className="ant-upload-hint">
              Support for PDF, DOC, DOCX, TXT, JPG, JPEG, PNG files
            </p>
          </Upload.Dragger>
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
            size="large"
            style={{
              borderRadius: "10px",
              padding: "0 24px",
              height: "48px",
              border: "1px solid #e6e8eb",
              background: "#ffffff",
              color: "#262626",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isCreating || isUpdating}
            style={{
              borderRadius: "10px",
              padding: "0 24px",
              height: "48px",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
            }}
          >
            {isEditing ? "Update Document" : "Create Document"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateDocument;
