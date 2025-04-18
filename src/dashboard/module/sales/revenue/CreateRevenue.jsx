import React from "react";
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
  message,
} from "antd";
import {
  FiDollarSign,
  FiX,
  FiCalendar,
  FiUser,
  FiHash,
  FiBriefcase,
  FiCreditCard,
  FiFileText,
  FiTag,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./revenue.scss";
import { useCreateRevenueMutation } from "./services/revenueApi";
import { useGetCustomersQuery } from "../customer/services/custApi";
import { useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateRevenue = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [createRevenue, { isLoading }] = useCreateRevenueMutation();
  const { data: custdata } = useGetCustomersQuery();
  const { data: currencyData } = useGetAllCurrenciesQuery();
  const customers = custdata?.data || [];
  const currencies = currencyData || [];

  const handleSubmit = async (values) => {
    try {
      // Create payload object instead of FormData
      const payload = {
        date: values.date.format("YYYY-MM-DD"),
        currency: values.currency,
        amount: Number(values.amount),
        account: values.account,
        customer: values.customer,
        category: values.category,
        description: values.description || "",
        paymentReceipt: values.paymentReceipt || "",
      };

      // Call API with JSON payload
      const response = await createRevenue(payload).unwrap();
      form.resetFields();
      if (onSubmit) {
        await onSubmit(response);
      }
      onCancel();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error(error?.data?.message || "Failed to create revenue");
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
        body: { padding: 0, borderRadius: "8px", overflow: "hidden" },
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
            <FiDollarSign style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Create New Revenue
            </h2>
            <Text
              style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.85)" }}
            >
              Fill in the information to create revenue
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Date
                </span>
              }
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker
                size="large"
                format="DD-MM-YYYY"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Category
                </span>
              }
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select
                size="large"
                placeholder="Select category"
                style={{ width: "100%", borderRadius: "10px" }}
                suffixIcon={<FiTag style={{ color: "#1890ff" }} />}
              >
                <Option value="Service Revenue">Service Revenue</Option>
                <Option value="Sales Revenue">Sales Revenue</Option>
                <Option value="Investment Revenue">Investment Revenue</Option>
                <Option value="Other Revenue">Other Revenue</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="currency"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Currency
                </span>
              }
              rules={[{ required: true, message: "Please select currency" }]}
            >
              <Select
                size="large"
                placeholder="Select currency"
                style={{ width: "100%", borderRadius: "10px" }}
                suffixIcon={<FiCreditCard style={{ color: "#1890ff" }} />}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {currencies && currencies.length > 0 ? (
                  currencies.map((currency) => (
                    <Option key={currency.id} value={currency.id}>
                      {currency.currencyCode} - {currency.currencyName}
                    </Option>
                  ))
                ) : (
                  <Option value="INR">INR - Indian Rupee</Option>
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="amount"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Amount
                </span>
              }
              rules={[{ required: true, message: "Please enter amount" }]}
            >
              <Input
                type="number"
                prefix={
                  <FiDollarSign
                    style={{ color: "#1890ff", fontSize: "16px" }}
                  />
                }
                placeholder="Enter amount"
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

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="account"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Account
                </span>
              }
              rules={[{ required: true, message: "Please select account" }]}
            >
              <Select
                size="large"
                placeholder="Select account"
                style={{ width: "100%", borderRadius: "10px" }}
                suffixIcon={<FiBriefcase style={{ color: "#1890ff" }} />}
              >
                <Option value="cash">Cash</Option>
                <Option value="bank">Bank Account</Option>
                <Option value="wallet">Digital Wallet</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="customer"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Customer
                </span>
              }
              rules={[{ required: true, message: "Please select customer" }]}
            >
              <Select
                size="large"
                placeholder="Select customer"
                style={{ width: "100%", borderRadius: "10px" }}
                suffixIcon={<FiUser style={{ color: "#1890ff" }} />}
                showSearch
                optionFilterProp="children"
              >
                {customers?.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="paymentReceipt"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Payment Receipt No.
                </span>
              }
              rules={[
                { required: true, message: "Please enter receipt number" },
              ]}
            >
              <Input
                prefix={
                  <FiHash style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter receipt number (e.g. RCPT/2024/001)"
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
          name="description"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Description
            </span>
          }
        >
          <TextArea
            placeholder="Enter description"
            rows={4}
            style={{
              borderRadius: "10px",
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
            }}
          />
        </Form.Item>

        <Divider style={{ margin: "24px 0" }} />

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}
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
            Create Revenue
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateRevenue;
