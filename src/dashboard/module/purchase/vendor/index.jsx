import React, { useState } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Breadcrumb
} from 'antd';
import {
    FiPlus, FiSearch,
    FiDownload, FiHome,
    FiChevronDown
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import VendorList from './VendorList';
import CreateVendor from './CreateVendor';
import EditVendor from './EditVendor';
import './vendor.scss';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { useGetVendorsQuery, useDeleteVendorMutation } from './services/vendorApi';

const { Title, Text } = Typography;

const Vendor = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    const { data: vendors, isLoading, isError, refetch } = useGetVendorsQuery();
    const [deleteVendor] = useDeleteVendorMutation();

    const handleCreate = () => {
        setSelectedVendor(null);
        setIsCreateModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedVendor(record);
        setIsEditModalOpen(true);
        setIsEditing(true);
    };

    const handleView = (record) => {
        console.log('View vendor:', record);
    };

    const handleDelete = async (record) => {
        try {
            Modal.confirm({
                title: 'Are you sure you want to delete this vendor?',
                content: 'This action cannot be undone.',
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: async () => {
                    try {
                        const response = await deleteVendor(record.id).unwrap();
                        
                        if (response.success) {
                            message.success('Vendor deleted successfully');
                            refetch();
                        } else {
                            message.error(response.message);
                        }
                    } catch (error) {
                            console.error('Delete Error:', error);
                            message.error(error.message);
                    }
                }
            });
        } catch (error) {
            console.error('Delete Error:', error);
            message.error( error.message);
        }
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = vendors?.data?.map(vendor => ({
                'Name': vendor.name,
                'Contact': vendor.contact,
                'Email': vendor.email,
                'Address': vendor.address,
                'City': vendor.city,
                'State': vendor.state,
                'Country': vendor.country,
                'Status': vendor.status || 'Active'
            })) || [];

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'vendor_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'vendor_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'vendor_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
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

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setIsEditing(false);
        setSelectedVendor(null);
    };

  return (
        <div className="vendor-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/purchase">Purchase</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Vendors</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Vendors</Title>
                    <Text type="secondary">Manage all vendors in the organization</Text>
                </div>
                <div className="header-actions">
                <div className="search-filter-group">
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                            placeholder="Search vendors..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                            className="search-input"
                            style={{ 
                                width: '300px', 
                                borderRadius: '20px',
                                height: '38px'
                            }}  
                        />
                    </div>
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
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
                            icon={<FiPlus size={16} />}
                            onClick={handleCreate}
                            className="add-button"
                        >
                            Add Vendor
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="vendor-table-card">
                <VendorList
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    loading={isLoading}
                    searchText={searchText}
                />
            </Card>

            <CreateVendor
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSubmit={() => {
                    setIsCreateModalOpen(false);
                    message.success('Vendor created successfully');
                }}
            />

            <EditVendor
                open={isEditModalOpen}
                onCancel={handleEditModalClose}
                isEditing={isEditing}
                initialValues={selectedVendor}
            />
        </div>
    );
};

export default Vendor;
