import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Row,
  Col,
  Divider,
  DatePicker,
  message,
  Upload,
} from "antd";
import {
  FiFileText,
  FiX,
  FiCalendar,
  FiUser,
  FiHash,
  FiUpload,
  FiBriefcase,
  FiCreditCard,
  FiTag,
  FiDollarSign,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useUpdateCreditNoteMutation } from "./services/creditNoteApi";
import { useGetCustomersQuery } from "../customer/services/custApi";
import { useGetInvoicesQuery } from "../invoice/services/invoiceApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import "./creditnotes.scss";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditCreditNotes = ({ open, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [updateCreditNote, { isLoading }] = useUpdateCreditNoteMutation();
  const { data: custdata } = useGetCustomersQuery();
  const customers = custdata?.data;

  const { data: invdata } = useGetInvoicesQuery();
  const invoices = invdata?.data;

  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const [selectedCurrency, setSelectedCurrency] = useState('₹');

  useEffect(() => {
    if (initialValues) {
      // Find the selected invoice
      const selectedInvoice = invoices?.find(inv => inv.id === initialValues.invoice);
      
      const formValues = {
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : null,
        // Set customer from invoice if available
        customer: selectedInvoice?.customer || initialValues.customer,
      };

      form.setFieldsValue(formValues);

      // Set initial currency icon
      const currencyDetails = currenciesData?.find(curr => curr.id === initialValues.currency);
      if (currencyDetails) {
        setSelectedCurrency(currencyDetails.currencyIcon || '₹');
      }
    }
  }, [initialValues, form, currenciesData, invoices]);

  const handleCurrencyChange = (value) => {
    const currencyDetails = currenciesData?.find(curr => curr.id === value);
    if (currencyDetails) {
      setSelectedCurrency(currencyDetails.currencyIcon || '₹');
    }
  };

  const handleInvoiceChange = (value) => {
    const selectedInvoice = invoices?.find(inv => inv.id === value);
    if (selectedInvoice) {
      // Set amount from invoice total
      form.setFieldsValue({
        amount: selectedInvoice.total,
        currency: selectedInvoice.currency,
        customer: selectedInvoice.customer
      });
      
      // Update selected currency icon
      const currencyDetails = currenciesData?.find(curr => curr.id === selectedInvoice.currency);
      if (currencyDetails) {
        setSelectedCurrency(currencyDetails.currencyIcon || '₹');
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Add all form fields to FormData
      Object.keys(values).forEach((key) => {
        if (key === "date" && values[key]) {
          formData.append(key, values[key].format("YYYY-MM-DD"));
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Add attachment if exists
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("attachment", fileList[0].originFileObj);
      }

      await updateCreditNote({ id: initialValues.id, data: formData }).unwrap();
      message.success("Credit note updated successfully");
      form.resetFields();
      setFileList([]);
      onCancel();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error(error?.data?.message || "Failed to update credit note");
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
              Edit Credit Note
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update credit note information
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
                  Invoice <span style={{ color: "#ff4d4f" }}>*</span>
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
                {invoices?.map((invoice) => (
                  <Option key={invoice.id} value={invoice.id}>
                    {invoice.salesInvoiceNumber} - {invoice.total}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="customer"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiUser style={{ marginRight: "8px", color: "#1890ff" }} />
                  Customer <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select customer" }]}
            >
              <Select
                placeholder="Select Customer"
                showSearch
                optionFilterProp="children"
                size="large"
                disabled={form.getFieldValue('invoice')}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
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
              name="currency"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCreditCard style={{ marginRight: "8px", color: "#1890ff" }} />
                  Currency <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select currency" }]}
            >
              <Select
                size="large"
                placeholder="Select currency"
                onChange={handleCurrencyChange}
                disabled={form.getFieldValue('invoice')}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
                suffixIcon={<FiCreditCard style={{ color: "#1890ff" }} />}
              >
                {currenciesData?.map((currency) => (
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
                  Amount <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter amount" }]}
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
                disabled={form.getFieldValue('invoice')}
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
            Update Credit Note
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditCreditNotes;
