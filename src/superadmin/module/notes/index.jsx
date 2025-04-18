import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  message,
  Input,
  Dropdown,
  Menu,
  Row,
  Col,
  Breadcrumb,
  Table,
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
import "./notes.scss";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CreateCompany from "./createNotes";
import CompanyCard from "./NotesCard";
import CompanyList from "./NotesList";
import {
  useGetAllNotesQuery,
  useDeleteNotesMutation,
} from "./services/NotesApi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../auth/services/authSlice";

const { Title, Text } = Typography;

const Notes = () => {
  const [deleteNotes, { isLoading: isDeleting }] = useDeleteNotesMutation();
  const user = useSelector(selectCurrentUser);

  const {
    data: notesData,
    isLoading: isLoadingNotes,
    refetch,
  } = useGetAllNotesQuery(user?.id || "");

  console.log("Notes Data:", notesData);

  const [companies, setCompanies] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef(null);
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    if (notesData) {
      const transformedData = notesData.map((note) => ({
        id: note.id,
        title: note.note_title || "N/A",
        type: note.notetype || "N/A",
        description: note.description || "N/A",
        employees: note.employees ? JSON.parse(note.employees).employee : "N/A",
        created_by: note.created_by || "N/A",
        created_at: note.createdAt || "-",
        client_id: note.client_id || "N/A",
      }));
      setCompanies(transformedData);
    }
  }, [notesData]);

  useEffect(() => {
    let result = [...companies];
    if (searchText) {
      result = result.filter(
        (company) =>
          (company.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
          (company.email?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
          (company.phone || '').includes(searchText) ||
          (company.firstName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
          (company.lastName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
          (company.city?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
          (company.state?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
          (company.gstIn?.toLowerCase() || '').includes(searchText.toLowerCase())
      );
    }
    setFilteredCompanies(result);
  }, [companies, searchText]);

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
  };

  const handleDelete = (record) => {
    setSelectedCompany(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteCompany = async () => {
    try {
      await deleteNotes(selectedCompany.id).unwrap();
      message.success("Notes deleted successfully");
      setIsDeleteModalVisible(false);
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Failed to delete notes");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (isEditing) {
        await updateCompany({
          id: selectedCompany.id,
          data: formData,
        }).unwrap();
        message.success("Company updated successfully");
      } else {
        await createCompany(formData).unwrap();
        message.success("Company created successfully");
      }
      setIsFormVisible(false);
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Operation failed");
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
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

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = companies.map((note) => ({
        "Note Title": note.title || 'N/A',
        "Note Type": note.type || 'N/A',
        "Description": note.description || 'N/A',
        "Employees": Array.isArray(note.employees) ? note.employees.join(', ') : note.employees || 'N/A',
        "Created Date": moment(note.created_at).format("DD-MM-YYYY") || 'N/A',
       
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "notes_export");
          break;
        case "excel":
          exportToExcel(data, "notes_export");
          break;
        case "pdf":
          exportToPDF(data, "notes_export");
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
    XLSX.utils.book_append_sheet(wb, ws, "Notes");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = (data, filename) => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map((item) => Object.values(item)),
      margin: { top: 20 },
      styles: { fontSize: 8 },
      theme: 'grid'
    });
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="company-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/superadmin">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Notes</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Notes</Title>
          <Text type="secondary">Manage all notes in the system</Text>
        </div>
        <Row justify="center" className="header-actions-wrapper">
          <Col xs={24} sm={24} md={20} lg={16} xl={14}>
            <div className="header-actions">
              <Input
                prefix={
                  <FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />
                }
                placeholder="Search notes..."
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                ref={searchInputRef}
                className="search-input"
              />
              <div className="action-buttons">
                <Dropdown overlay={exportMenu} trigger={["click"]}>
                  <Button className="export-button">
                    <FiDownload size={16} />
                    <span>Export</span>
                    <FiChevronDown size={14} />
                  </Button>
                </Dropdown>
                <Button
                  type="primary"
                  icon={<FiPlus size={16} />}
                  onClick={handleAddCompany}
                  className="add-button"
                >
                  Add Note
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Card className="company-table-card">
        {viewMode === "table" ? (
          <CompanyList
            companies={filteredCompanies}
            loading={isLoadingNotes || isDeleting}
            onEdit={handleEditCompany}
            onDelete={handleDelete}
            onView={handleViewCompany}
          />
        ) : (
          <Row gutter={[16, 16]} className="company-cards-grid">
            {filteredCompanies
              .slice((currentPage - 1) * 10, currentPage * 10)
              .map((company) => (
                <Col xs={24} sm={12} md={8} lg={6} key={company.id}>
                  <CompanyCard
                    company={company}
                    onEdit={handleEditCompany}
                    onDelete={handleDelete}
                    onView={handleViewCompany}
                  />
                </Col>
              ))}
            {filteredCompanies.length > 10 && (
              <Col
                span={24}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "16px",
                }}
              >
                <Table.Pagination
                  current={currentPage}
                  pageSize={10}
                  total={filteredCompanies.length}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  onChange={(page) => setCurrentPage(page)}
                />
              </Col>
            )}
          </Row>
        )}
      </Card>

      <CreateCompany
        open={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        onSubmit={handleFormSubmit}
        isEditing={isEditing}
        initialValues={selectedCompany}
        loading={isLoadingNotes || isDeleting}
      />

    
    </div>
  );
};

export default Notes;
