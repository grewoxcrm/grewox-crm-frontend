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
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from './services/userApi';
import { useGetRolesQuery } from '../../../../dashboard/module/hrm/role/services/roleApi';
import CreateUser from './CreateUser';
import EditUser from './EditUser';
import UserList from './UserList';
import UserCard from './UserCard';
import './users.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';

const { Title, Text } = Typography;

const Users = () => {
    // States
    const [searchText, setSearchText] = useState('');
    const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: usersData, isLoading: isLoadingUsers, refetch } = useGetUsersQuery();
    const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();
    const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
    const [viewMode, setViewMode] = useState('table');

    useEffect(() => {
        if (usersData?.data) {
            const filteredData = usersData.data.filter(user => user?.created_by === loggedInUser?.username || user?.client_id === loggedInUser?.id);
            const transformedData = filteredData.map(user => ({
                id: user.id,
                username: user.username || 'N/A',
                email: user.email || 'N/A',
                phone: user.phone || 'N/A',
                status: user.status || 'inactive',
                created_at: user.createdAt || '-',
                updated_at: user.updatedAt || null,
                role_name: rolesData?.data?.find(role => role.id === user.role_id)?.role_name || 'N/A',
                role_id: user.role_id,
                created_by: user.created_by,
                updated_by: user.updated_by,
                profilePic: user.profilePic || null,
            }));
            setUsers(transformedData);
            setFilteredUsers(transformedData);
        }
    }, [usersData, rolesData]);

    useEffect(() => {
        const filtered = users.filter(user =>
            user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.role_name?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [users, searchText]);

    // Handlers
    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete User',
            content: 'Are you sure you want to delete this user?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: {
                padding: '20px',
            },
            onOk: async () => {
                try {
                    await deleteUser(record.id).unwrap();
                    message.success('User deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete user');
                }
            },
        });
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsCreateFormVisible(true);
    };

    const handleEditUser = (user) => {
        if (!user?.id) {
            message.error("Cannot edit user: Missing ID");
            return;
        }
        setSelectedUser(user);
        setIsEditFormVisible(true);
    };

    const handleCreateSubmit = async (formData) => {
        try {
            await createUser(formData).unwrap();
            message.success('User created successfully');
            setIsCreateFormVisible(false);
        } catch (error) {
            message.error(error?.data?.message || 'Failed to create user');
        }
    };

    const handleEditSubmit = async (formData) => {
        try {
            if (!formData?.id) {
                throw new Error('User ID is required for update');
            }

            const updateData = {
                id: formData.id,
                data: formData
            };

            await updateUser(updateData).unwrap();
            message.success('User updated successfully');
            setIsEditFormVisible(false);
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update user');
        }
    };

    // Export functions
    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = users.map(user => ({
                'Username': user.username,
                'Email': user.email,
                'Role': user.role_name,
                'Created Date': moment(user.created_at).format('YYYY-MM-DD'),
            }));

            switch (type) {
                case 'csv': exportToCSV(data, 'users_export'); break;
                case 'excel': exportToExcel(data, 'users_export'); break;
                case 'pdf': exportToPDF(data, 'users_export'); break;
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
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Users');
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
        <div className="users-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: "4px" }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Users</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Users</Title>
                    <Text type="secondary">Manage all users in the system</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
                                placeholder="Search users..."
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
                                    onClick={handleAddUser}
                                    className="add-button"
                                >
                                    Add User
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="users-card">
                {viewMode === 'table' ? (
                    <UserList
                        users={filteredUsers}
                        loading={isLoadingUsers || isDeleting}
                        onEdit={handleEditUser}
                        onDelete={handleDelete}
                    />
                ) : (
                    <div className="users-grid">
                        {filteredUsers.map(user => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onEdit={handleEditUser}
                                onDelete={handleDelete}
                                onView={() => { }}
                            />
                        ))}
                    </div>
                )}
            </Card>

            <CreateUser
                visible={isCreateFormVisible}
                onCancel={() => setIsCreateFormVisible(false)}
                onSubmit={handleCreateSubmit}
                loading={isCreating}
            />

            <EditUser
                visible={isEditFormVisible}
                onCancel={() => setIsEditFormVisible(false)}
                onSubmit={handleEditSubmit}
                loading={isUpdating}
                initialValues={selectedUser}
            />
        </div>
    );
};

export default Users;
