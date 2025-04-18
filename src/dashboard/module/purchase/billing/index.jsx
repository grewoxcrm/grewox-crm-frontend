import React, { useState, useEffect } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Breadcrumb, Alert
} from 'antd';
import {
    FiPlus, FiSearch,
    FiDownload, FiHome,
    FiChevronDown
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import BillingList from './BillingList';
import CreateBilling from './CreateBilling';
import EditBilling from './EditBilling';
import './billing.scss';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { useGetBillingsQuery, useDeleteBillingMutation, useCreateBillingMutation } from './services/billingApi';
import { useGetVendorsQuery } from './services/billingApi';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;

const getCompanyId = (state) => {
    const user = state.auth.user;
    return user?.companyId || user?.company_id || user?.id;
};

const Billing = () => {
    const entireState = useSelector((state) => state);
    const loggedInUser = useSelector((state) => state.auth.user);
    const companyId = useSelector(getCompanyId);

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedBilling, setSelectedBilling] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createBilling] = useCreateBillingMutation();
    const [deleteBilling] = useDeleteBillingMutation();

    const { data: billings, isLoading, isError, refetch } = useGetBillingsQuery(companyId);
    const { data: vendorsData } = useGetVendorsQuery();

    // Create a map of vendor IDs to vendor names
    const vendorMap = React.useMemo(() => {
        if (!vendorsData?.data) return {};
        return vendorsData.data.reduce((acc, vendor) => {
            acc[vendor.id] = vendor.name;
            return acc;
        }, {});
    }, [vendorsData]);

    useEffect(() => {
        if (!companyId) {
            console.warn('No company ID found in user data');
        }
    }, [companyId]);

    const handleEdit = (record) => {
        setSelectedBilling(record);
        setIsEditModalVisible(true);
    };

    const handleView = (record) => {
        console.log('View billing:', record);
    };

    const handleDelete = async (record) => {
        try {
            Modal.confirm({
                title: 'Are you sure you want to delete this bill?',
                content: 'This action cannot be undone.',
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: async () => {
                    try {
                        const response = await deleteBilling(record.id).unwrap();
                        
                        if (response.success) {
                            message.success('Bill deleted successfully');
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
            message.error(error.message);
        }
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = billings?.data?.map(billing => {
                // Parse items to get tax name
                const items = typeof billing.items === 'string' ? JSON.parse(billing.items) : billing.items;
                const taxName = items?.[0]?.taxName || '';
                
                return {
                    'Bill Number': billing.billNumber,
                    'Vendor': vendorMap[billing.vendor] || billing.vendor,
                    'Bill Date': billing.billDate,
                    'Total': billing.total,
                    'Status': billing.status,
                    'Description': billing.discription,
                    'Sub Total': billing.subTotal,
                    'Discount': billing.discount,
                    'Tax': taxName ? `${taxName} (${billing.tax}%)` : billing.tax ? `${billing.tax}%` : '0%'
                };
            }) || [];

            // Remove any empty or null values and ensure proper order
            const orderedData = data.map(row => ({
                'Bill Number': row['Bill Number'] || '',
                'Vendor': row['Vendor'] || '',
                'Bill Date': row['Bill Date'] || '',
                'Total': row['Total'] || '',
                'Status': row['Status'] || '',
                'Description': row['Description'] || '',
                'Sub Total': row['Sub Total'] || '',
                'Discount': row['Discount'] || '',
                'Tax': row['Tax'] || '0%'
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(orderedData, 'billing_export');
                    break;
                case 'excel':
                    exportToExcel(orderedData, 'billing_export');
                    break;
                case 'pdf':
                    exportToPDF(orderedData, 'billing_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Billings');
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
            {/* <Menu.Item
                key="csv"
                icon={<FiDownload />}
                onClick={() => handleExport('csv')}
            >
                Export as CSV
            </Menu.Item> */}
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

    const handleCreateBilling = async (formData) => {
        try {
            if (!companyId) {
                message.error('Company ID not found');
                return;
            }

            const response = await createBilling({
                id: companyId,
                data: formData
            });
            
            if (response.data?.success) {
                message.success('Bill created successfully');
                setIsCreateModalVisible(false);
                refetch();
            } else {
                message.error(response.error?.data?.message || 'Failed to create bill');
            }
        } catch (error) {
            message.error('Failed to create bill');
            console.error('Create billing error:', error);
        }
    };

    return (
        <div className="billing-page">
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
                    <Breadcrumb.Item>Billings</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Billings</Title>
                    <Text type="secondary">Manage all billings in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="search-filter-group">
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                            placeholder="Search billings..."
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
                            onClick={() => setIsCreateModalVisible(true)}
                            className="add-button"
                            icon={<FiPlus size={16} />}
                        >
                            Add Billing
                        </Button>
                    </div>
                </div>
            </div>

            {!companyId && (
                <Alert
                    message="Warning"
                    description="Company ID not found. Some features may not work properly."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            <Card className="billing-table-card">
                <BillingList
                    billings={billings?.data || []}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    searchText={searchText}
                    loading={isLoading}
                />
            </Card>

            <CreateBilling
                open={isCreateModalVisible}
                onCancel={() => setIsCreateModalVisible(false)}
                onSubmit={handleCreateBilling}
            />

            <EditBilling
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setSelectedBilling(null);
                }}
                initialData={selectedBilling}
            />
        </div>
    );
};

export default Billing;
