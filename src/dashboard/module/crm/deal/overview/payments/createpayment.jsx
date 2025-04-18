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
  Divider,
  message,
} from "antd";
import {
  FiDollarSign,
  FiX,
  FiCalendar,
  FiCreditCard,
  FiMessageSquare,
  FiFileText,
  FiHash,
} from "react-icons/fi";
import { useCreateDealPaymentMutation } from "./services/dealpaymentApi";
import { useGetAllCurrenciesQuery } from "../../../../settings/services/settingsApi";
import { useGetDealInvoicesQuery } from "../invoices/services/dealinvoiceApi";
import dayjs from "dayjs";
import { useGetInvoicesQuery } from "../../../../sales/invoice/services/invoiceApi";

const { Text } = Typography;
const { Option } = Select;

const CreatePayment = ({ open, onCancel, dealId, currentUser }) => {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createPayment] = useCreateDealPaymentMutation();
  const { data: currencies = [] } = useGetAllCurrenciesQuery({
    page: 1,
    limit: 100
  });
  const { data: invoicesResponse = { data: [] } } = useGetInvoicesQuery();
  const invoicessData = invoicesResponse.data;
  const invoicesData = invoicessData.filter(invoice => invoice.related_id === dealId);
  const [selectedCurrency, setSelectedCurrency] = useState('₹');

  const handleInvoiceChange = (value) => {
    const selectedInvoice = invoicesData.find(invoice => invoice.id === value);
    if (selectedInvoice) {
      // Set amount from invoice total
      form.setFieldsValue({
        amount: selectedInvoice.total,
        currency: selectedInvoice.currency
      });

      // Update selected currency icon
      const currencyDetails = currencies.find(curr => curr.id === selectedInvoice.currency);
      if (currencyDetails) {
        setSelectedCurrency(currencyDetails.currencyIcon || '₹');
      }

      // Store selected invoice amount for validation
      form.setFieldValue('max_amount', selectedInvoice.total);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Check if payment amount exceeds invoice amount
      if (parseFloat(values.amount) > parseFloat(values.max_amount)) {
        message.error("Payment amount cannot exceed invoice amount");
        return;
      }

      await createPayment({
        id: dealId,
        data: {
          invoice: values.invoice,
          paidOn: values.paidOn?.format("YYYY-MM-DD"),
          amount: values.amount?.toString(),
          currency: values.currency,
          paymentMethod: values.paymentMethod,
          remark: values.remark,
          created_by: currentUser?.name || "Unknown User",
        },
      }).unwrap();
      
      message.success("Payment created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(error?.data?.message || "Failed to create payment");
    } finally {
      setLoading(false);
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
              Add New Payment
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the payment details
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
              name="invoice"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiHash style={{ marginRight: "8px", color: "#1890ff" }} />
                  Invoice <span style={{ color: '#ff4d4f' }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select invoice" }]}
            >
              <Select
                placeholder="Select Invoice"
                showSearch
                optionFilterProp="children"
                size="large"
                onChange={handleInvoiceChange}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                {invoicesData?.filter(invoice => invoice.payment_status !== 'paid').map((invoice) => (
                  <Option key={invoice.id} value={invoice.id}>
                    {invoice.salesInvoiceNumber} 
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="paidOn"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar style={{ marginRight: "8px", color: "#1890ff" }} />
                  Paid On <span style={{ color: '#ff4d4f' }}>*</span>
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
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="currency"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCreditCard style={{ marginRight: "8px", color: "#1890ff" }} />
                  Currency <span style={{ color: '#ff4d4f' }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select currency" }]}
            >
              <Select
                size="large"
                placeholder="Select currency"
                disabled
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
                suffixIcon={<FiCreditCard style={{ color: "#1890ff" }} />}
              >
                {currencies.map((currency) => (
                  <Option key={currency.id} value={currency.id}>
                    {currency.currencyName} ({currency.currencyIcon})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="amount"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign style={{ marginRight: "8px", color: "#1890ff" }} />
                  Amount <span style={{ color: '#ff4d4f' }}>*</span>
                </span>
              }
              rules={[
                { required: true, message: "Please enter amount" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const maxAmount = getFieldValue('max_amount');
                    if (!value || !maxAmount || parseFloat(value) <= parseFloat(maxAmount)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Amount cannot exceed invoice amount'));
                  },
                }),
              ]}
            >
              <Input
                type="number"
                prefix={
                  <span style={{ color: "#1890ff", fontSize: "16px" }}>
                    {selectedCurrency}
                  </span>
                }
                placeholder="Enter amount"
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
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="paymentMethod"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCreditCard style={{ marginRight: "8px", color: "#1890ff" }} />
                  Payment Method <span style={{ color: '#ff4d4f' }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select payment method" }]}
            >
              <Select
                size="large"
                placeholder="Select payment method"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <Option value="cash">Cash</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
                <Option value="credit_card">Credit Card</Option>
                <Option value="debit_card">Debit Card</Option>
                <Option value="upi">UPI</Option>
                <Option value="cheque">Cheque</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="remark"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              <FiMessageSquare style={{ marginRight: "8px", color: "#1890ff" }} />
              Remark
            </span>
          }
        >
          <Input.TextArea
            placeholder="Enter remarks"
            rows={4}
            style={{
              borderRadius: "10px",
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
            }}
          />
        </Form.Item>

        {/* Hidden field to store max_amount for validation */}
        <Form.Item name="max_amount" hidden>
          <Input />
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
            Create Payment
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePayment;
