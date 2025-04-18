import React from 'react';
import { Table, Avatar, Dropdown, Button, Tag } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiUser, FiMoreVertical } from 'react-icons/fi';

const ProjectList = ({ projects = [], loading, onEdit, onDelete, onView, searchText }) => {
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
                onClick: () => onDelete(record),
                danger: true,
            },
        ],
    });

    const columns = [
        {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
            sorter: (a, b) => a.project_name.localeCompare(b.project_name)
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate)
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.endDate) - new Date(b.endDate)
        },
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
            render: (budget) => `$${budget.toLocaleString()}`,
            sorter: (a, b) => a.budget - b.budget
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={
                    status === 'completed' ? 'success' :
                        status === 'in-progress' ? 'processing' :
                            'warning'
                }>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="project-actions-dropdown"
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

    const filteredProjects = projects?.filter(project =>
        project.project_name?.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

    return (
        <Table
            columns={columns}
            dataSource={filteredProjects}
            rowKey="id"
            loading={loading}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
            }}
            className="project-table"
        />
    );
};

export default ProjectList; 