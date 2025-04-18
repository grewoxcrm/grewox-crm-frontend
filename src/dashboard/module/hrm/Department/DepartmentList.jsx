import React, { useState, useEffect, useMemo } from 'react';
import { Table, Space, Button, Tooltip, Tag, message, Modal, Dropdown, Input } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';
import { useGetAllDepartmentsQuery, useDeleteDepartmentMutation } from './services/departmentApi';
import { useGetAllBranchesQuery } from '../Branch/services/branchApi';
import dayjs from 'dayjs';

const DepartmentList = ({ onEdit, onView, searchText, filters }) => {
    // RTK Query hooks
    const { data: departmentsData = [], isLoading: isLoadingDepartments } = useGetAllDepartmentsQuery();
    const { data: branchesData = [], isLoading: isLoadingBranches } = useGetAllBranchesQuery();
    const [deleteDepartment] = useDeleteDepartmentMutation();

    // Transform branches data into a map for quick lookup
    const branchMap = useMemo(() => {
        const map = {};
        if (Array.isArray(branchesData)) {
            branchesData.forEach(branch => {
                map[branch.id] = branch;
            });
        } else if (Array.isArray(branchesData.data)) {
            branchesData.data.forEach(branch => {
                map[branch.id] = branch;
            });
        }
        return map;
    }, [branchesData]);

    // Transform and filter departments data
    const departments = useMemo(() => {
        let filteredData = [];

        if (!departmentsData) return [];

        // Handle both array and object response formats
        if (Array.isArray(departmentsData)) {
            filteredData = departmentsData;
        } else if (Array.isArray(departmentsData.data)) {
            filteredData = departmentsData.data;
        }

        // Apply filters
        return filteredData.filter(department => {
            // Text search filter
            if (searchText) {
                const searchLower = searchText.toLowerCase();
                const departmentName = (department?.department_name || '').toLowerCase();
                const branchName = (branchMap[department?.branch]?.branchName || '').toLowerCase();

                if (!departmentName.includes(searchLower) && !branchName.includes(searchLower)) {
                    return false;
                }
            }

            // Status filter
            if (filters.status && department.status !== filters.status) {
                return false;
            }

            // Branch filter
            if (filters.branch && department.branch !== filters.branch) {
                return false;
            }

            return true;
        });
    }, [departmentsData, searchText, filters, branchMap]);

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Department',
            content: 'Are you sure you want to delete this department?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: {
                padding: '20px',
            },
            onOk: async () => {
                try {
                    await deleteDepartment(id).unwrap();
                    message.success('Department deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete department');
                }
            },
        });
    };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(record),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit',
                onClick: () => onEdit(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => handleDelete(record.id),
                danger: true,
            },
        ],
    });

    const columns = [
        {
            title: 'Department Name',
            dataIndex: 'department_name',
            key: 'department_name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search department name"
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
                record.department_name.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <span className="text-base">
                    {text || record.name || 'N/A'}
                </span>
            ),
            
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search branch"
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
                record.branch.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (branchId) => {
                const branch = branchMap[branchId];
                return (
                    <span className="text-base">
                        {branch?.branchName || 'N/A'}
                    </span>
                );
            },
           
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="department-actions-dropdown"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-dropdown-button"
                        onClick={(e) => e.preventDefault()}
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="department-list">
            <Table
                columns={columns}
                dataSource={departments}
                // loading={isLoadingDepartments || isLoadingBranches}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                className="department-table"
            />
        </div>
    );
};

export default DepartmentList; 