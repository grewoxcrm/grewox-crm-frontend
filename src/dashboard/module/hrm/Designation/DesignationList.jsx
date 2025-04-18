import React, { useState } from 'react';
import { Table, Space, Button, Tooltip, Tag, message, Modal, Select, Dropdown, Input } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import { 
    useGetAllDesignationsQuery, 
    useDeleteDesignationMutation,
    useUpdateDesignationMutation 
} from './services/designationApi';
import { useGetAllBranchesQuery } from '../Branch/services/branchApi';
import dayjs from 'dayjs';

const { Option } = Select;

const DesignationList = ({ onEdit, onView, searchText, filters }) => {
    const [editingRecord, setEditingRecord] = useState(null);

    // RTK Query hooks
    const { data: designationsData = [], isLoading: isLoadingDesignations } = useGetAllDesignationsQuery();
    const { data: branchesData = [], isLoading: isLoadingBranches } = useGetAllBranchesQuery();
    const [deleteDesignation] = useDeleteDesignationMutation();
    const [updateDesignation] = useUpdateDesignationMutation();

    // Transform designations data
    const designations = React.useMemo(() => {
        let filteredData = [];
        
        if (!designationsData) return [];
        if (Array.isArray(designationsData)) {
            filteredData = designationsData;
        } else if (Array.isArray(designationsData.data)) {
            filteredData = designationsData.data;
        }

        // Apply filters
        return filteredData.filter(designation => {
            const matchesSearch = searchText.toLowerCase() === '' ||
                designation.designation_name.toLowerCase().includes(searchText.toLowerCase()) ||
                (designation.company_type || '').toLowerCase().includes(searchText.toLowerCase());

            const matchesCompanyType = !filters.companyType ||
                designation.company_type === filters.companyType;

            const matchesStatus = !filters.status ||
                designation.status === filters.status;

            const matchesDateRange = !filters.dateRange?.length ||
                (dayjs(designation.created_at).isAfter(filters.dateRange[0]) &&
                dayjs(designation.created_at).isBefore(filters.dateRange[1]));

            return matchesSearch && matchesCompanyType && matchesStatus && matchesDateRange;
        });
    }, [designationsData, searchText, filters]);

    // Transform branches data into a map for quick lookup
    const branchMap = React.useMemo(() => {
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

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Designation',
            content: 'Are you sure you want to delete this designation?',
            okText: 'Yes',
            okType: 'danger',
            bodyStyle: { padding: '20px' },
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteDesignation(id).unwrap();
                    message.success('Designation deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete designation');
                }
            },
        });
    };

    const getCompanyTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'private':
                return 'blue';
            case 'public':
                return 'green';
            case 'government':
                return 'gold';
            default:
                return 'default';
        }
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
                icon: <FiEdit2  />,
                label: 'Edit',
                onClick: () => onEdit(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2  />,
                label: 'Delete',
                onClick: () => handleDelete(record.id),
                danger: true,
            },
        ],
    });

    const columns = [
        {
            title: 'Designation Name',
            dataIndex: 'designation_name',
            key: 'designation_name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search designation name"
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
                (record.designation_name?.toLowerCase() || '').includes(value.toLowerCase()),
            render: (text) => <span className="text-base">{text}</span>,
          
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
              onFilter: (value, record) => {
                const branch = branchMap[record.branch];
                const branchName = branch?.branchName || '';
                return branchName.toLowerCase().includes(value.toLowerCase());
              },
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
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs(date).format('DD-MM-YYYY'),
            sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
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
                    overlayClassName="designation-actions-dropdown"
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
        <div className="designation-list">
            <Table
                columns={columns}
                dataSource={designations}
                // loading={isLoadingDesignations || isLoadingBranches}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                className="designation-table"
            />
        </div>
    );
};

export default DesignationList; 