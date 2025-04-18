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
  FiFilter,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CompanyAccountList from "./CompanyAccountList";
import CreateCompanyAccount from "./CreateCompanyAccount";
import EditCompanyAccount from "./EditCompanyAccount";
import { useCreateCompanyAccountMutation, useDeleteCompanyAccountMutation, useGetCompanyAccountsQuery } from "./services/companyAccountApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import CompanyAccountDetails from "./CompanyAccountDetails";
import moment from "moment";

const { Title, Text } = Typography;

const CompanyAccount = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCompanyType, setSelectedCompanyType] = useState(null);
  const loggedInUser = useSelector(selectCurrentUser);
  const [deleteCompanyAccount] = useDeleteCompanyAccountMutation();
  const [createCompanyAccount] = useCreateCompanyAccountMutation();
  const { data: companyAccountsResponse = { data: [] }, isLoading:isCompanyAccountsLoading  } = useGetCompanyAccountsQuery();

  const companyTypes = [
    { key: 'all', label: 'All Types' },
    { key: 'private', label: 'Private Limited' },
    { key: 'public', label: 'Public Limited' },
    { key: 'partnership', label: 'Partnership' },
    { key: 'proprietorship', label: 'Proprietorship' }
  ];

  const handleCompanyTypeFilter = (type) => {
    setSelectedCompanyType(type);
    // You can implement the filtering logic here based on the selected type
  };

  const filterMenu = (
    <Menu>
      {companyTypes.map((type) => (
        <Menu.Item
          key={type.key}
          onClick={() => handleCompanyTypeFilter(type.key)}
          style={{
            backgroundColor: selectedCompanyType === type.key ? '#e6f7ff' : 'transparent'
          }}
        >
          {type.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleCreate = () => {
    setSelectedCompany(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedCompany(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    console.log("View company:", record);
  };

  const handleDelete = (id) => {
    console.log("Delete company:", id);
    Modal.confirm({
      title: 'Delete Company',
      content: 'Are you sure you want to delete this company?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: '20px',
      },
      onOk: async () => {
        try {
          await deleteCompanyAccount(id).unwrap();
          // message.success('Company deleted successfully');
        } catch (error) {
          message.error('Failed to delete company');
        }
      },
    });
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = companyAccountsResponse.data.map((company) => ({
        "Company Name": company.company_name,
        // "Account Owner": company.account_owner,
        "Phone": company.phone_number,
        // "Status": company.status,
        "Created Date": moment(company.created_at).format("YYYY-MM-DD")
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "companies_export");
          break;
        case "excel":
          exportToExcel(data, "companies_export");
          break;
        case "pdf":
          exportToPDF(data, "companies_export");
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
    XLSX.utils.book_append_sheet(wb, ws, "Companies");
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
          <Breadcrumb.Item>Company Accounts</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Company Accounts</Title>
          <Text type="secondary">Manage all company accounts in the organization</Text>
        </div>
        <div className="header-actions">
          <div className="search-filter-group" style={{ display: 'flex', gap: '8px' }}>
            <Input
              prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
              placeholder="Search companies..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              className="search-input"
              style={{ width: 350}}
            />
            <Dropdown 
              overlay={filterMenu} 
              trigger={['click']}
              placement="bottomRight"
            >
              {/* <Button
                icon={<FiFilter size={16} />}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: selectedCompanyType ? '#e6f7ff' : 'transparent'
                }}
              /> */}
            </Dropdown>
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
              Add Company
            </Button>
          </div>
        </div>
      </div>

      <Card className="main-card">
        <CompanyAccountList
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          searchText={searchText}
          loggedInUser={loggedInUser}
          companyAccountsResponse={companyAccountsResponse}
        
          isCompanyAccountsLoading={isCompanyAccountsLoading}
       />
      </Card>

      <CreateCompanyAccount
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
   
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
    
        isCompanyAccountsLoading={isCompanyAccountsLoading}
      />

      <EditCompanyAccount
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
          
          companyData={selectedCompany}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
     
        isCompanyAccountsLoading={isCompanyAccountsLoading}
      />
     
    </div>
  );
};

export default CompanyAccount;
