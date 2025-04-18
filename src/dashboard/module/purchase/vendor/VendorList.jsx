import React, { useState } from 'react';
import { Table, Button, Tag, Dropdown, Tooltip, Typography, Modal, Spin, Alert, Menu, Input, Space } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiUser, FiPhone } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetVendorsQuery, useDeleteVendorMutation } from './services/vendorApi';
import { message } from 'antd';
import EditVendor from './EditVendor';

const { Text } = Typography;

const VendorList = ({ onEdit, onDelete, onView, searchText }) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const { data,  isError } = useGetVendorsQuery();
    const [deleteVendor] = useDeleteVendorMutation();

    const vendors = data?.data || [];

    if (isError) {
        return <Alert type="error" message="Failed to fetch vendors" />;
    }

    const handleCancel = () => {
        setIsEditModalVisible(false);
        setSelectedVendorId(null);
        setSelectedVendor(null);
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
                onClick: () => onDelete(record),
                danger: true,
            },
        ],
    });

    const columns = [
        {
            title: 'Vendor Name',
            dataIndex: 'name',
            key: 'name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search vendor name"
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
                record.name.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (name) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiUser style={{ color: '#1890ff' }} />
                    <Text>{name}</Text>
                </div>
            ),
        },
        {
            title: 'Contact',
            dataIndex: 'contact',
            key: 'contact',
            render: (contact) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPhone style={{ color: '#1890ff' }} />
                    <Text>{contact}</Text>
                </div>
            ),
            sorter: (a, b) => (a?.contact || '').localeCompare(b?.contact || ''),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
            sorter: (a, b) => (a?.email || '').localeCompare(b?.email || ''),
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
            sorter: (a, b) => (a?.address || '').localeCompare(b?.address || ''),
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
            sorter: (a, b) => (a?.city || '').localeCompare(b?.city || ''),
        },
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
            sorter: (a, b) => (a?.state || '').localeCompare(b?.state || ''),
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            sorter: (a, b) => (a?.country || '').localeCompare(b?.country || ''),
        },
        {
            title: 'Action',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="vendor-actions-dropdown"
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

    // Filter vendors based on search text
    const filteredVendors = vendors.filter(vendor => 
        vendor.name?.toLowerCase().includes(searchText?.toLowerCase()) ||
        vendor.contact?.toLowerCase().includes(searchText?.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchText?.toLowerCase()) ||
        vendor.address?.toLowerCase().includes(searchText?.toLowerCase()) ||
        vendor.city?.toLowerCase().includes(searchText?.toLowerCase()) ||
        vendor.state?.toLowerCase().includes(searchText?.toLowerCase()) ||
        vendor.country?.toLowerCase().includes(searchText?.toLowerCase())
    );

    return (
        <>
            <div className="vendor-list">
                <Table
                    columns={columns}
                    dataSource={filteredVendors}
                    rowKey="_id"
                    // loading={loading}
                    pagination={{
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} vendors`,
                    }}
                    className="vendor-table"
                />
            </div>

            {/* <EditVendor 
                vendorId={selectedVendorId}
                visible={isEditModalVisible}
                onCancel={handleCancel}
                initialValues={selectedVendor}
            /> */}
        </>
    );
};

export default VendorList;