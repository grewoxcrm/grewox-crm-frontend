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
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiSearch,
    FiHome,
    FiChevronDown,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } from './services/roleApi';
import CreateRole from './CreateRole';
import EditRole from './EditRole';
import RoleList from './RoleList';
import './role.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;

const Role = () => {
    // States
    const [searchText, setSearchText] = useState('');
    const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [roles, setRoles] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Redux
    const currentUser = useSelector(state => state.auth.user);
    const { data: rolesData, isLoading: isLoadingRoles, refetch } = useGetRolesQuery();
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
    const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

    // Effects
    useEffect(() => {
        if (rolesData?.data) {
            const transformedData = rolesData.data.map(role => ({
                id: role.id,
                role_name: role.role_name || 'N/A',
                permissions: role.permissions,
                client_id: role.client_id,
                created_by: role.created_by,
                updated_by: role.updated_by,
                createdAt: role.createdAt,
                updatedAt: role.updatedAt
            }));
            const filteredData = transformedData.filter(role =>
                role.created_by === currentUser?.username
            );
            setRoles(filteredData);
            setFilteredRoles(filteredData);
        }
    }, [rolesData, currentUser]);

    useEffect(() => {
        const filtered = roles.filter(role =>
            role.role_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            role.created_by?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredRoles(filtered);
    }, [roles, searchText]);

    // Handlers
    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleAddRole = () => {
        setSelectedRole(null);
        setIsCreateFormVisible(true);
    };

    const handleEditRole = (role) => {
        if (!role?.id) {
            message.error("Cannot edit role: Missing ID");
            return;
        }
        // First close any existing modal
        setIsEditFormVisible(false);
        setSelectedRole(null);

        // Then set the new role and open modal after a small delay
        setTimeout(() => {
            setSelectedRole({
                id: role.id,
                role_name: role.role_name,
                permissions: role.permissions || {}
            });
            setIsEditFormVisible(true);
        }, 100);
    };

    const handleDeleteClick = (role) => {
        setSelectedRole(role);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteRole = async () => {
        try {
            await deleteRole(selectedRole.id).unwrap();
            message.success('Role deleted successfully');
            setIsDeleteModalVisible(false);
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to delete role');
        }
    };

    const handleCreateSubmit = async (formData) => {
        try {
            await createRole(formData).unwrap();
            message.success('Role created successfully');
            setIsCreateFormVisible(false);
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to create role');
        }
    };

    const handleEditSubmit = async (formData) => {
        try {
            if (!formData?.id) {
                throw new Error('Role ID is required for update');
            }

            const updateData = {
                id: formData.id,
                data: {
                    role_name: formData.role_name,
                    permissions: formData.permissions
                }
            };

            await updateRole(updateData).unwrap();
            message.success('Role updated successfully');
            setIsEditFormVisible(false);
            setSelectedRole(null);
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update role');
        }
    };

    // Export functions
    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = roles.map(role => ({
                'Role Name': role.role_name,
                'Created By': role.created_by,
                'Created Date': moment(role.createdAt).format('YYYY-MM-DD'),
            }));

            switch (type) {
                case 'csv': exportToCSV(data, 'roles_export'); break;
                case 'excel': exportToExcel(data, 'roles_export'); break;
                case 'pdf': exportToPDF(data, 'roles_export'); break;
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
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Roles');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 },
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

    return (
        <div className="role-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: "4px" }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Roles</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Roles</Title>
                    <Text type="secondary">Manage all roles in the system</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
                                placeholder="Search roles..."
                                allowClear
                                onChange={(e) => handleSearch(e.target.value)}
                                value={searchText}
                                className="search-input"
                            />
                            <div className="action-buttons">
                                <Dropdown overlay={exportMenu} trigger={["click"]}>
                                    <Button className="export-button">
                                        <FiDownload size={16} />
                                        <span>Export</span>
                                        <FiChevronDown size={14} />
                                    </Button>
                                </Dropdown>
                                <Button
                                    type="primary"
                                    icon={<FiPlus size={16} />}
                                    onClick={handleAddRole}
                                    className="add-button"
                                >
                                    Add Role
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="role-table-card">
                <RoleList
                    roles={filteredRoles}
                    loading={isLoadingRoles || isDeleting}
                    onEdit={handleEditRole}
                    onDelete={handleDeleteClick}
                />
            </Card>

            <CreateRole
                visible={isCreateFormVisible}
                onCancel={() => setIsCreateFormVisible(false)}
                onSubmit={handleCreateSubmit}
                loading={isCreating}
            />

            <EditRole
                visible={isEditFormVisible}
                onCancel={() => {
                    setIsEditFormVisible(false);
                    setSelectedRole(null);
                }}
                onSubmit={handleEditSubmit}
                loading={isUpdating}
                initialValues={selectedRole}
            />

            <Modal
                title="Delete Role"
                open={isDeleteModalVisible}
                onOk={handleDeleteRole}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: isDeleting
                }}
            >
                <p>Are you sure you want to delete <strong>{selectedRole?.role_name}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Role;
