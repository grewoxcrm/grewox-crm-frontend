import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  Input,
  Dropdown,
  Menu,
  Space,
  Breadcrumb,
  Tooltip,
  Row,
  Col,
  Select,
  message,
  Form,
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
import "./Lead.scss";
import CreateLead from "./CreateLead";
import LeadCard from "./LeadCard";
import LeadList from "./LeadList";
import { Link, useNavigate, useLocation } from "react-router-dom";
import EditLead from "./EditLead";
import { useGetLeadsQuery } from "./services/LeadApi";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useGetAllCountriesQuery, useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
import { useGetCategoriesQuery, useGetSourcesQuery, useGetStatusesQuery } from "../crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

const Lead = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchText, setSearchText] = useState("");
  const loggedInUser = useSelector(selectCurrentUser);
  const { data: leads, isLoading } = useGetLeadsQuery();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: currencies = [] } = useGetAllCurrenciesQuery();
  const { data: countries = [] } = useGetAllCountriesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
  const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
  const { data: stagesData } = useGetLeadStagesQuery();
  const [initialFormData, setInitialFormData] = useState(null);

  // Handle automatic form opening
  useEffect(() => {
    if (location.state?.openCreateForm) {
      // Only set the inquiry_id from the submission
      const formData = {
        inquiry_id: location.state.formSubmissionId
      };

      // Get the first available status if not provided
      if (statusesData?.data?.length > 0) {
        formData.status = statusesData.data[0].id;
      }

      // Get the first available currency if not provided
      if (currencies?.length > 0) {
        formData.currency = currencies[0].id;
      }

      setInitialFormData(formData);
      setIsModalOpen(true);

      // Clear the state
      navigate(location.pathname, {
        replace: true,
        state: {}
      });
    }
  }, [location.state, navigate, statusesData, currencies]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredLeads = React.useMemo(() => {
    if (!leads?.data) return [];

    return leads.data.filter(lead => {
      const searchLower = searchText.toLowerCase();
      return (
        lead.leadTitle?.toLowerCase().includes(searchLower) ||
        lead.company_name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.toLowerCase().includes(searchLower)
      );
    });
  }, [leads?.data, searchText]);

  const handleLeadClick = (lead) => {
    navigate(`/dashboard/crm/lead/${lead.id}`);
  };

  const handleCreate = () => {
    setSelectedLead(null);
    setInitialFormData(null); // Reset form data
    setIsModalOpen(true);
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setSelectedLead(null);
  };

  const handleDelete = (lead) => {
    Modal.confirm({
      title: "Delete Lead",
      content: "Are you sure you want to delete this lead?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        // Handle delete action
      },
    });
  };

  const handleView = (lead) => {
    setSelectedLead(lead);
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = leads.data.map((lead) => ({
        "Lead Title": lead.leadTitle,
        "Company": lead.company_name,
        "Source": sourcesData?.data?.find(s => s.id === lead.source)?.name || lead.source,
        "Status": statusesData?.data?.find(s => s.id === lead.status)?.name || lead.status,
        "Interest Level": lead.interest_level,
        "Lead Value": `${currencies?.find(c => c.id === lead.currency)?.currencyIcon || ''} ${lead.leadValue || 0}`,
        "Created Date": moment(lead.createdAt).format("DD-MM-YYYY")
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "leads_export");
          break;
        case "excel":
          exportToExcel(data, "leads_export");
          break;
        case "pdf":
          exportToPDF(data, "leads_export");
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
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = (data, filename) => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map((item) => Object.values(item)),
      margin: { top: 20 },
      styles: { 
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 100 }, // Lead Title
        1: { cellWidth: 120 }, // Company
        2: { cellWidth: 80 },  // Source
        3: { cellWidth: 80 },  // Status
        4: { cellWidth: 100 }, // Interest Level
        5: { cellWidth: 80 },  // Lead Value
        6: { cellWidth: 80 }   // Created Date
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      }
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

  // Add debug log for initialFormData changes
  useEffect(() => {
    console.log('Initial form data updated:', initialFormData);
  }, [initialFormData]);

  return (
    <div className="lead-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Lead</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="header-left">
          <Title level={2}>Leads</Title>
          <p className="subtitle">Manage all leads in the system</p>
        </div>
        <Row justify="center" className="header-actions-wrapper">
          <Col xs={24} sm={24} md={20} lg={16} xl={14}>
            <div className="header-actions">
              <Input
                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                placeholder="Search leads"
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                className="search-input"
              />
              <div className="action-buttons">
                <Button.Group className="view-toggle">
                  <Button
                    type={viewMode === 'table' ? 'primary' : 'default'}
                    icon={<FiList size={16} />}
                    onClick={() => setViewMode('table')}
                  />
                  <Button
                    type={viewMode === 'card' ? 'primary' : 'default'}
                    icon={<FiGrid size={16} />}
                    onClick={() => setViewMode('card')}
                  />
                </Button.Group>
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
                  onClick={handleCreate}
                  className="add-button"
                >
                  Add Lead
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Card className="lead-content">
        {viewMode === "table" ? (
          <LeadList
            leads={{ data: filteredLeads }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onLeadClick={handleLeadClick}
          />
        ) : (
          <LeadCard
            leads={{ data: filteredLeads }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            categoriesData={categoriesData}
            sourcesData={sourcesData}
            statusesData={statusesData}
            currencies={currencies}
            countries={countries}
            pipelines={pipelines}
            onView={handleView}
            onLeadClick={handleLeadClick}
          />
        )}
      </Card>

      <CreateLead
        open={isModalOpen}
        pipelines={pipelines}
        currencies={currencies}
        countries={countries}
        sourcesData={sourcesData}
        statusesData={statusesData}
        categoriesData={categoriesData}
        onCancel={() => {
          setIsModalOpen(false);
          setInitialFormData(null);
        }}
        initialValues={initialFormData}
      />
      <EditLead
        open={isEditModalOpen}
        pipelines={pipelines}
        currencies={currencies}
        countries={countries}
        sourcesData={sourcesData}
        statusesData={statusesData}
        categoriesData={categoriesData}
        onCancel={handleEditCancel}
        initialValues={selectedLead}
        key={selectedLead?.id}
      />
    </div>
  );
};

export default Lead;
