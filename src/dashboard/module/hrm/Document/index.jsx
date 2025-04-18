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
  Space,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiDownload,
  FiHome,
} from "react-icons/fi";
import "./document.scss";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CreateDocument from "./CreateDocument";
import DocumentList from "./DocumentList";
import { Link } from "react-router-dom";
import { useDeleteDocumentMutation } from "./services/documentApi";

const { Title, Text } = Typography;

const Document = () => {
  const [documents, setDocuments] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const searchInputRef = useRef(null);
  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    handleSearch(searchText);
  }, [documents, searchText]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockData = [
        {
          id: 1,
          name: "Employee Handbook",
          role: "Employee",
          description: "Employee Handbook",
          created_by: "Admin",
          status: "active",
        },
      ];
      setDocuments(mockData);
    } catch (error) {
      message.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    let result = [...documents];
    if (value) {
      result = result.filter((document) => {
        const categoryMatch = document.category
          ?.toLowerCase()
          .includes(value.toLowerCase());
        const titleMatch = document.documentItems?.some((item) =>
          item.title?.toLowerCase().includes(value.toLowerCase())
        );
        return categoryMatch || titleMatch;
      });
    }
    setFilteredDocuments(result);
  };

  const handleAddDocument = () => {
    setSelectedDocument(null);
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const handleEditDocument = (document) => {
    setSelectedDocument(document);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleDeleteConfirm = (document) => {
    setSelectedDocument(document);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteDocument = async () => {
    try {
      await deleteDocument(selectedDocument.id).unwrap();
      message.success("Document deleted successfully");
      setIsDeleteModalVisible(false);
      setSelectedDocument(null);
    } catch (error) {
      message.error(error.data?.message || "Failed to delete document");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      if (isEditing) {
        // TODO: Implement update API call
        const updatedDocuments = documents.map((d) =>
          d.id === selectedDocument.id ? { ...d, ...formData } : d
        );
        setDocuments(updatedDocuments);
        message.success("Document updated successfully");
      } else {
        // TODO: Implement create API call
        const newDocument = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString(),
          created_by: "Admin",
          status: "active",
        };
        setDocuments([...documents, newDocument]);
        message.success("Document created successfully");
      }
      setIsFormVisible(false);
    } catch (error) {
      message.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      // Format data for export
      const formattedData = documents.map(doc => ({
        'Name': doc.name || '-',
        'Role': doc.role || '-',
        'Description': doc.description || '-',
        'Created By': doc.created_by || '-',
        'Created Date': doc.created_at ? moment(doc.created_at).format('DD-MM-YYYY') : '-',
        'Status': doc.status || '-'
      }));

      if (formattedData.length === 0) {
        message.warning('No data available to export');
        return;
      }

      const fileName = `documents_${moment().format('DD-MM-YYYY')}`;

      switch (type) {
        case 'csv':
          const csvContent = [
            Object.keys(formattedData[0]).join(','),
            ...formattedData.map(item => 
              Object.values(item)
                .map(value => `"${value?.toString().replace(/"/g, '""')}"`)
                .join(',')
            )
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `${fileName}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          message.success('Successfully exported as CSV');
          break;

        case 'excel':
          const ws = XLSX.utils.json_to_sheet(formattedData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Documents');
          XLSX.writeFile(wb, `${fileName}.xlsx`);
          message.success('Successfully exported as Excel');
          break;

        case 'pdf':
          const doc = new jsPDF('l', 'pt', 'a4');
          doc.autoTable({
            head: [Object.keys(formattedData[0])],
            body: formattedData.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { 
              fontSize: 8,
              cellPadding: 2
            },
            theme: 'grid'
          });
          doc.save(`${fileName}.pdf`);
          message.success('Successfully exported as PDF');
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/dashboard/hrm">HRM</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Documents</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Documents</Title>
          <Text type="secondary">Manage all documents in the organization</Text>
        </div>
        <div className="header-actions">
          <div className="search-input">
            <Input
              placeholder="Search by document name..."
              prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 360 }}
              allowClear
            />
          </div>
          <div className="action-buttons">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'excel',
                    label: 'Export as Excel',
                    icon: <FiDownload />,
                    onClick: () => handleExport('excel')
                  },
                  {
                    key: 'pdf',
                    label: 'Export as PDF',
                    icon: <FiDownload />,
                    onClick: () => handleExport('pdf')
                  },
                  {
                    key: 'csv',
                    label: 'Export as CSV',
                    icon: <FiDownload />,
                    onClick: () => handleExport('csv')
                  }
                ]
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button className="export-button" loading={loading}>
                <FiDownload /> Export <FiChevronDown />
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={handleAddDocument}
              className="add-button"
            >
              Add Document
            </Button>
          </div>
        </div>
      </div>

      <Card className="document-table-card">
        <DocumentList
          documents={documents}
          loading={loading}
          onEdit={handleEditDocument}
          onDelete={handleDeleteConfirm}
          searchText={searchText}
        />
      </Card>

      <CreateDocument
        open={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        onSubmit={handleFormSubmit}
        isEditing={isEditing}
        initialValues={selectedDocument}
        loading={loading}
      />

      <Modal
        title="Delete Document"
        open={isDeleteModalVisible}
        onOk={handleDeleteDocument}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{
          danger: true,
          loading: loading,
        }}
      >
        <p>Are you sure you want to delete this document?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default Document;
