import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Dropdown,
  Menu,
  Breadcrumb,
  message,
  Row,
  Col,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
} from "react-icons/fi";
import { Link, useParams  } from "react-router-dom";
import InvoiceList from "./InvoiceList";
import CreateInvoice from "./CreateInvoice";
import EditInvoice from "./EditInvoice";
import "./invoices.scss";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import { useGetInvoicesQuery } from "../../../../sales/invoice/services/invoiceApi";
import moment from "moment";
import { useGetProductsQuery } from "../../../../sales/product&services/services/productApi";
import { selectCurrentUser } from "../../../../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

const Invoice = () => {
  const idd = useParams();

  const id = idd.dealId;

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { data: invoicesData, isLoading } = useGetInvoicesQuery();
  const invoices = (invoicesData?.data || []).filter(invoice => invoice.related_id === id);
  const loggedInUser = useSelector(selectCurrentUser);
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery(loggedInUser?.id);

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = invoices.map((invoice) => ({
        "Invoice Number": invoice.salesInvoiceNumber,
        "Issue Date": dayjs(invoice.issueDate).format("DD/MM/YYYY"),
        "Due Date": dayjs(invoice.dueDate).format("DD/MM/YYYY"),
        "Customer Name": invoice.customerName,
        "Total": invoice.total,
        "Amount": invoice.amount,
        "Status": invoice.payment_status,
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "invoices_export");
          break;
        case "excel":
          exportToExcel(data, "invoices_export");
          break;
        case "pdf":
          exportToPDF(data, "invoices_export");
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

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      // TODO: Implement API call to create invoice
      await fetch("/api/invoices", {
        method: "POST",
        body: formData,
      });
      message.success("Invoice created successfully");
      setCreateModalVisible(false);
      fetchInvoices();
    } catch (error) {
      console.error("Create Error:", error);
      message.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (formData) => {
    try {
      setLoading(true);
      // TODO: Implement API call to update invoice
      await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: "PUT",
        body: formData,
      });
      message.success("Invoice updated successfully");
      setEditModalVisible(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      console.error("Edit Error:", error);
      message.error("Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      // TODO: Implement API call to delete invoice
      await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });
      message.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (error) {
      console.error("Delete Error:", error);
      message.error("Failed to delete invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (invoice) => {
    // TODO: Implement view invoice functionality
    console.log("View invoice:", invoice);
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
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
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

  return (
    <div className="invoice-page">
      {/* <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Sales</Breadcrumb.Item>
          <Breadcrumb.Item>Invoices</Breadcrumb.Item>
        </Breadcrumb>
      </div> */}

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Invoices</Title>
          <Text type="secondary">Manage all invoices in the organization</Text>
        </div>
        <div className="header-actions">
          <div className="search-filter-group">
            <Input
              prefix={<FiSearch />}
              placeholder="Search invoices..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="action-buttons">
            <Dropdown menu={exportMenu} trigger={["click"]}>
              <Button className="export-button">
                <FiDownload />
                <span>Export</span>
                <FiChevronDown />
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={() => setCreateModalVisible(true)}
              className="add-button"
            >
              Create Invoice
            </Button>
          </div>
        </div>
      </div>

      <Card className="invoice-table-card">
        <InvoiceList
          loading={loading}
          invoices={invoices}
          searchText={searchText}
          dealId={id}
          onEdit={(invoice) => {
            setSelectedInvoice(invoice);
            setEditModalVisible(true);
          }}
          onDelete={handleDelete}
          onView={handleView}
        />
      </Card>

      <CreateInvoice
        open={createModalVisible}
        onSubmit={handleCreate}
        dealId={id}
        productsData={productsData}
        productsLoading={productsLoading}
        setCreateModalVisible={setCreateModalVisible}
        onCancel={() => setCreateModalVisible(false)}
      />

      <EditInvoice
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handleEdit}
        productsData={productsData}
        productsLoading={productsLoading}
        initialValues={selectedInvoice}
      />
    </div>
  );
};

export default Invoice;
