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
  Spin,
  Empty,
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
import "./Policy.scss";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Link } from "react-router-dom";
import PolicyList from "./PolicyList";
import PolicyCard from "./PolicyCard";
import CreatePolicy from "./createPolicy";
import EditPolicy from "./EditPolicy";
import {
  useGetAllPoliciesQuery,
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
  useDeletePolicyMutation,
} from "./service/policyApi";

const { Title, Text } = Typography;

const Policy = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const searchInputRef = useRef(null);
  const [viewMode, setViewMode] = useState("table");

  // API hooks
  const {
    data: policiesData,
    isLoading: isPoliciesLoading,
    error: policiesError,
  } = useGetAllPoliciesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [createPolicy] = useCreatePolicyMutation();
  const [updatePolicy] = useUpdatePolicyMutation();
  const [deletePolicy] = useDeletePolicyMutation();

  console.log("Policies Response:", policiesData); // Debug log

  // Extract data from the API response
  const policies = policiesData?.data || [];
  const total = policiesData?.total || 0;

  const handleAddPolicy = () => {
    setSelectedPolicy(null);
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy);
  };

  const handleDeleteConfirm = (policy) => {
    setSelectedPolicy(policy);
    setIsDeleteModalVisible(true);
  };

  // const handleDeletePolicy = async () => {
  //   try {
  //     setLoading(true);
  //     await deletePolicy(selectedPolicy.id).unwrap();
  //     message.success("Policy deleted successfully");
  //     setIsDeleteModalVisible(false);
  //     setSelectedPolicy(null);
  //   } catch (error) {
  //     console.error("Delete Policy Error:", error);

  //     // Handle specific error cases
  //     if (
  //       error?.data?.message?.includes("AccessDenied") ||
  //       error?.data?.message?.includes("s3:DeleteObject")
  //     ) {
  //       // Show warning instead of error for S3 permission issues
  //       message.warning(
  //         "Policy was deleted but the associated file could not be removed due to permissions. System administrators have been notified.",
  //         6
  //       );
  //       // Close the modal as the policy was still deleted
  //       setIsDeleteModalVisible(false);
  //       setSelectedPolicy(null);
  //     } else {
  //       // Show regular error message for other cases
  //       message.error(
  //         error?.data?.message || "Failed to delete policy. Please try again.",
          
  //       );
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleDelete = (record) => {
    Modal.confirm({
        title: 'Delete Policy',
        content: 'Are you sure you want to delete this policy?',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        bodyStyle: {
            padding: '20px',
        },
        onOk: async () => {
            try {
                await deletePolicy(record.id).unwrap();
                message.success('Policy deleted successfully');
            } catch (error) {
                message.error(error?.data?.message || 'Failed to delete policy');
            }
        },
    });
};


  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      if (isEditing) {
        await updatePolicy({
          id: selectedPolicy.id,
          data: formData,
        }).unwrap();
        message.success("Policy updated successfully");
      } else {
        await createPolicy(formData).unwrap();
        message.success("Policy created successfully");
      }
      setIsFormVisible(false);
    } catch (error) {
      message.error(error?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Define menu items outside of render cycle
  const exportMenuItems = [
    {
      key: "csv",
      icon: <FiDownload />,
      label: "Export as CSV",
      onClick: () => handleExport("csv"),
    },
    {
      key: "excel",
      icon: <FiDownload />,
      label: "Export as Excel",
      onClick: () => handleExport("excel"),
    },
    {
      key: "pdf",
      icon: <FiDownload />,
      label: "Export as PDF",
      onClick: () => handleExport("pdf"),
    },
  ];

  // Initialize filtered policies
  useEffect(() => {
    if (!policies) return;

    const filterPolicies = () => {
      if (!searchText.trim()) {
        return [...policies];
      }

      const searchLower = searchText.toLowerCase().trim();
      return policies.filter(
        (policy) =>
          (policy?.branch?.toLowerCase() || "").includes(searchLower) ||
          (policy?.title?.toLowerCase() || "").includes(searchLower) ||
          (policy?.description?.toLowerCase() || "").includes(searchLower)
      );
    };

    setFilteredPolicies(filterPolicies());
  }, [policies, searchText]);

  // Show error message if API call fails
  useEffect(() => {
    if (policiesError) {
      message.error(policiesError?.data?.message || "Failed to fetch policies");
      console.error("Policies Error:", policiesError);
    }
  }, [policiesError]);

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = policies.map((policy) => ({
      
        Title: policy.title,
        Description: policy.description,
        "Created Date": moment(policy.createdAt).format("DD-MM-YYYY"),
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "policies_export");
          break;
        case "excel":
          exportToExcel(data, "policies_export");
          break;
        case "pdf":
          exportToPDF(data, "policies_export");
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
    XLSX.utils.book_append_sheet(wb, ws, "Policies");
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

  return (
    <div className="policy-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/superadmin">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Policy</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Policies</Title>
          <Text type="secondary">Manage all policies in the system</Text>
        </div>
        <Row justify="center" className="header-actions-wrapper">
          <Col xs={24} sm={24} md={20} lg={16} xl={14}>
            <div className="header-actions">
              <Input
                prefix={
                  <FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />
                }
                placeholder="Search policies..."
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                ref={searchInputRef}
                className="search-input"
              />
              <div className="action-buttons">
                <Button.Group className="view-toggle">
                  <Button
                    type={viewMode === "table" ? "primary" : "default"}
                    icon={<FiList size={16} />}
                    onClick={() => setViewMode("table")}
                  />
                  <Button
                    type={viewMode === "card" ? "primary" : "default"}
                    icon={<FiGrid size={16} />}
                    onClick={() => setViewMode("card")}
                  />
                </Button.Group>
                <Dropdown
                  menu={{ items: exportMenuItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button className="export-button">
                    <FiDownload size={16} />
                    <span>Export</span>
                    <FiChevronDown size={14} />
                  </Button>
                </Dropdown>
                <Button
                  type="primary"
                  icon={<FiPlus size={16} />}
                  onClick={handleAddPolicy}
                  className="add-button"
                >
                  Add Policy
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Card className="policy-table-card">
        {viewMode === "table" ? (
          <PolicyList
            policies={filteredPolicies}
            loading={isPoliciesLoading}
            onEditPolicy={handleEditPolicy}
            onDelete={handleDelete}
            onView={handleViewPolicy}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              showSizeChanger: false,
              showQuickJumper: false,
            }}
          />
        ) : (
          <Row gutter={[16, 16]} className="policy-cards-grid">
            {!isPoliciesLoading &&
              filteredPolicies.map((policy) => (
                <Col xs={24} sm={12} md={8} lg={6} key={policy.id}>
                  <PolicyCard
                    policy={policy}
                    onEdit={handleEditPolicy}
                    onDelete={handleDelete}
                    onView={handleViewPolicy}
                  />
                </Col>
              ))}
            {isPoliciesLoading && (
              <Col span={24} style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="large" />
              </Col>
            )}
            {!isPoliciesLoading && filteredPolicies.length === 0 && (
              <Col span={24} style={{ textAlign: "center", padding: "20px" }}>
                <Empty description="No policies found" />
              </Col>
            )}
            {total > pageSize && (
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
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper={false}
                />
              </Col>
            )}
          </Row>
        )}
      </Card>

      <CreatePolicy
        open={isFormVisible && !isEditing}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleFormSubmit}
      />

      <EditPolicy
        visible={isFormVisible && isEditing}
        policy={selectedPolicy}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleFormSubmit}
      />

     
    </div>
  );
};

export default Policy;
