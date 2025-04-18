import React, { useState } from 'react';
import { Table, Button, Tag, Dropdown, Modal, Avatar, message, Input, Space } from 'antd';
import { FiEye, FiEdit2, FiTrash2, FiMoreVertical, FiUser, FiLogIn } from 'react-icons/fi';
import { PiRocketBold } from 'react-icons/pi';
import moment from 'moment';
import EditCompany from './EditCompany';
import CreateUpgradePlan from './CreateUpgradePlan';
import { useAdminLoginMutation } from '../../../auth/services/authApi';
import { useNavigate } from 'react-router-dom';
import { useGetAllAssignedPlansQuery } from './services/companyApi';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const CompanyList = ({ companies, loading, onView, onEdit, onDelete }) => {

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [adminLogin] = useAdminLoginMutation();
    const navigate = useNavigate();

    // Define status options
    const planStatuses = [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
    ];

    // Fetch all assigned plans
    const { data: assignedPlans } = useGetAllAssignedPlansQuery();

    // Function to check if company has active subscription
    const hasActiveSubscription = (companyId) => {
        if (!assignedPlans?.data) return false;
        return assignedPlans.data.some(
            sub => sub.client_id === companyId && sub.status !== 'cancelled'
        );
    };

    const handleAdminLogin = async (company) => {
        try {
            const response = await adminLogin({
                email: company.email,
                isClientPage: true
            }).unwrap();

            if (response.success) {
                message.success('Logged in as company successfully');
                navigate('/dashboard');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to login as company');
        }
    };

    const handleUpgradePlan = (record) => {
        setSelectedCompany(record);
        setUpgradeModalVisible(true);
    };

    const getInitials = (username) => {
        return username
            ? username.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
            : 'U';
    };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'upgrade',
                icon: <PiRocketBold />,
                label: 'Upgrade Plan',
                onClick: () => handleUpgradePlan(record),
            },
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(record),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit Company',
                onClick: () => onEdit(record),
            },
            {
                key: 'login',
                icon: <FiLogIn />,
                label: 'Login as Company',
                onClick: () => handleAdminLogin(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete Company',
                danger: true,
                onClick: () => onDelete(record),
            }
        ]
    });

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profilePic',
            key: 'profilePic',
            sorter: (a, b) => a.profilePic.localeCompare(b.profilePic),
            width: 80,
            render: (profilePic, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        size={40}
                        src={profilePic}
                        icon={!profilePic && <FiUser />}
                        style={{
                            backgroundColor: !profilePic ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {!profilePic && getInitials(record.username)}
                    </Avatar>
                </div>
            ),
        },
        {
            title: 'Company Name',
            dataIndex: 'name',
            key: 'name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search company name"
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                  />
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => confirm()}
                      size="small"
                      style={{ width: 90 }}
                    >
                      Filter
                    </Button>
                    <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                      Reset
                    </Button>
                  </Space>
                </div>
              ),
              onFilter: (value, record) =>
                (record.name?.toLowerCase() || '').includes(value.toLowerCase()),    
            render: (text) => (
                <div style={{ fontWeight: 500 }}>{text || 'N/A'}</div>
            ),
            width: '20%',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
            render: (text) => (
                text && text !== 'N/A' ? (
                    <a href={`mailto:${text}`} onClick={(e) => e.stopPropagation()}>
                        {text}
                    </a>
                ) : 'N/A'
            ),
            width: '25%',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            sorter: (a, b) => a.phone.localeCompare(b.phone),
            render: (text) => text || 'N/A',
            width: '15%',
        },
        {
            title: 'Plan Status',
            key: 'planStatus',
            width: '140px',
            filters: planStatuses,
            onFilter: (value, record) => {
                const isActive = hasActiveSubscription(record.id);
                return value === (isActive ? 'active' : 'inactive');
            },
            render: (_, record) => {
                const isActive = hasActiveSubscription(record.id);
                return (
                    <Tag
                        style={{
                            background: isActive 
                                ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                                : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                            color: isActive ? '#15803d' : '#b91c1c',
                            border: `1px solid ${isActive ? '#86efac' : '#fca5a5'}`,
                            padding: '4px 12px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}
                    >
                        {isActive ? (
                            <>
                                <CheckCircleOutlined style={{ fontSize: '12px' }} />
                                ACTIVE
                            </>
                        ) : (
                            <>
                                <CloseCircleOutlined style={{ fontSize: '12px' }} />
                                INACTIVE
                            </>
                        )}
                    </Tag>
                );
            },
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-',
            sorter: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
            width: '15%',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 280,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="primary"
                        icon={<FiLogIn />}
                        onClick={() => handleAdminLogin(record)}
                        style={{
                            background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                            border: 'none',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0 12px',
                            borderRadius: '6px',
                            fontSize: '13px'
                        }}
                    >
                        Login
                    </Button>
                    <Dropdown
                        menu={getDropdownItems(record)}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            icon={<FiMoreVertical />}
                            style={{
                                border: '1px solid #E5E7EB',
                                width: '32px',
                                height: '32px',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />
                    </Dropdown>
                </div>
            ),
        }
    ];

    return (
        <>
            <Table
                dataSource={companies}
                columns={columns}
                rowKey={record => record.id}
                scroll={{ x: 1100 }}
                pagination={{
                    current: currentPage,
                    pageSize: 10,
                    total: companies.length,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    onChange: (page) => setCurrentPage(page)
                }}
            />

            {editModalVisible && (
                <EditCompany
                    visible={editModalVisible}
                    onCancel={() => {
                        setEditModalVisible(false);
                        setSelectedCompany(null);
                    }}
                    onComplete={(updatedCompany) => {
                        setEditModalVisible(false);
                        setSelectedCompany(null);
                        if (onEdit) {
                            onEdit(updatedCompany);
                        }
                    }}
                    initialValues={selectedCompany}
                    loading={loading}
                />
            )}

            <CreateUpgradePlan
                open={upgradeModalVisible}
                onCancel={() => {
                    setUpgradeModalVisible(false);
                    setSelectedCompany(null);
                }}
                companyId={selectedCompany?.id}
                isEditing={false}
                initialValues={null}
            />
        </>
    );
};

export default CompanyList; 