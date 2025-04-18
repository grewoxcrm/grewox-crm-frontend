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
  DatePicker,
  message,
  Switch,
} from "antd";
import { FiFileText, FiX, FiCalendar, FiUser, FiTag } from "react-icons/fi";
import dayjs from "dayjs";
import { useUpdateLeaveMutation } from "./services/LeaveApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";
import "./leave.scss";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditLeave = ({ open, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const [updateLeave, { isLoading }] = useUpdateLeaveMutation();
  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetEmployeesQuery();
  const employees = employeesData?.data || [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        employeeId: initialValues.employeeId,
        startDate: initialValues.startDate
          ? dayjs(initialValues.startDate)
          : null,
        endDate: initialValues.endDate ? dayjs(initialValues.endDate) : null,
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        employeeId: values.employeeId,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        leaveType: values.leaveType,
        reason: values.reason,
        isHalfDay: values.isHalfDay || false,
      };

      await updateLeave({ id: initialValues.id, data: payload }).unwrap();
      message.success("Leave request updated successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error(error?.data?.message || "Failed to update leave request");
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
              Edit Leave Request
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update leave request information
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="employeeId"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiUser style={{ marginRight: "8px", color: "#1890ff" }} />
                  Employee <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select employee" }]}
            >
              <Select
              listHeight={100}
              dropdownStyle={{
                Height: '100px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollBehavior: 'smooth'
              }}
                placeholder="Select Employee"
                size="large"
                loading={isLoadingEmployees}
                showSearch
                allowClear
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {Array.isArray(employees) &&
                  employees.map((employee) => (
                    <Option key={employee.id} value={employee.id}>
                      {`${employee.firstName} ${employee.lastName}`}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="leaveType"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiTag style={{ marginRight: "8px", color: "#1890ff" }} />
                  Leave Type <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select leave type" }]}
            >
              <Select
              listHeight={100}
              dropdownStyle={{
                Height: '100px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollBehavior: 'smooth'
              }}
                placeholder="Select Leave Type"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <Option value="annual">Annual Leave</Option>
                <Option value="sick">Sick Leave</Option>
                <Option value="personal">Personal Leave</Option>
                <Option value="maternity">Maternity Leave</Option>
                <Option value="paternity">Paternity Leave</Option>
                <Option value="bereavement">Bereavement Leave</Option>
                <Option value="unpaid">Unpaid Leave</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Start Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
                size="large"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="endDate"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  End Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select end date" }]}
            >
              <DatePicker
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
                size="large"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="reason"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              <FiFileText style={{ marginRight: "8px", color: "#1890ff" }} />
              Reason <span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          rules={[{ required: true, message: "Please enter reason" }]}
        >
          <TextArea
            rows={4}
            placeholder="Enter reason for leave"
            style={{
              borderRadius: "10px",
            }}
          />
        </Form.Item>

        <Form.Item
          name="isHalfDay"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Half Day Leave
            </span>
          }
          valuePropName="checked"
        >
          <Switch />
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
              borderRadius: "10px",
              height: "40px",
              padding: "0 24px",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            style={{
              borderRadius: "10px",
              height: "40px",
              padding: "0 24px",
            }}
          >
            Update Leave Request
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditLeave;
