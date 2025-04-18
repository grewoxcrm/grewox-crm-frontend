import React, { useState } from 'react';
import { Table, Button, Dropdown, Menu, Tag, Modal, Input, Space, DatePicker } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye, FiCalendar } from 'react-icons/fi';
import { useGetVendorsQuery } from './services/billingApi';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import ViewBilling from './ViewBilling';
import dayjs from 'dayjs';

const BillingList = ({ billings, onEdit, onDelete, searchText, loading }) => {
    // Fetch vendors data
    const { data: vendorsData } = useGetVendorsQuery();

    const { data: currenciesData } = useGetAllCurrenciesQuery({});

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    // Create a map of vendor IDs to vendor names
    const vendorMap = React.useMemo(() => {
        if (!vendorsData?.data) return {};
        return vendorsData.data.reduce((acc, vendor) => {
            acc[vendor.id] = vendor.name;
            return acc;
        }, {});
    }, [vendorsData]);

    const statuses = [
        { id: 'paid', name: 'Paid' },
        { id: 'pending', name: 'Pending' },
        { id: 'overdue', name: 'Overdue' },
        { id: 'cancelled', name: 'Cancelled' },
    ];

    // Create a map of currency IDs/codes to currency icons
    const currencyMap = React.useMemo(() => {
        if (!currenciesData) return {};
        return currenciesData.reduce((acc, currency) => {
            acc[currency.id] = currency.currencyIcon;
            acc[currency.currencyCode] = currency.currencyIcon; // Also map by code
            return acc;
        }, {});
    }, [currenciesData]);

    const columns = [
        {
            title: 'Bill Number',
            dataIndex: 'billNumber',
            key: 'billNumber',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search bill number"
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
                record.billNumber.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <a 
                    onClick={() => handleViewBilling(record)}
                    style={{ 
                        color: '#1890ff',
                        fontWeight: '500',
                        cursor: 'pointer',
                        '&:hover': {
                            textDecoration: 'underline'
                        }
                    }}
                >
                    {text}
                </a>
            ),
        },
        {
            title: 'Vendor',
            dataIndex: 'vendor',
            key: 'vendor',
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
                record.vendor.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (vendorId) => {
                const vendorName = vendorMap[vendorId] || 'Unknown Vendor';
                return <span>{vendorName}</span>;
            }
        },
        {
            title: 'Bill Date',
            dataIndex: 'billDate',
            key: 'billDate',
            render: (date) => dayjs(date).format('DD-MM-YYYY'),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <DatePicker
                        value={selectedKeys[0] ? dayjs(selectedKeys[0]) : null}
                        onChange={(date) => {
                            const dateStr = date ? date.format('YYYY-MM-DD') : null;
                            setSelectedKeys(dateStr ? [dateStr] : []);
                        }}
                        style={{ marginBottom: 8, display: 'block' }}
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
                        <Button
                            onClick={() => clearFilters()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => {
                if (!value || !record.billDate) return false;
                return dayjs(record.billDate).format('YYYY-MM-DD') === value;
            },
            filterIcon: filtered => (
                <FiCalendar style={{ color: filtered ? '#1890ff' : undefined }} />
            )
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            sorter: (a, b) => a.total - b.total,
            render: (amount, record) => {
                const currencyIcon = currencyMap[record.currency] || '₹';
                return (
                    <span style={{ fontWeight: '500', color: '#1890ff' }}>
                        {currencyIcon}{Number(amount).toLocaleString()}
                    </span>
                );
            },
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount, record) => {
                const currencyIcon = currencyMap[record.currency] || '₹';
                return (
                    <span style={{ fontWeight: '500', color: '#1890ff' }}>
                        {currencyIcon}{Number(amount).toLocaleString()}
                    </span>
                );
            },
        },

        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: statuses.map(status => ({
                text: status.name,
                value: status.id
              })),
              onFilter: (value, record) => record.status === value,
            render: (status) => {
                let color = 'default';
                switch (status?.toLowerCase()) {
                    case 'paid':
                        color = 'success';
                        break;
                    case 'pending':
                        color = 'warning';
                        break;
                    case 'overdue':
                        color = 'error';
                        break;
                    default:
                        color = 'default';
                }
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item 
                                key="view" 
                                icon={<FiEye />}
                                onClick={() => handleViewBilling(record)}
                            >
                                View Billing
                            </Menu.Item>
                            <Menu.Item 
                                key="edit" 
                                icon={<FiEdit2 />}
                                onClick={() => onEdit(record)}
                            >
                                Edit Billing
                            </Menu.Item>
                            <Menu.Item 
                                key="delete" 
                                icon={<FiTrash2 />}
                                danger
                                onClick={() => onDelete(record)}
                            >
                                Delete Billing
                            </Menu.Item>
                        </Menu>
                    }
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button 
                        type="text" 
                        icon={<FiMoreVertical />}
                        style={{ padding: 4 }}
                    />
                </Dropdown>
            ),
        },
    ];

    // Filter billings based on search text
    const filteredBillings = billings?.filter(bill => 
        bill.billNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
        vendorMap[bill.vendor]?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleViewBilling = (record) => {
        setSelectedBill(record);
        setIsModalVisible(true);
    };

    return (
        <>
            <Table
                columns={columns}
                dataSource={filteredBillings}
                rowKey="id"
                scroll={{ x: 1300 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
            />

            <Modal
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setSelectedBill(null);
                }}
                width={800}
                footer={null}
                styles={{
                    body: {
                        marginTop: '15px',
                        padding: '40px',
                        height: '100%',
                        borderRadius: '100%',
                        width: '100%',
                        fontFamily: "'Segoe UI', sans-serif"
                    }
                }}

            >
                {selectedBill && <ViewBilling data={selectedBill} />}
            </Modal>
        </>
    );
};

export default BillingList;