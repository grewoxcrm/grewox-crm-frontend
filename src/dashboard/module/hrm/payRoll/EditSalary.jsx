import React, { useState } from "react";
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
  InputNumber,
} from "antd";
import {
  FiFileText,
  FiX,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiTag,
  FiCreditCard,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useUpdateSalaryMutation } from "./services/salaryApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";
import { useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
import "./salary.scss";

const { Text } = Typography;
const { Option } = Select;

const EditSalary = ({ open, onCancel, initialValues }) => {

  console.log(initialValues, "initialValues");

  const [form] = Form.useForm();
  const [updateSalary, { isLoading }] = useUpdateSalaryMutation();
  const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const { data: currenciesData, isLoading: isLoadingCurrencies } = useGetAllCurrenciesQuery();
  const employees = employeesData?.data || [];
  const currencies = currenciesData || [];

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        employeeId: initialValues.employeeId,
        employeeName: initialValues.employeeName,
        payslipType: initialValues.payslipType,
        currency: initialValues.currency,
        salary: initialValues.salary,
        netSalary: initialValues.netSalary,
        bankAccount: initialValues.bankAccount,
        paymentDate: dayjs(initialValues.paymentDate),
        status: initialValues.status
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        id: initialValues.id,
        data: {
          employeeId: values.employeeId,
          employeeName: values.employeeName,
          payslipType: values.payslipType,
          currency: values.currency,
          salary: values.salary.toString(),
          netSalary: values.netSalary.toString(),
          bankAccount: values.bankAccount,
          paymentDate: values.paymentDate.format("YYYY-MM-DD"),
          status: values.status
        }
      };

      const response = await updateSalary(payload).unwrap();

      if (response.success) {
        message.success("Salary record updated successfully");
        onCancel();
      }
    } catch (error) {
      console.error("Update Error:", error);
      message.error(error?.data?.message || "Failed to update salary record");
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
              Edit Salary Record
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update the salary record information
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
        style={{ padding: "24px" }}
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
              rules={[{ required: true, message: "Please select an employee" }]}
            >
              <Select
                placeholder="Select Employee"
                size="large"
                loading={isLoadingEmployees}
                disabled={true}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
              >
                {employees.map((employee) => (
                  <Option key={employee.id} value={employee.id}>
                    {`${employee.firstName} ${employee.lastName}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="payslipType"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiTag style={{ marginRight: "8px", color: "#1890ff" }} />
                  Payslip Type <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select payslip type" }]}
            >
              <Select
                placeholder="Select Payslip Type"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <Option value="Monthly">Monthly</Option>
                <Option value="Weekly">Weekly</Option>
                <Option value="Bi-Weekly">Bi-Weekly</Option>
                <Option value="Annual">Annual</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="salary"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign style={{ marginRight: "8px", color: "#1890ff" }} />
                  Salary <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter salary" }]}
            >
              <Input
                placeholder="Enter salary"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="netSalary"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign style={{ marginRight: "8px", color: "#1890ff" }} />
                  Net Salary <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter net salary" }]}
            >
              <Input
                placeholder="Enter net salary"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="currency"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign style={{ marginRight: "8px", color: "#1890ff" }} />
                  Currency <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select currency" }]}
            >
              <Select
                placeholder="Select Currency"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                {currencies.map(currency => (
                  <Option key={currency.id} value={currency.id}>
                    {currency.currencyIcon} {currency.currencyCode}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="status"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Status <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                placeholder="Select Status"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <Option value="paid">Paid</Option>
                <Option value="unpaid">Unpaid</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="bankAccount"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCreditCard style={{ marginRight: "8px", color: "#1890ff" }} />
                  Bank Account <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter bank account" }]}
            >
              <Input
                placeholder="Enter bank account number"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="paymentDate"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar style={{ marginRight: "8px", color: "#1890ff" }} />
                  Payment Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select payment date" }]}
            >
              <DatePicker
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
                size="large"
                format="DD-MM-YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "24px" }}>
              <Button
                onClick={onCancel}
                size="large"
                style={{
                  borderRadius: "8px",
                  padding: "0 24px",
                  height: "48px",
                  border: "1px solid #d9d9d9",
                  color: "#595959",
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                style={{
                  borderRadius: "8px",
                  padding: "0 24px",
                  height: "48px",
                  background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
                  border: "none",
                }}
              >
                Update Salary Record
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditSalary;
