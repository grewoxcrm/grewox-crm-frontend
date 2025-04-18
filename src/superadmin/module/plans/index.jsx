import React, { useState, useEffect, useRef } from 'react';
import {
    Row,
    Col,
    Input,
    Button,
    Typography,
    Breadcrumb,
    Card,
    Dropdown,
    Menu,
    message,
    Modal
} from 'antd';
import {
    FiPlus,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiGrid,
    FiList,
    FiHome
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './plans.scss';

import {
    useGetAllPlansQuery,
    useDeletePlanMutation,
    useUpdatePlanMutation
} from './services/planApi';

import PlanList from './PlanList';
import PlanCard from './PlanCard';
import AddPlan from './AddPlan';
import EditPlan from './EditPlan';

const { Title, Text } = Typography;

const Plans = () => {
    const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });
    const [viewMode, setViewMode] = useState('table');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [idd, setIdd] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const searchInputRef = useRef(null);
    const [exportLoading, setExportLoading] = useState(false);

    const {
        data: plansData,
        isLoading,
        isFetching
    } = useGetAllPlansQuery(filters);

    const [deletePlan] = useDeletePlanMutation();
    const [updatePlan] = useUpdatePlanMutation();

    const filteredPlans = React.useMemo(() => {
        if (!plansData?.data) return [];

        const searchTerm = filters.search.toLowerCase().trim();
        if (!searchTerm) return plansData.data;

        return plansData.data.filter(plan =>
            plan.name?.toLowerCase().includes(searchTerm)
        );
    }, [plansData, filters.search]);

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value, page: 1 }));
    };

    const handleEdit = (plan) => {
        const editData = {
            id: plan.id,
            name: plan.name,
            currency: plan.currency,
            price: plan.price?.toString(),
            duration: plan.duration?.toString(),
            trial_period: plan.trial_period?.toString(),
            storage_limit: plan.storage_limit?.toString(),
            max_users: plan.max_users?.toString(),
            max_clients: plan.max_clients?.toString(),
            max_vendors: plan.max_vendors?.toString(),
            max_customers: plan.max_customers?.toString(),
            status: plan.status
        };
        console.log('Edit data being set:', editData);
        setIdd(plan.id);
        setSelectedPlan(editData);
        setIsEditModalOpen(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Plan',
            content: `Are you sure you want to delete "${record.name}"?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: {
                padding: '20px',
            },
            onOk: async () => {
                try {
                    await deletePlan(record.id).unwrap();
                    message.success('Plan deleted successfully');
                } catch (error) {
                    console.error('Delete error:', error);
                    message.error(error?.data?.message || 'Failed to delete plan');
                }
            },
        });
    };

    const handleToggleStatus = async (id, newStatus) => {
        try {
            const currentPlan = plansData?.data.find(p => p.id === id);
            if (!currentPlan) {
                message.error('Plan not found');
                return;
            }

            const updateData = {
                id: id,
                name: currentPlan.name,
                price: currentPlan.price?.toString(),
                duration: currentPlan.duration?.toString(),
                trial_period: currentPlan.trial_period?.toString(),
                storage_limit: currentPlan.storage_limit?.toString(),
                max_users: currentPlan.max_users?.toString(),
                max_clients: currentPlan.max_clients?.toString(),
                max_vendors: currentPlan.max_vendors?.toString(),
                max_customers: currentPlan.max_customers?.toString(),
                status: newStatus
            };

            await updatePlan({ idd: id, updateData }).unwrap();
            message.success(`Plan ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Status update error:', error);
            message.error('Failed to update plan status');
        }
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
            setExportLoading(true);

            if (!plansData?.data || plansData.data.length === 0) {
                message.warning('No data available to export');
                return;
            }

            const data = plansData.data.map(plan => ({
                'Plan Name': plan.name || 'N/A',
                'Price': `${plan.currency || '$'}${Number(plan.price || 0).toFixed(2)}`,
                'Duration': `${plan.duration || 0} ${plan.duration_unit || 'Days'}`,
                'Trial Period': `${plan.trial_period || 0} Days`,
                'Storage Limit': `${plan.storage_limit || 0} GB`,
                'Max Users': plan.max_users || 0,
                'Max Clients': plan.max_clients || 0,
                'Max Vendors': plan.max_vendors || 0,
                'Max Customers': plan.max_customers || 0,
                'Status': plan.status?.charAt(0).toUpperCase() + plan.status?.slice(1) || 'Inactive',
                'Created At': moment(plan.created_at).format('YYYY-MM-DD')
            }));

            const timestamp = moment().format('YYYY-MM-DD_HH-mm');
            const filename = `plans_export_${timestamp}`;

            switch (type) {
                case 'csv':
                    exportToCSV(data, filename);
                    break;
                case 'excel':
                    exportToExcel(data, filename);
                    break;
                case 'pdf':
                    exportToPDF(data, filename);
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
        } finally {
            setExportLoading(false);
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
        XLSX.utils.book_append_sheet(wb, ws, 'Plans');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8, cellPadding: 2 },
            theme: 'grid'
        });
        doc.save(`${filename}.pdf`);
    };

    const handlePageChange = (page, pageSize) => {
        setFilters(prev => ({ ...prev, page, limit: pageSize }));
    };

    const renderCardView = () => (
        <div className="plans-cards-grid">
            {plansData?.data.map((plan) => (
                <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={() => handleEdit(plan)}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                />
            ))}
        </div>
    );

    return (
        <div className="plans-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Plans</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Plans</Title>
                    <Text type="secondary">Manage subscription plans</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search plans..."
                                allowClear
                                onChange={(e) => handleSearch(e.target.value)}
                                value={filters.search}
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
                                <Dropdown
                                    overlay={exportMenu}
                                    trigger={['click']}
                                    disabled={isLoading || isFetching || exportLoading}
                                >
                                    <Button
                                        className="export-button"
                                        loading={exportLoading}
                                    >
                                        {!exportLoading && <FiDownload size={16} />}
                                        <span>Export</span>
                                        <FiChevronDown size={14} />
                                    </Button>
                                </Dropdown>
                                <Button
                                    type="primary"
                                    icon={<FiPlus size={16} />}
                                    onClick={() => setIsAddModalVisible(true)}
                                    className="add-button"
                                >
                                    Add Plan
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="plans-table-card">
                {viewMode === 'table' ? (
                    <PlanList
                        plans={filteredPlans}
                        loading={isLoading || isFetching}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        pagination={{
                            current: filters.page,
                            pageSize: filters.limit,
                            total: plansData?.total || 0
                        }}
                        onPageChange={handlePageChange}
                        searchText={filters.search}
                    />
                ) : (
                    renderCardView()
                )}
            </Card>

            <AddPlan
                visible={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
            />

            <EditPlan
                open={isEditModalOpen}
                idd={idd}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedPlan(null);
                }}
                initialValues={selectedPlan}
            />
        </div>
    );
};

export default Plans; 