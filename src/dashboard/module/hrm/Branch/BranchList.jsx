import React, { useState, useMemo } from 'react';
import { Table, Space, Button, Tooltip, Tag, message, Modal, Dropdown, Input } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import { useGetAllBranchesQuery, useDeleteBranchMutation } from './services/branchApi';
import dayjs from 'dayjs';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';

const BranchList = ({ onEdit, searchText = '', filters = {} }) => {
    // RTK Query hooks
    const { data: branchesData = [], isLoading } = useGetAllBranchesQuery();
    const [deleteBranch] = useDeleteBranchMutation();
    const { data: userData, isLoading: isLoadingUsers } = useGetUsersQuery();

    // Create a map of user IDs to user data for quick lookup
    const userMap = useMemo(() => {
        const map = {};
        if (userData?.data) {
            userData.data.forEach(user => {
                if (user && user.id) {
                    map[user.id] = user;
                }
            });
        }
        return map;
    }, [userData]);

    // Transform branches data
    const branches = useMemo(() => {
        let filteredData = [];
        
        if (!branchesData) return [];
        if (Array.isArray(branchesData)) {
            filteredData = branchesData;
        } else if (Array.isArray(branchesData.data)) {
            filteredData = branchesData.data;
        }

        // Apply filters
        return filteredData.filter(branch => {
            if (!branch) return false;

            const branchManager = userMap[branch.branchManager] || {};
            const managerName = branchManager?.username || 'No Manager';

            const matchesSearch = !searchText || searchText.toLowerCase() === '' ||
                (branch.branchName || '').toLowerCase().includes(searchText.toLowerCase()) ||
                managerName.toLowerCase().includes(searchText.toLowerCase());

            const matchesDesignationType = !filters.designationType ||
                branch.designation_type === filters.designationType;

            const matchesStatus = !filters.status ||
                branch.status === filters.status;

            const matchesDateRange = !filters.dateRange?.length ||
                (dayjs(branch.created_at).isAfter(filters.dateRange[0]) &&
                dayjs(branch.created_at).isBefore(filters.dateRange[1]));

            return matchesSearch && matchesDesignationType && matchesStatus && matchesDateRange;
        });
    }, [branchesData, searchText, filters, userMap]);

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Branch',
            content: 'Are you sure you want to delete this branch?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    await deleteBranch(id).unwrap();
                    message.success('Branch deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete branch');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Branch Name',
            dataIndex: 'branchName',
            key: 'branchName',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search branch name"
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
                record.branchName.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (text) => <span className="text-base">{text || 'N/A'}</span>,
        },
        {
            title: 'Branch Manager',
            dataIndex: 'branchManager',
            key: 'branchManager',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search branch manager"
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
                record.branchManager.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (managerId) => {
                const manager = userMap[managerId] || {};
                const managerName = manager?.username || 'No Manager';
                return (
                    <Tooltip title={manager?.email || 'No email available'}>
                        <span className="text-base">
                            {managerName}
                        </span>
                    </Tooltip>
                );
            },
            
        },
        {
            title: 'Address',
            dataIndex: 'branchAddress',
            key: 'branchAddress',
            ellipsis: true,
            render: (address) => (
                <Tooltip title={address || 'No address'}>
                    <span style={{ color: '#4b5563' }}>{address || 'N/A'}</span>
                </Tooltip>
            ),
            sorter: (a, b) => (a.branchAddress || '').localeCompare(b.branchAddress || ''),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const items = [
                    {
                        key: 'view',
                        icon: <FiEye style={{ fontSize: '14px' }} />,
                        label: 'View',
                        onClick: () => onEdit(record),
                    },
                    {
                        key: 'edit',
                        icon: <FiEdit2 style={{ fontSize: '14px' }} />,
                        label: 'Edit',
                        onClick: () => onEdit(record),
                    },
                    {
                        key: 'delete',
                        icon: <FiTrash2 style={{ fontSize: '14px', color: '#ff4d4f' }} />,
                        label: 'Delete',
                        danger: true,
                        onClick: () => handleDelete(record.id),
                    },
                ];

                return (
                    <Dropdown
                        menu={{ items }}
                        trigger={['click']}
                        placement="bottomRight"
                        overlayClassName="branch-actions-dropdown"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical />}
                            className="action-dropdown-button"
                            onClick={(e) => e.preventDefault()}
                        />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div className="branch-list">
            <Table
                columns={columns}
                dataSource={branches}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                className="branch-table"
            />
        </div>
    );
};

export default BranchList; 