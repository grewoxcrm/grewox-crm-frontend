import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  DatePicker,
  Row,
  Col,
  Divider,
  Upload,
  message,
  Tag,
} from "antd";
import {
  FiCheckSquare,
  FiX,
  FiCalendar,
  FiFlag,
  FiMapPin,
  FiUser,
  FiUpload,
} from "react-icons/fi";
import moment from "moment";
import { useUpdateTaskMutation } from "./services/taskApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditTask = ({ open, onCancel, onSubmit, initialValues, users = [] }) => {
  const [form] = Form.useForm();
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const [fileList, setFileList] = useState([]);

  const filterAssignTo = (assignTo) => {
    try {
      if (typeof assignTo === "string") {
        const parsed = JSON.parse(assignTo);
        return parsed?.assignedusers || [];
      }
      if (assignTo?.assignedusers) {
        return assignTo.assignedusers;
      }
      return [];
    } catch (error) {
      console.error("Error parsing assignTo:", error);
      return Array.isArray(assignTo) ? assignTo : [];
    }
  };

  useEffect(() => {
    if (initialValues) {
      console.log('Initial Values in EditTask:', initialValues);
      const formattedValues = {
        taskName: initialValues.taskName || initialValues.task_name || "",
        task_reporter: initialValues.task_reporter || "",
        startDate: initialValues.startDate ? moment(initialValues.startDate) : null,
        dueDate: initialValues.dueDate ? moment(initialValues.dueDate) : null,
        reminder_date: initialValues.reminder_date ? moment(initialValues.reminder_date) : null,
        priority: initialValues.priority || "",
        status: initialValues.status || "",
        description: initialValues.description || "",
        assignTo: filterAssignTo(initialValues.assignTo),
      };
      console.log('Formatted Values in EditTask:', formattedValues);
      form.setFieldsValue(formattedValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      console.log('Form Values before submission:', values);
      if (!values.taskName) {
        message.error('Task name is required');
        return;
      }

      const formData = new FormData();

      formData.append("taskName", values.taskName || "");
      formData.append("task_reporter", values.task_reporter || "");
      formData.append(
        "startDate",
        values.startDate?.format("YYYY-MM-DD") || ""
      );
      formData.append("dueDate", values.dueDate?.format("YYYY-MM-DD") || "");
      formData.append(
        "reminder_date",
        values.reminder_date?.format("YYYY-MM-DD") || ""
      );
      formData.append("priority", values.priority || "");
      formData.append("status", values.status || "");
      formData.append("description", values.description || "");

      if (Array.isArray(values.assignTo) && values.assignTo.length > 0) {
        values.assignTo.forEach((userId, index) => {
          if (userId && userId.trim() !== "") {
            formData.append(`assignTo[assignedusers][${index}]`, userId);
          }
        });
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("file", fileList[0].originFileObj);
      }

      console.log('Form data being sent:', {
        taskName: values.taskName,
        task_reporter: values.task_reporter,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        dueDate: values.dueDate?.format("YYYY-MM-DD"),
        reminder_date: values.reminder_date?.format("YYYY-MM-DD"),
        priority: values.priority,
        status: values.status,
        description: values.description,
        assignTo: values.assignTo
      });

      // Send the update request
      const response = await updateTask({
        id: initialValues.id,
        data: formData,
      }).unwrap();

      message.success("Task updated successfully");
      form.resetFields();
      setFileList([]);
      onSubmit?.(response);
      onCancel();
    } catch (error) {
      console.error("Update Error:", error);
      message.error(error?.data?.message || "Failed to update task");
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
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
            <FiCheckSquare style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Edit Task
            </h2>
            <Text style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.85)" }}>
              Update task information
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        style={{ padding: "24px" }}
      >
        <Form.Item
          name="taskName"
          label="Task Name"
          rules={[
            { required: true, message: "Please enter task name" },
            { max: 100, message: "Task name cannot exceed 100 characters" },
          ]}
        >
          <Input
            prefix={<FiMapPin style={{ color: "#1890ff" }} />}
            placeholder="Enter task name"
            size="large"
            style={{
              borderRadius: "10px",
              height: "48px",
              backgroundColor: "#f8fafc",
            }}
          />
        </Form.Item>

        <Form.Item
          name="task_reporter"
          label="Task Reporter"
          rules={[{ required: true, message: "Please select task reporter" }]}
        >
          <Select
            showSearch
            placeholder="Select task reporter"
            size="large"
            style={{ width: "100%" }}
            optionFilterProp="children"
          >
            {users.map((user) => (
              <Option key={user.id} value={user.id}>
                {user.username || user.email}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker
                size="large"
                format="YYYY-MM-DD"
                style={{ width: "100%", borderRadius: "10px", height: "48px" }}
                suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={[{ required: true, message: "Please select due date" }]}
            >
              <DatePicker
                size="large"
                format="YYYY-MM-DD"
                style={{ width: "100%", borderRadius: "10px", height: "48px" }}
                suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="reminder_date"
          label="Reminder Date"
        >
          <DatePicker
            size="large"
            format="YYYY-MM-DD"
            style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: "Please select priority" }]}
            >
              <Select
                size="large"
                placeholder="Select priority"
                style={{ width: "100%" }}
                suffixIcon={<FiFlag style={{ color: "#1890ff" }} />}
              >
                <Option value="High">High</Option>
                <Option value="Medium">Medium</Option>
                <Option value="Low">Low</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                size="large"
                placeholder="Select status"
                style={{ width: "100%" }}
              >
                <Option value="Todo">Todo</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="Completed">Completed</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="assignTo"
          label="Assign To"
          rules={[{ required: true, message: "Please select assignees" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select assignees"
            size="large"
            style={{
              width: "100%",
              borderRadius: "10px",
            }}
            listHeight={100}
            dropdownStyle={{
              maxHeight: '120px',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollBehavior: 'smooth'
            }}
            suffixIcon={<FiUser style={{ color: "#1890ff" }} />}
            optionFilterProp="children"
            showSearch
            maxTagCount={3}
            maxTagPlaceholder={(omittedValues) => `+ ${omittedValues.length} more`}
            removeIcon={<FiX style={{ fontSize: '14px', color: '#ffffff' }} />}
            tagRender={(props) => {
              const { label, closable, onClose } = props;
              return (
                <Tag
                  color="blue"
                  closable={closable}
                  onClose={onClose}
                  style={{
                    marginRight: 3,
                    padding: '4px 8px',
                    fontSize: '12px',
                    borderRadius: '6px',
                  }}
                >
                  {label}
                </Tag>
              );
            }}
            onDeselect={(value) => {
              // Force dropdown to update when an option is deselected
              const select = document.querySelector('.ant-select-selector');
              if (select) {
                const event = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                select.dispatchEvent(event);
              }
            }}
          >
            {users.map((user) => {
              const value = form.getFieldValue('assignTo') || [];
              const isSelected = value.includes(user.id);
              return (
                <Option
                  key={user.id}
                  value={user.id}
                  style={isSelected ? { display: 'none' } : undefined}
                >
                  {user.username || user.email}
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea
            placeholder="Enter task description"
            rows={4}
            style={{
              borderRadius: "10px",
              backgroundColor: "#f8fafc",
            }}
          />
        </Form.Item>

        <Form.Item
          name="file"
          label="Task File"
        >
          <Upload
            maxCount={1}
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={(file) => {
              const isValidFileType = [
                "image/jpeg",
                "image/png",
                "application/pdf",
              ].includes(file.type);
              const isValidFileSize = file.size / 1024 / 1024 < 5;

              if (!isValidFileType) {
                message.error("You can only upload JPG/PNG/PDF files!");
                return Upload.LIST_IGNORE;
              }
              if (!isValidFileSize) {
                message.error("File must be smaller than 5MB!");
                return Upload.LIST_IGNORE;
              }
              return false;
            }}
            customRequest={({ onSuccess }) => onSuccess("ok")}
          >
            <Button
              icon={<FiUpload />}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "10px",
                backgroundColor: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Click to Upload File
            </Button>
          </Upload>
        </Form.Item>

        <Divider style={{ margin: "24px 0" }} />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <Button
            size="large"
            onClick={onCancel}
            style={{
              padding: "8px 24px",
              height: "44px",
              borderRadius: "10px",
              fontWeight: "500",
            }}
          >
            Cancel
          </Button>
          <Button
            size="large"
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
            }}
          >
            Update Task
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditTask;
