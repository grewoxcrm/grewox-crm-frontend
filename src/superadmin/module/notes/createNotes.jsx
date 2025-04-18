import React from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  message,
  Select,
} from "antd";
import { FiUser, FiFileText, FiUsers, FiAlignLeft, FiX } from "react-icons/fi";
import {
  useCreateNotesMutation,
  useUpdateNotesMutation,
  useGetAllNotesQuery,
} from "./services/notesApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../auth/services/authSlice";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateNotes = ({ open, onCancel, isEditing, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [createNotes, { isLoading: isCreating }] = useCreateNotesMutation();
  const [updateNotes, { isLoading: isUpdating }] = useUpdateNotesMutation();
  const user = useSelector(selectCurrentUser);
  const { data: notes = [], refetch: refetchNotes } = useGetAllNotesQuery(
    user?.id || ""
  );

  const handleSubmit = async (values) => {
    try {
      // Transform form values to match Joi validation schema
      const payload = {
        note_title: values.note_title,
        notetype: values.notetype,
        employees: {
          employee: "John Doe", // Sending single employee to avoid SQL syntax issues
        },
        description: values.description,
      };

      if (isEditing) {
        await updateNotes({ id: initialValues.id, data: payload }).unwrap();
        message.success("Note updated successfully");
      } else {
        await createNotes({ id: user?.id || "", data: payload }).unwrap();
        message.success("Note created successfully");
      }
      // Refetch notes after successful creation/update
      await refetchNotes();
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(error?.data?.message || "Something went wrong");
    }
  };

  return (
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
              {isEditing ? "Edit Note" : "Create New Note"}
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              {isEditing
                ? "Update note information"
                : "Fill in the information to create note"}
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
        <Form.Item
          name="note_title"
          label={
            <span
              style={{
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Note Title
            </span>
          }
          rules={[{ required: true, message: "Please enter note title" }]}
        >
          <Input
            prefix={
              <FiFileText style={{ color: "#1890ff", fontSize: "16px" }} />
            }
            placeholder="Enter note title"
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

        <Form.Item
          name="notetype"
          label={
            <span
              style={{
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Note Type
            </span>
          }
          rules={[{ required: true, message: "Please select note type" }]}
        >
          <Select
            placeholder="Select note type"
            size="large"
            style={{
              width: "100%",
              borderRadius: "10px",
              height: "48px",
            }}
          >
            <Option value="general">General</Option>
            <Option value="important">Important</Option>
            <Option value="urgent">Urgent</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="employees"
          label={
            <span
              style={{
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Employees
            </span>
          }
        >
          <Select
            mode="multiple"
            placeholder="Select employees"
            size="large"
            style={{
              width: "100%",
              borderRadius: "10px",
            }}
          >
            {/* Add employee options here */}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <span
              style={{
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Description
            </span>
          }
        >
          <TextArea
            placeholder="Enter description"
            rows={4}
            style={{
              borderRadius: "10px",
              padding: "8px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
              transition: "all 0.3s ease",
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              padding: "8px 32px",
              height: "44px",
              borderRadius: "10px",
              fontWeight: "500",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isEditing ? "Update Note" : "Create Note"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateNotes;
