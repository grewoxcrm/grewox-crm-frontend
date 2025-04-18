import React from "react";
import { Modal, Form, Input, Button, Typography, message, Select } from "antd";
import { FiX, FiFileText } from "react-icons/fi";
import { useUpdateNotesMutation } from "./services/NotesApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditNotes = ({ visible, onCancel, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [updateNotes, { isLoading: isUpdating }] = useUpdateNotesMutation();

  React.useEffect(() => {
    if (visible && initialValues) {
      console.log("Modal opened with initialValues:", initialValues);

      // Reset form first
      form.resetFields();

      try {
        // Parse the employees JSON string if it exists
        let employeeIds = [];
        if (initialValues.employees) {
          const employeesData =
            typeof initialValues.employees === "string"
              ? JSON.parse(initialValues.employees)
              : initialValues.employees;

          employeeIds = employeesData?.employees?.employee || [];
          // Ensure employeeIds is always an array
          employeeIds = Array.isArray(employeeIds)
            ? employeeIds
            : [employeeIds];
        }

        // Set all form values at once
        form.setFieldsValue({
          note_title: initialValues.note_title || "",
          notetype: initialValues.notetype || "",
          description: initialValues.description || "",
          employee_ids: employeeIds,
        });

        console.log("Form values set:", {
          note_title: initialValues.note_title,
          notetype: initialValues.notetype,
          description: initialValues.description,
          employee_ids: employeeIds,
        });
      } catch (error) {
        console.error("Error setting form values:", error);
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      // Transform the form values to match the backend schema
      const formattedData = {
        note_title: values.note_title,
        notetype: values.notetype,
        description: values.description,
        employees:
          values.employee_ids?.length > 0
            ? {
                employees: {
                  employee: values.employee_ids,
                },
              }
            : null,
      };

      updateNotes({ id: initialValues.id, data: formattedData })
        .unwrap()
        .then(() => {
          message.success("Note updated successfully");
          onCancel();
        })
        .catch((error) => {
          message.error(error?.data?.message || "Failed to update note");
        });
    });
  };

  return (
    <Modal
      title={null}
      open={visible}
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
              Edit Note
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update note information
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
        <div
          style={{
            display: "grid",
            gap: "24px",
            marginBottom: "24px",
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
                height: "48px",
              }}
              dropdownStyle={{
                padding: "8px",
                borderRadius: "10px",
              }}
            >
              <Option value="general">General</Option>
              <Option value="important">Important</Option>
              <Option value="urgent">Urgent</Option>
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
              placeholder="Enter note description"
              rows={4}
              style={{
                borderRadius: "10px",
                padding: "12px 16px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
                transition: "all 0.3s ease",
              }}
            />
          </Form.Item>

          <Form.Item
            name="employee_ids"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Assigned Employees
              </span>
            }
          >
            <Select
              mode="multiple"
              placeholder="Select employees"
              size="large"
              style={{
                width: "100%",
              }}
              dropdownStyle={{
                padding: "8px",
                borderRadius: "10px",
              }}
            >
              <Option value="bhhnjh">Employee 1</Option>
              <Option value="uhyhgh">Employee 2</Option>
            </Select>
          </Form.Item>
        </div>

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
            onClick={handleSubmit}
            loading={isUpdating || loading}
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
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditNotes;
