import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome
} from 'react-icons/fi';
import './Ticket.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import CreateTicket from './CreateTicket';
import TicketList from './TicketList';
import { useGetAllTicketsQuery, useDeleteTicketMutation } from './services/ticketApi';

const { Title, Text } = Typography;

const Tickets = () => {
    const dispatch = useDispatch();
    const filterState = useSelector(state => state.ticket) || {};
    
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
    
    // Use optional chaining and provide default values
    const { data: tickets, isLoading } = useGetAllTicketsQuery({
        ...filters,
        page: pagination?.current || 1,
        limit: pagination?.pageSize || 10,
        sortField: sorting?.field,
        sortOrder: sorting?.order,
    });

    const [deleteTicket] = useDeleteTicketMutation();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const searchInputRef = useRef(null);

    const filteredTickets = React.useMemo(() => {
        if (!tickets?.data) return [];
        
        return tickets.data.filter(ticket => {
            if (!searchText) return true;
            
            const searchTerm = searchText.toLowerCase();
            return (
                ticket.subject?.toLowerCase().includes(searchTerm) ||
                ticket.description?.toLowerCase().includes(searchTerm) ||
                ticket.priority?.toLowerCase().includes(searchTerm) ||
                ticket.status?.toLowerCase().includes(searchTerm) ||
                ticket.type?.toLowerCase().includes(searchTerm) ||
                ticket.requester?.toLowerCase().includes(searchTerm) ||
                ticket.agent?.toLowerCase().includes(searchTerm) ||
                ticket.project?.toLowerCase().includes(searchTerm)
            );
        });
    }, [tickets, searchText]);

    const handleAddTicket = () => {
        setSelectedTicket(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditTicket = (ticket) => {
        setSelectedTicket(ticket);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Confirmation',
            content: 'Are you sure you want to delete this ticket?',
            okType: 'danger',
            bodyStyle: { padding: '20px' },
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteTicket(record.id).unwrap();
                    message.success('Ticket deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete ticket');
                }
            },
        });
    };

    const handleFormClose = () => {
        setIsFormVisible(false);
        setSelectedTicket(null);
        setIsEditing(false);
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
            const data = filteredTickets.map(ticket => ({
                'Ticket ID': ticket.id,
                'Subject': ticket.ticketSubject,
                'Priority': ticket.priority,
                'Status': ticket.status,
                'Requester': ticket.requester,
                'Agent': ticket.agent,
                'Created Date': moment(ticket.created_at).format('YYYY-MM-DD'),
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'tickets_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'tickets_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'tickets_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
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
        <div className="tickets-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/support">Support</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Tickets</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Tickets</Title>
                    <Text type="secondary">Manage all tickets in the organization</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search tickets..."
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
                            onClick={handleAddTicket}
                            className="add-button"
                        >
                            Create Ticket
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="tickets-table-card">
                <TicketList
                    tickets={filteredTickets}
                    loading={isLoading}
                    onEdit={handleEditTicket}
                    onDelete={handleDelete}
                    onView={handleViewTicket}
                />
            </Card>

            <CreateTicket 
                open={isFormVisible}
                onCancel={handleFormClose}
                isEditing={isEditing}
                initialValues={selectedTicket}
            />
        </div>
    );
};

export default Tickets;
