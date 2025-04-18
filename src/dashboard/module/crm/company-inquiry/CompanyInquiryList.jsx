import React, { useMemo } from 'react';
import { Table, Button, Tooltip, Empty, Typography, Dropdown, Input, Space } from 'antd';
import { FiEdit2, FiEye, FiTrash2, FiMoreVertical } from 'react-icons/fi';

const { Text } = Typography;

const CompanyInquiryList = ({
    loading,
    data = [],
    onEdit,
    onView,
    onDelete,
    searchText
}) => {
    console.log('CompanyInquiryList Data:', data); // Debug log

    const getDropdownItems = (record) => {
        console.log('Record in dropdown:', record); // Debug log
        return {
            items: [
                {
                    key: 'view',
                    icon: <FiEye />,
                    label: 'View Details',
                    onClick: () => onView?.(record),
                },
                {
                    key: 'edit',
                    icon: <FiEdit2 />,
                    label: 'Edit',
                    onClick: () => onEdit?.(record),
                },
                {
                    key: 'delete',
                    icon: <FiTrash2 />,
                    label: 'Delete',
                    onClick: () => {
                        console.log('Delete record:', record); // Debug log
                        onDelete?.(record);
                    },
                    danger: true,
                },
            ],
        };
    };
    console.log(data)
    const columns = [
        {
            title: "Full Name",
            dataIndex: "fullname",
            key: "fullname",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search full name"
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
                record.fullname.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <Text strong style={{ cursor: 'pointer' }} onClick={() => onView?.(record)}>
                    {text || '-'}
                </Text>
            ),
        },
        {
            title: "Business Category",
            dataIndex: "business_category",
            key: "business_category",
            width: 180,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search business category"
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
                record.business_category.toLowerCase().includes(value.toLowerCase()),
            render: (text) => text || '-',
        },
        {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
            width: 150,
            sorter: (a, b) => (a?.phone || '').localeCompare(b?.phone || ''),
            render: (text) => text || '-',
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            width: 300,
            sorter: (a, b) => (a?.description || '').localeCompare(b?.description || ''),
            render: (text) => text || '-',
        },
        {
            title: "Created By",
            dataIndex: "created_by",
            key: "created_by",
            width: 150,
            sorter: (a, b) => (a?.created_by || '').localeCompare(b?.created_by || ''),
            render: (text) => text || '-',
        },
        {
            title: 'Action',
            key: 'actions',
            width: 80,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="company-inquiry-actions-dropdown"
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

    const safeData = Array.isArray(data) ? data : [];

    const filteredData = useMemo(() => {
        if (!searchText) return safeData;

        return safeData.filter((item) => {
            if (!item) return false;

            const searchLower = searchText.toLowerCase();
            return (
                (item.fullname || '').toLowerCase().includes(searchLower) ||
                (item.business_category || '').toLowerCase().includes(searchLower) ||
                (item.phone || '').toLowerCase().includes(searchLower) ||
                (item.description || '').toLowerCase().includes(searchLower)
            );
        });
    }, [safeData, searchText]);

    return (
        <div className="company-inquiry-list">
            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey={(record) => record?._id || record?.id || Math.random().toString()}
                scroll={{ x: 1200 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                }}
                locale={{
                    emptyText: <Empty description="No inquiries found" />
                }}
                className="company-inquiry-table"
            />
        </div>
    );
};

export default CompanyInquiryList;