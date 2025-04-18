import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  message,
  Input,
  Dropdown,
  Menu,
  Breadcrumb,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import CustomerList from "./CustomerList";
import CreateCustomer from "./CreateCustomer";
import EditCustomer from "./EditCustomer";
import "./customer.scss";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetCustomersQuery,
} from "./services/custApi";

const { Title, Text } = Typography;

const Customer = () => {

  const { data: custdata, isLoading, error } = useGetCustomersQuery();
  const customersData = custdata?.data;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [createCustomer] = useCreateCustomerMutation();
  const navigate = useNavigate();

  const [updateCustomer] = useUpdateCustomerMutation();

  // Dummy data for demonstration
 

  const handleCreate = () => {
    setSelectedCustomer(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (formData) => {
    try {
      setLoading(true);
      await createCustomer(formData).unwrap();
      message.success("Customer created successfully");
      setIsCreateModalOpen(false);
    } catch (error) {
      message.error(error?.data?.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setSelectedCustomer(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    console.log("View customer:", record);
  };

  const handleCustomerClick = (customer) => {
    navigate(`/dashboard/crm/customers/${customer.id}`);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#faad14", fontSize: "22px" }}>⚠</span>
          Delete Customer
        </div>
      ),
      content: "Are you sure you want to delete this customer?",
      okText: "Yes",
      cancelText: "No",
      centered: true,
      className: "custom-delete-modal",
      icon: null,
      maskClosable: true,
      okButtonProps: {
        danger: true,
        size: "middle",
      },
      cancelButtonProps: {
        size: "middle",
      },
      onOk: () => {
        message.success("Customer deleted successfully");
      },
    });
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = customersData.map((customer) => ({
        Name: customer.name,
        Email: customer.email,
        Phone: customer.contact,
        // Company: customer.company,
        // Address: customer.address,
        // Status: customer.status,
        "Created Date": moment(customer.created_at).format("YYYY-MM-DD"),
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "customers_export");
          break;
        case "excel":
          exportToExcel(data, "customers_export");
          break;
        case "pdf":
          exportToPDF(data, "customers_export");
          break;
        default:
          break;
      }
      message.success(`Successfully exported as ${type.toUpperCase()}`);
    } catch (error) {
      message.error(`Failed to export: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map((item) =>
        Object.values(item)
          .map((value) => `"${value?.toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = (data, filename) => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map((item) => Object.values(item)),
      margin: { top: 20 },
      styles: { fontSize: 8 },
    });
    doc.save(`${filename}.pdf`);
  };

  const exportMenu = (
    <Menu>
      <Menu.Item
        key="csv"
        icon={<FiDownload />}
        onClick={() => handleExport("csv")}
      >
        Export as CSV
      </Menu.Item>
      <Menu.Item
        key="excel"
        icon={<FiDownload />}
        onClick={() => handleExport("excel")}
      >
        Export as Excel
      </Menu.Item>
      <Menu.Item
        key="pdf"
        icon={<FiDownload />}
        onClick={() => handleExport("pdf")}
      >
        Export as PDF
      </Menu.Item>
    </Menu>
  );

  const handleEditSubmit = async (formData) => {
    try {
      setLoading(true);
      await updateCustomer({
        id: selectedCustomer.id,
        data: formData,
      }).unwrap();
      message.success("Customer updated successfully");
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      message.error(error?.data?.message || "Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-page">
      <div className="page-breadcrumb">
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
          <Breadcrumb.Item>Customers</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Customers</Title>
          <Text type="secondary">Manage all customers in the organization</Text>
        </div>
        <div className="header-actions">
          <div className="search-filter-group">
            <Input
              prefix={
                <FiSearch style={{ color: "#8c8c8c" }} />
              }
              placeholder="Search customers..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              className="search-input"
              style={{ 
                width: '300px', 
                borderRadius: '20px',
                height: '38px'
              }}
            />
          </div>
          <div className="action-buttons">
            <Dropdown overlay={exportMenu} trigger={["click"]}>
              <Button
                className="export-button"
                icon={<FiDownload size={16} />}
                loading={loading}
              >
                Export
                <FiChevronDown size={16} />
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<FiPlus size={16} />}
              onClick={handleCreate}
              className="add-button"
            >
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      <Card className="customer-table-card">
        <CustomerList
          loading={isLoading}
          custdata={custdata}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onCustomerClick={handleCustomerClick}
          searchText={searchText}
        />
      </Card>

      <CreateCustomer
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={loading}
      />

      <EditCustomer
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleEditSubmit}
        initialValues={selectedCustomer}
        loading={loading}
      />
    </div>
  );
};

export default Customer;
