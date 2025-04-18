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
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ContactList from "./ContactList";
import CreateContact from "./CreateContact";
import EditContact from "./EditContact";
import { useGetContactsQuery, useDeleteContactMutation } from "./services/contactApi";
import { useGetCompanyAccountsQuery } from "../companyacoount/services/companyAccountApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import moment from "moment";


const { Title, Text } = Typography;

const Contact = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteContact, { isLoading: isDeleteLoading }] = useDeleteContactMutation();

  const { data: contactsResponse, isLoading, error } = useGetContactsQuery();
  const { data: companyAccountsResponse = { data: [] }, isLoading: isCompanyAccountsLoading } = useGetCompanyAccountsQuery();
  const loggedInUser = useSelector(selectCurrentUser);

  const handleCreate = () => {
    setSelectedContact(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedContact(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    console.log("View contact:", record);
  };

  // const handleDelete = (id) => {
  //   Modal.confirm({
  //     title: 'Delete Contact',
  //     content: 'Are you sure you want to delete this contact?',
  //     okText: 'Yes',
  //     okType: 'danger',
  //     cancelText: 'No',
  //     bodyStyle: {
  //       padding: '20px',
  //     },
  //     onOk: async () => {
  //       try {
  //         await deleteContact(id).unwrap();
  //         message.success('Contact deleted successfully');
  //       } catch (error) {
  //         console.error("Delete Error:", error);
  //         message.error(error?.data?.message || 'Failed to delete contact');
  //       }
  //     },
  //   });
  // };

  const handleCreateSubmit = async (values) => {
    try {
      setLoading(true);
      message.success('Contact created successfully');
      setIsCreateModalOpen(false);
    } catch (error) {
      message.error('Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      setLoading(true);
      message.success('Contact updated successfully');
      setIsEditModalOpen(false);
      setSelectedContact(null);
    } catch (error) {
      message.error('Failed to update contact');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = contactsResponse.data.map((contact) => ({
        "Name": `${contact.first_name} ${contact.last_name}`,
        "Email": contact.email,
        "Phone": contact.phone,
        "Company": contact.company_display_name || contact.company_name,
        "Contact Owner": contact.contact_owner === loggedInUser?.id ? loggedInUser?.username : contact.contact_owner,
        "Created Date": moment(contact.createdAt).format("DD-MM-YYYY")
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "contacts_export");
          break;
        case "excel":
          exportToExcel(data, "contacts_export");
          break;
        case "pdf":
          exportToPDF(data, "contacts_export");
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
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");
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
    <div className="contact-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Contacts</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Contacts</Title>
          <Text type="secondary">Manage all contacts in the organization</Text>
        </div>
        <div className="header-actions">
          <div className="search-filter-group">
            <Input
              prefix={<FiSearch style={{ color: "#8c8c8c"  }} />}
              placeholder="Search contacts..."
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
              icon={<FiPlus />}
              onClick={handleCreate}
              className="add-button"
            >
              Add Contact
            </Button>
          </div>
        </div>
      </div>

      <Card className="content-card">
        <ContactList
          onEdit={handleEdit}
          onView={handleView}
          // onDelete={handleDelete}
          searchText={searchText}
          isLoading={isLoading}
          loggedInUser={loggedInUser}
          contactsResponse={contactsResponse}
          companyAccountsResponse={companyAccountsResponse}
          isCompanyAccountsLoading={isCompanyAccountsLoading}
        />
      </Card>

      <CreateContact
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isLoading}
        loggedInUser={loggedInUser}
        contactsResponse={contactsResponse}
        companyAccountsResponse={companyAccountsResponse}
        isCompanyAccountsLoading={isCompanyAccountsLoading}
      />

      <EditContact
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        contactData={selectedContact}
        isLoading={isLoading}
        loggedInUser={loggedInUser}

        contactsResponse={contactsResponse}
        companyAccountsResponse={companyAccountsResponse}
        isCompanyAccountsLoading={isCompanyAccountsLoading}
      />
    </div>
  );
};

export default Contact;
