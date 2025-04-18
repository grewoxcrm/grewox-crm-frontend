import React, { useState } from 'react';
import {
    Card, Typography, Button, Input,
    Dropdown, Menu, Space, Breadcrumb, Modal, message
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiGrid, FiList, FiHome
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import './Deal.scss';
import CreateDeal from './CreateDeal';
import DealCard from './DealCard';
import DealList from './DealList';
import EditDeal from './EditDeal';
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useDeleteDealMutation, useGetDealsQuery } from './services/DealApi';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const { Title, Text } = Typography;

const Deal = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // Fetch pipelines and deal stages
    const { data: pipelines = [] } = useGetPipelinesQuery();
    const { data: dealStages = [] } = useGetLeadStagesQuery();
    const [deleteDeal, { isLoading: isDeleting }] = useDeleteDealMutation();
    const { data, isLoading, error } = useGetDealsQuery();

    // Filter deals based on search text
    const filteredDeals = React.useMemo(() => {
        if (!data) return [];
        if (!searchText) return data;

        const searchLower = searchText.toLowerCase();
        return data.filter(deal => 
            deal.dealTitle?.toLowerCase().includes(searchLower) ||
            deal.company_name?.toLowerCase().includes(searchLower)
        );
    }, [data, searchText]);

    const handleDealClick = (deal) => {
        navigate(`/dashboard/crm/deals/${deal.id}`);
    };


    const handleCreate = () => {
        setSelectedDeal(null);
        setIsModalOpen(true);
    };

    const handleEdit = (deal) => {
        setSelectedDeal(deal);
        setIsEditModalOpen(true);
    };

    const handleDelete = (deal) => {
        Modal.confirm({
            title: 'Delete Deal',
            content: 'Are you sure you want to delete this deal?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                deleteDeal(deal.id);
            },
        });
    };

    const handleView = (deal) => {
        setSelectedDeal(deal);
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = filteredDeals.map((deal) => ({
                "Deal Name": deal.dealTitle,
                "Company": deal.company_name,
                "Source": sourcesData?.data?.find(s => s.id === deal.source)?.name || deal.source,
                "Stage": dealStages?.find(s => s.id === deal.stage)?.stageName || deal.stage,
                "Value": `${currencies?.find(c => c.id === deal.currency)?.currencyIcon || ''} ${deal.value || 0}`,
                "Status": deal.is_won === true ? 'Won' : deal.is_won === false ? 'Lost' : 'Pending',
                "Created Date": moment(deal.createdAt).format("DD-MM-YYYY")
            }));

            switch (type) {
                case "csv":
                    exportToCSV(data, "deals_export");
                    break;
                case "excel":
                    exportToExcel(data, "deals_export");
                    break;
                case "pdf":
                    exportToPDF(data, "deals_export");
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
        XLSX.utils.book_append_sheet(wb, ws, "Deals");
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
                0: { cellWidth: 100 }, // Deal Name
                1: { cellWidth: 120 }, // Company
                2: { cellWidth: 80 },  // Source
                3: { cellWidth: 80 },  // Stage
                4: { cellWidth: 80 },  // Value
                5: { cellWidth: 60 },  // Status
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

    const exportMenu = {
        items: [
            {
                key: 'csv',
                label: 'Export as CSV',
                icon: <FiDownload />,
                onClick: () => handleExport('csv')
            },
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
            }
        ]
    };

    return (
        <div className="deal-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Deal</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-left">
                    <h2>Deals</h2>
                    <Text className="subtitle">Manage your deals</Text>
                </div>

                <div className="header-right">
                    <Input
                        prefix={<FiSearch style={{ color: '#9CA3AF' }} />}
                        placeholder="Search deals..."
                        className="search-input"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                    <div className="view-buttons">
                        <div className="view-toggle">
                            <Button
                                type={viewMode === 'table' ? 'primary' : 'default'}
                                icon={<FiList />}
                                onClick={() => setViewMode('table')}
                            />
                            <Button
                                type={viewMode === 'card' ? 'primary' : 'default'}
                                icon={<FiGrid />}
                                onClick={() => setViewMode('card')}
                            />
                        </div>
                    </div>
                    <Dropdown menu={exportMenu} trigger={['click']}>
                        <Button>
                            <FiDownload /> Export <FiChevronDown />
                        </Button>
                    </Dropdown>
                    <Button type="primary" icon={<FiPlus />} onClick={handleCreate}>
                        Add Deal
                    </Button>
                </div>
            </div>

            <Card className="deal-content">
                {viewMode === 'card' ? (
                    <DealCard
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        onDealClick={handleDealClick}
                        deals={filteredDeals}
                    />
                ) : (
                    <DealList
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        onDealClick={handleDealClick}
                        deals={filteredDeals}
                        searchText={searchText}
                    />
                )}
            </Card>

            <CreateDeal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                pipelines={pipelines}
                dealStages={dealStages}
      
            />

            <EditDeal
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedDeal(null);
                }}
                initialValues={selectedDeal}
                pipelines={pipelines}
                dealStages={dealStages}
            />

            {/* <CompanyDealList
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onDealClick={handleDealClick}
                deleteDeal={deleteDeal}
            /> */}
        </div>
    );
};

export default Deal;
