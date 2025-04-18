import React, { useState, useEffect } from 'react';
import {
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
    Card,
    Form,
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiSearch,
    FiHome,
    FiChevronDown,
    FiLock,
    FiMail,
    FiGrid,
    FiList,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateSubclient from './CreateSubclient';
import SubclientCard from './SubclientCard';
import SubclientList from './SubclientList';
import { useGetAllSubclientsQuery, useDeleteSubclientMutation } from './services/subClientApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import EditSubclient from './EditSubclient';
import './Subclient.scss';

const { Title, Text } = Typography;

const SubClient = () => {
    // States
    const [searchText, setSearchText] = useState('');
    const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [selectedSubclient, setSelectedSubclient] = useState(null);
    const [subclients, setSubclients] = useState([]);
    const [filteredSubclients, setFilteredSubclients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { data: subclientsData, isLoading: isLoadingSubclients, refetch } = useGetAllSubclientsQuery();
    const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();
    const [deleteSubclient, { isLoading: isDeleting }] = useDeleteSubclientMutation();

    useEffect(() => {
        if (subclientsData?.data) {
            const transformedData = subclientsData.data.map(subclient => ({
                id: subclient.id,
                username: subclient.username || 'N/A',
                firstName: subclient.firstName || '',
                lastName: subclient.lastName || '',
                email: subclient.email || '',
                phone: subclient.phone || '',
                phoneCode: subclient.phoneCode || '',
                website: subclient.website || '',
                address: subclient.address || '',
                city: subclient.city || '',
                state: subclient.state || '',
                country: subclient.country || '',
                zipcode: subclient.zipcode || '',
                bankname: subclient.bankname || '',
                bankaccount: subclient.bankaccount || '',
                gstin: subclient.gstin || '',
                ifsc: subclient.ifsc || '',
                accountholder: subclient.accountholder || '',
                accountnumber: subclient.accountnumber || '',
                gstIn: subclient.gstIn || '',
                banklocation: subclient.banklocation || '',
                role_name: rolesData?.data?.find(role => role?.id === subclient?.role_id)?.role_name || 'N/A',
                created_at: subclient.createdAt || '-',
                updated_at: subclient.updatedAt || null,
                profilePic: subclient.profilePic || null,
                status: subclient.status || 'inactive',
                role_id: subclient.role_id,
                created_by: subclient.created_by,
                updated_by: subclient.updated_by
            }));
            setSubclients(transformedData);
            setFilteredSubclients(transformedData);
        }
    }, [subclientsData, rolesData]);

    useEffect(() => {
        const filtered = subclients.filter(subclient =>
            subclient.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            subclient.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            subclient.role_name?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredSubclients(filtered);
    }, [subclients, searchText]);

    // Handlers
    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Subclient',
            content: 'Are you sure you want to delete this subclient?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            styles: {
                body: {
                    padding: '20px',
                },
            },
            onOk: async () => {
                try {
                    await deleteSubclient(record.id).unwrap();
                    message.success('Subclient deleted successfully');
                    refetch();
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete subclient');
                }
            },
        });
    };

    const handleCreate = () => {
        setSelectedSubclient(null);
        setIsCreateFormVisible(true);
    };

    const handleEdit = (subclient) => {
        if (!subclient?.id) {
            message.error("Cannot edit subclient: Missing ID");
            return;
        }
        setSelectedSubclient(subclient);
        setIsEditFormVisible(true);
        setIsEditModalOpen(true);
    };

    // const handleEdit = (subclient) => {
    //     setSelectedSubclient(subclient);
    //     setIsEditModalOpen(true);
    // };

    const handleView = (subclient) => {
        setSelectedSubclient(subclient);
    };

    // Export functions
    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = subclients.map(subclient => ({
                'Subclient Name': subclient.username,
                'Email': subclient.email,
                'Role': subclient.role_name,
                'Created Date': moment(subclient.created_at).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv': exportToCSV(data, 'subclients_export'); break;
                case 'excel': exportToExcel(data, 'subclients_export'); break;
                case 'pdf': exportToPDF(data, 'subclients_export'); break;
                default: break;
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
            ...data.map(item =>
                Object.values(item)
                    .map(value => `"${value?.toString().replace(/"/g, '""')}"`)
                    .join(',')
            ),
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
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Subclients');
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

    const renderContent = () => {
        if (isLoadingSubclients || isLoadingRoles) {
            return <div className="loading-state">Loading...</div>;
        }

        if (viewMode === 'table') {
            return (
                <Card className="subclient-table-card">
                    <SubclientList
                        subclients={filteredSubclients}
                        loading={loading || isDeleting}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                    />
                </Card>
            );
        }

        return (
            <Card className="subclient-grid-card">
                <Row gutter={[16, 16]}>
                    {filteredSubclients.map(subclient => (
                        <Col xs={24} sm={12} md={8} lg={6} key={subclient.id}>
                            <SubclientCard
                                subclient={subclient}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onView={handleView}
                            />
                        </Col>
                    ))}
                </Row>
            </Card>
        );
    };

    return (
        <div className="users-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Subclients</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Subclients</Title>
                    <Text type="secondary">Manage all subclients in the system</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search subclients by name, email, or role"
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
                                    onClick={handleCreate}
                                >
                                    Add Subclient
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <div>
                {renderContent()}
            </div>

            {isCreateFormVisible && (
                <CreateSubclient
                    open={isCreateFormVisible}
                    onCancel={() => setIsCreateFormVisible(false)}
                    onSuccess={() => {
                        setIsCreateFormVisible(false);
                        refetch();
                    }}
                />
            )}

            <EditSubclient
                open={isEditModalOpen}
                bodyStyle={{ marginTop: '20px' }}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setIsEditFormVisible(false);
                    setSelectedSubclient(null);
                }}
                initialValues={selectedSubclient}
            />

            {/* {isEditFormVisible && selectedSubclient && (
                <EditSubclient
                    visible={isEditFormVisible}
                    subclient={selectedSubclient}
                    onClose={() => {
                        setIsEditFormVisible(false);
                        setIsEditModalOpen(false);
                        setSelectedSubclient(null);
                    }}
                    onSuccess={() => {
                        setIsEditFormVisible(false);
                        setIsEditModalOpen(false);
                        setSelectedSubclient(null);
                        refetch();
                    }}
                />
            )} */}
        </div>
    );
};

export default SubClient;

