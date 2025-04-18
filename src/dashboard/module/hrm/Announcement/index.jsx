import React, { useState, useEffect, useRef } from 'react';
import {
    Typography,
    Button,
    Modal,
    message,
    Input,
    Dropdown,
    Menu,
    Breadcrumb,
    Card,
    Popconfirm,
} from 'antd';
import {
    FiPlus,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './announcement.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateAnnouncement from './CreateAnnouncement';
import AnnouncementList from './AnnouncementList';
import { Link } from 'react-router-dom';
import { useGetAllAnnouncementsQuery, useDeleteAnnouncementMutation } from './services/announcementApi';

const { Title, Text } = Typography;

const Announcement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [messageApi] = message.useMessage();

    // Get all announcements
    const { data: announcements = [], isLoading, error } = useGetAllAnnouncementsQuery();
    
    // Delete mutation
    const [deleteAnnouncement] = useDeleteAnnouncementMutation();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const searchInputRef = useRef(null);

    // Update filtered announcements when announcements or search text changes
    useEffect(() => {
        const announcementsArray = Array.isArray(announcements) ? announcements : [];
        if (searchText) {
            const filtered = announcementsArray.filter(announcement =>
                announcement.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                announcement.description?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredAnnouncements(filtered);
        } else {
            setFilteredAnnouncements(announcementsArray);
        }
    }, [announcements, searchText]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleOpenModal = () => {
        setEditingAnnouncement(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingAnnouncement(null);
        setIsModalOpen(false);
    };

    const handleEdit = (record) => {
        setEditingAnnouncement(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (record) => {
        try {
            await deleteAnnouncement(record.id).unwrap();
            messageApi.success('Announcement deleted successfully');
        } catch (error) {
            console.error('Delete Error:', error);
            messageApi.error(error.data?.message || 'Failed to delete announcement');
        }
    };

    const handleAddAnnouncement = () => {
        setSelectedAnnouncement(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                // TODO: Implement update API call
                const updatedAnnouncements = announcements.map(a =>
                    a.id === selectedAnnouncement.id ? { ...a, ...formData } : a
                );
                // TODO: Implement update API call
                setAnnouncements(updatedAnnouncements);
                message.success('Announcement updated successfully');
            } else {
                // TODO: Implement create API call
                const newAnnouncement = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                    created_by: 'Admin',
                    status: 'active'
                };
                setAnnouncements([...announcements, newAnnouncement]);
                message.success('Announcement created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Announcements');
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

    const handleExport = async (type) => {
        try {
            const data = announcements.map(announcement => ({
                'Title': announcement.title,
                'Description': announcement.description,
                'Status': announcement.status,
                'Created By': announcement.created_by,
                'Created Date': moment(announcement.created_at).format('YYYY-MM-DD'),
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'announcements_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'announcements_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'announcements_export');
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
        }
    };

    const exportMenu = (
        <Menu>
            <Menu.Item key="csv" icon={<FiDownload />} onClick={() => handleExport('csv')}>
                Export as CSV
            </Menu.Item>
            <Menu.Item key="excel" icon={<FiDownload />} onClick={() => handleExport('excel')}>
                Export as Excel
            </Menu.Item>
            <Menu.Item key="pdf" icon={<FiDownload />} onClick={() => handleExport('pdf')}>
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    if (error) {
        return <div>Error loading announcements: {error.message}</div>;
    }

    return (
        <div className="announcement-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/hrm">HRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Announcements</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Announcements</Title>
                    <Text type="secondary">Manage all announcements in the organization</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search announcements..."
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
                            onClick={handleOpenModal}
                            className="add-button"
                        >
                            Create Announcement
                        </Button>
                    </div>
                </div>
            </div>

            <div className="announcement-table-card">
                <AnnouncementList
                    announcements={filteredAnnouncements}
                    loading={isLoading}
                    onEdit={handleEdit}
                    onDelete={(record) => {
                        Modal.confirm({
                            title: 'Delete Announcement',
                            content: 'Are you sure you want to delete this announcement?',
                            okText: 'Yes',
                            cancelText: 'No',
                            onOk: () => handleDelete(record),
                        });
                    }}
                />
            </div>

            <CreateAnnouncement
                open={isModalOpen}
                onCancel={handleCloseModal}
                isEditing={!!editingAnnouncement}
                initialValues={editingAnnouncement}
                onSubmit={handleFormSubmit}
                loading={isLoading}
            />
        </div>
    );
};

export default Announcement;
