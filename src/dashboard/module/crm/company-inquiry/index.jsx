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
import CreateCompanyInquiry from "./CreateCompanyInquiry";
import CompanyInquiryList from "./CompanyInquiryList";
import EditCompanyInquiry from "./EditCompanyInquiry";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import "./CompanyInquiry.scss";
import {
    useGetCompanyInquiriesQuery,
    useCreateCompanyInquiryMutation,
    useUpdateCompanyInquiryMutation,
    useDeleteCompanyInquiryMutation,
} from "./services/companyInquiryApi";

const { Title, Text } = Typography;

const CompanyInquiry = () => {
    const [searchText, setSearchText] = useState("");
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [loading, setLoading] = useState(false);

    const {
        data: inquiriesData,
        isLoading,
        error,
        refetch
    } = useGetCompanyInquiriesQuery();

    const [createInquiry] = useCreateCompanyInquiryMutation();
    const [updateInquiry] = useUpdateCompanyInquiryMutation();
    const [deleteInquiry] = useDeleteCompanyInquiryMutation();

    // Ensure we have an array of inquiries
    const inquiries = Array.isArray(inquiriesData?.data) ? inquiriesData.data : [];

    // Show error message if API call fails
    React.useEffect(() => {
        if (error) {
            message.error(error?.data?.message || "Failed to fetch company inquiries");
        }
    }, [error]);

    const handleCreate = async (values) => {
        try {
            await createInquiry(values).unwrap();
            message.success("Company inquiry created successfully");
            setCreateModalVisible(false);
            refetch(); // Refresh the list after creating
        } catch (error) {
            message.error(error?.data?.message || "Failed to create company inquiry");
        }
    };

    const handleEdit = (record) => {
        setSelectedInquiry(record);
        setEditModalVisible(true);
    };

    const handleUpdate = async (values) => {
        try {
            await updateInquiry({
                id: values._id,
                data: {
                    fullname: values.fullname,
                    phone: values.phone,
                    business_category: values.business_category,
                    description: values.description,
                }
            }).unwrap();
            message.success("Company inquiry updated successfully");
            setEditModalVisible(false);
            setSelectedInquiry(null);
            refetch(); // Refresh the list after updating
        } catch (error) {
            message.error(error?.data?.message || "Failed to update company inquiry");
        }
    };

    const handleDelete = (record) => {
        console.log('Delete handler received record:', record); // Debug log

        // Check the complete record structure
        if (!record) {
            message.error("No record provided");
            return;
        }

        // Get the ID from either _id or id field
        const recordId = record._id || record.id;
        console.log('Record ID:', recordId); // Debug log

        if (!recordId) {
            message.error("No ID found in record");
            return;
        }

        Modal.confirm({
            title: "Delete Company Inquiry",
            content: "Are you sure you want to delete this inquiry?",
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                try {
                    await deleteInquiry(recordId).unwrap();
                    message.success("Company inquiry deleted successfully");
                    refetch();
                } catch (error) {
                    console.error('Delete error:', error); // Debug log
                    message.error(error?.data?.message || "Failed to delete company inquiry");
                }
            },
        });
    };

    const handleView = (record) => {
        console.log("View record:", record);
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = inquiries;

            if (data.length === 0) {
                message.warning("No data available to export");
                return;
            }

            switch (type) {
                case "csv":
                    exportToCSV(data, "company_inquiries_export");
                    break;
                case "excel":
                    exportToExcel(data, "company_inquiries_export");
                    break;
                case "pdf":
                    exportToPDF(data, "company_inquiries_export");
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
        if (data.length === 0) return;

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
        if (data.length === 0) return;

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Company Inquiries");
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        if (data.length === 0) return;

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
                        <Link to="/dashboard/crm">CRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Company Inquiries</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Company Inquiries</Title>
                    <Text type="secondary">Manage all company inquiries in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="search-filter-group">
                        <Input
                            prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
                            placeholder="Search inquiries..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                            className="search-input"
                            style={{ width: 350 }}
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
                            onClick={() => setCreateModalVisible(true)}
                            className="add-button"
                        >
                            New Inquiry
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="content-card">
                <CompanyInquiryList
                    data={inquiries}
                    loading={isLoading}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                    searchText={searchText}
                />
            </Card>

            <CreateCompanyInquiry
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                onSubmit={handleCreate}
            />

            <EditCompanyInquiry
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setSelectedInquiry(null);
                }}
                onSubmit={handleUpdate}
                initialValues={selectedInquiry}
            />
        </div>
    );
};

export default CompanyInquiry;
