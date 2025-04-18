import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Dropdown,
  Menu,
  Breadcrumb,
  Modal,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiDownload,
  FiGrid,
  FiList,
  FiHome,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import "./payment.scss";
import CreatePayment from "./createpayment";
import PaymentsList from "./paymentsList";
import EditPayment from "./Editpayment";

const { Title, Text } = Typography;

const DealPayments = (deal) => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchText, setSearchText] = useState("");

  const handleCreate = () => {
    setSelectedPayment(null);
    setCreateModalVisible(true);
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setEditModalVisible(true);
  };

  const handleDelete = (payment) => {
    Modal.confirm({
      title: "Delete Payment",
      content: "Are you sure you want to delete this payment?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        // Handle delete action
      },
    });
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
  };

  const exportMenu = {
    items: [
      {
        key: "csv",
        label: "Export as CSV",
      },
      {
        key: "excel",
        label: "Export as Excel",
      },
      {
        key: "pdf",
        label: "Export as PDF",
      },
    ],
  };

  return (
    <div className="payment-page">
      {/* <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/dashboard/sales">Sales</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Payments</Breadcrumb.Item>
        </Breadcrumb>
      </div> */}

      <div className="page-header">
        <div className="header-left">
          <h2>Payments</h2>
          <Text className="subtitle">Manage your payments</Text>
        </div>

        <div className="header-right">
          <Input
            prefix={<FiSearch style={{ color: "#9CA3AF" }} />}
            placeholder="Search payments..."
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Dropdown menu={exportMenu} trigger={["click"]}>
            <Button>
              <FiDownload /> Export <FiChevronDown />
            </Button>
          </Dropdown>
          <Button type="primary" icon={<FiPlus />} onClick={handleCreate}>
            Add Payment
          </Button>
        </div>
      </div>

      <Card className="payment-content">
        <PaymentsList
          deal={deal}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </Card>

      <CreatePayment
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        dealId={deal?.deal?.id}
      />

      <EditPayment
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedPayment(null);
        }}
        initialValues={selectedPayment}
        dealId={deal?.deal?.id}
      />
    </div>
  );
};

export default DealPayments;
