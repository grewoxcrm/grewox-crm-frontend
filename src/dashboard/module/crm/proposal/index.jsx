import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome, FiMoreVertical, FiEdit2, FiTrash2, FiEye
} from 'react-icons/fi';
import './proposal.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Link } from 'react-router-dom';
import CreateProposal from './CreateProposal';
import ProposalList from './ProposalList';
import { useGetAllProposalsQuery, useDeleteProposalMutation } from './services/proposalApi';
import { useSelector, useDispatch } from 'react-redux';

const { Title, Text } = Typography;

const Proposal = () => {
    const dispatch = useDispatch();
    // Assuming you have a similar filter state setup as in tickets
    const filterState = useSelector(state => state.proposal) || {};
    
    // Add default values for all potentially undefined properties
    const { 
        filters = {}, 
        pagination = { 
            current: 1, 
            pageSize: 10,
            total: 0 
        }, 
        sorting = { 
            field: undefined, 
            order: undefined 
        } 
    } = filterState;
    
    // Use API query hook - if you don't have this setup yet, you'll need to implement it
    const { data: proposalsData, isLoading } = useGetAllProposalsQuery({
        ...filters,
        page: pagination?.current || 1,
        limit: pagination?.pageSize || 10,
        sortField: sorting?.field,
        sortOrder: sorting?.order,
    });

    const [deleteProposal] = useDeleteProposalMutation();

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const searchInputRef = useRef(null);

    // Handle proposals data and filtering
    const proposals = proposalsData?.data || [];

    const filteredProposals = React.useMemo(() => {
        if (!proposals.length) return [];
        
        return proposals.filter(proposal => {
            if (!searchText) return true;
            
            const searchTerm = searchText.toLowerCase();
            return (
                proposal.lead_title?.toLowerCase().includes(searchTerm) ||
                proposal.proposal_number?.toLowerCase().includes(searchTerm) ||
                proposal.status?.toLowerCase().includes(searchTerm) ||
                proposal.client_name?.toLowerCase().includes(searchTerm) ||
                proposal.total?.toString().includes(searchTerm)
            );
        });
    }, [proposals, searchText]);

    const handleCreateSuccess = (response) => {
        message.success('Proposal created successfully');
        setIsCreateModalVisible(false);
    };

    const handleEdit = (proposal) => {
        setSelectedProposal(proposal);
        setIsEditing(true);
        setIsCreateModalVisible(true);
    };

    const handleView = (proposal) => {
        // Handle view proposal details
        console.log('View proposal:', proposal);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Confirmation',
            content: 'Are you sure you want to delete this proposal?',
            okType: 'danger',
            bodyStyle: { padding: '20px' },
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteProposal(record.id).unwrap();
                    message.success('Proposal deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete proposal');
                }
            },
        });
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const exportMenu = (
        <Menu>
            <Menu.Item
                key="csv"
                icon={<FiDownload />}
                onClick={() => handleExport('csv')}
            >
                Export as CSV
            </Menu.Item>
            <Menu.Item
                key="excel"
                icon={<FiDownload />}
                onClick={() => handleExport('excel')}
            >
                Export as Excel
            </Menu.Item>
            <Menu.Item
                key="pdf"
                icon={<FiDownload />}
                onClick={() => handleExport('pdf')}
            >
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = filteredProposals.map(proposal => ({
                'Proposal Number': proposal.proposal_number,
                'Lead': proposal.lead_title,
                'Date': moment(proposal.date).format('YYYY-MM-DD'),
                'Expiry Date': moment(proposal.expiry_date).format('YYYY-MM-DD'),
                'Status': proposal.status,
                'Total': proposal.total,
                'Created Date': moment(proposal.created_at).format('YYYY-MM-DD'),
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'proposals_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'proposals_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'proposals_export');
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
            Object.keys(data[0]).join(','),
            ...data.map(item => Object.values(item).map(value =>
                `"${value?.toString().replace(/"/g, '""')}"`
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const exportToExcel = (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Proposals');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 }
        });
        doc.save(`${filename}.pdf`);
    };

    return (
        <div className="proposals-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/crm">CRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Proposals</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Proposals</Title>
                    <Text type="secondary">Manage all proposals for your leads</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search proposals..."
                        allowClear
                        onChange={(e) => handleSearch(e.target.value)}
                        value={searchText}
                        ref={searchInputRef}
                        className="search-input"
                    />
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button className="export-button">
                                <FiDownload size={16} />
                                <span>Export</span>
                                <FiChevronDown size={14} />
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={() => {
                                setSelectedProposal(null);
                                setIsCreateModalVisible(true);
                            }}
                            className="add-button"
                        >
                            Create Proposal
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="proposals-table-card">
                <ProposalList
                    proposals={filteredProposals}
                    loading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            </Card>

            <CreateProposal
                open={isCreateModalVisible}
                onCancel={() => {
                    setIsCreateModalVisible(false);
                    setSelectedProposal(null);
                }}
                onSuccess={handleCreateSuccess}
                initialValues={selectedProposal}
                isEditing={isEditing}
            />
        </div>
    );
};

export default Proposal;
