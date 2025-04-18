import React from "react";
import { Table, Avatar, Dropdown, Button, message, Tag, Typography, Select } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
} from "react-icons/fi";
import { useDeleteDealPaymentMutation, useGetDealPaymentsQuery, useUpdateDealPaymentMutation } from "./services/dealpaymentApi";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../../auth/services/authSlice";
import { useGetAllCurrenciesQuery } from "../../../../settings/services/settingsApi";
import { useGetDealInvoicesQuery } from "../invoices/services/dealinvoiceApi";
import { useGetInvoicesQuery } from "../../../../sales/invoice/services/invoiceApi";

const { Text } = Typography;
const { Option } = Select;

const PaymentsList = ({ deal, onEdit, onView }) => {

  const dealId = deal?.deal?.id;
  const loggedInUser = useSelector(selectCurrentUser);
  const { data: paymentsResponse, isLoading, error } = useGetDealPaymentsQuery(dealId);
  const [deletePayment, { isLoading: isDeleting }] = useDeleteDealPaymentMutation();
  const [updatePayment] = useUpdateDealPaymentMutation();
  const { data: currencies = [] } = useGetAllCurrenciesQuery({
    page: 1,
    limit: 100
  });
  const { data: dealinvoicedata } = useGetInvoicesQuery(dealId);

  // Ensure payments is always an array and filter by related_id
  const payments = React.useMemo(() => {
    const paymentData = Array.isArray(paymentsResponse?.data) 
      ? paymentsResponse.data 
      : paymentsResponse?.data 
        ? [paymentsResponse.data] 
        : [];
    
    // Filter payments where related_id matches dealId
    return paymentData.filter(payment => payment.related_id === dealId);
  }, [paymentsResponse, dealId]);



  // Function to get currency details by ID or code
  const getCurrencyDetails = (currencyIdOrCode) => {
    const currency = currencies.find(c => c.id === currencyIdOrCode || c.currencyCode === currencyIdOrCode);
    return currency || { currencyIcon: currencyIdOrCode, currencyCode: currencyIdOrCode };
  };

  // Function to get invoice details by ID
  const getInvoiceDetails = (invoiceId) => {
    return dealinvoicedata?.data?.find(inv => inv.id === invoiceId);
  };

  const handleStatusChange = async (record, newStatus) => {
    try {
      await updatePayment({
        id: record.id,
        data: {
          ...record,
          status: newStatus
        }
      }).unwrap();
      message.success("Payment status updated successfully");
    } catch (error) {
      message.error("Failed to update payment status: " + (error.data?.message || "Unknown error"));
    }
  };

  const getStatusTag = (status) => {
    let color = "";
    switch (status?.toLowerCase()) {
      case "completed":
        color = "success";
        break;
      case "pending":
        color = "warning";
        break;
      case "failed":
        color = "error";
        break;
      case "cancelled":
        color = "default";
        break;
      default:
        color = "default";
    }
    return <Tag color={color}>{status || "Unknown"}</Tag>;
  };

  const handleDelete = async (record) => {
    try {
      await deletePayment(record.id).unwrap();
      message.success("Payment deleted successfully");
    } catch (error) {
      message.error(
        "Failed to delete payment: " + (error.data?.message || "Unknown error")
      );
    }
  };

  const getMethodTag = (method) => {
    let className = "";
    switch (method?.toLowerCase()) {
      case "cash":
        className = "cash";
        break;
      case "bank_transfer":
        className = "bank_transfer";
        break;
      case "credit_card":
        className = "credit_card";
        break;
      case "debit_card":
        className = "debit_card";
        break;
      case "upi":
        className = "upi";
        break;
      case "cheque":
        className = "cheque";
        break;
      default:
        className = "";
    }
    return <Tag className={`method-tag ${className}`}>{method || "Unknown"}</Tag>;
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onView(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => onEdit(record),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => handleDelete(record),
        danger: true,
        disabled: isDeleting,
      },
    ],
  });

  const columns = [
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      sorter: (a, b) => (a.invoice || "").localeCompare(b.invoice || ""),
      render: (text, record) => {
        const invoiceDetails = getInvoiceDetails(text);
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar 
              icon={<FiDollarSign />} 
              style={{ 
                backgroundColor: "#e6f7ff", 
                color: "#1890ff",
                marginRight: "12px" 
              }} 
            />
            <div>
              <Text strong>{invoiceDetails?.salesInvoiceNumber || text || "-"}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.remark || "-"}
                </Text>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status, record) => (
        <Select
          value={status || "pending"}
          style={{ width: "100%" }}
          onChange={(value) => handleStatusChange(record, value)}
          bordered={false}
          dropdownMatchSelectWidth={false}
        >
          <Option value="pending">
            <Tag color="warning">Pending</Tag>
          </Option>
          <Option value="completed">
            <Tag color="success">Completed</Tag>
          </Option>
          <Option value="failed">
            <Tag color="error">Failed</Tag>
          </Option>
          <Option value="cancelled">
            <Tag color="default">Cancelled</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: "Paid On",
      dataIndex: "paidOn",
      key: "paidOn",
      sorter: (a, b) => {
        const dateA = a.paidOn ? new Date(a.paidOn).getTime() : 0;
        const dateB = b.paidOn ? new Date(b.paidOn).getTime() : 0;
        return dateA - dateB;
      },
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) => {
        const currencyDetails = getCurrencyDetails(record.currency);
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text strong>
              {currencyDetails.currencyIcon} {record.amount ? `${record.amount}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "-"}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => getMethodTag(method),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              border: "none",
            }}
          />
        </Dropdown>
      ),
    },
  ];

  if (error) {
    return <div>Error loading payments: {error.message}</div>;
  }

  return (
    <div className="payment-content">
      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} payments`,
        }}
        className="payment-table"
      />
    </div>
  );
};

export default PaymentsList;
