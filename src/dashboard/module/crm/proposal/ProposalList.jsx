import React, { useCallback, useState, useEffect } from 'react';
import { Table, Tag, Dropdown, Button, message, Space, Tooltip, Popconfirm, Input, DatePicker } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye, FiFileText, FiDollarSign, FiCalendar } from 'react-icons/fi';
import moment from 'moment';
import dayjs from 'dayjs';
import EditProposal from './EditProposal';
import { useGetLeadsQuery } from '../lead/services/LeadApi';
import './proposal.scss';

const ProposalList = ({ proposals, onDelete, onView, loading, onProposalUpdated }) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const { data: leadsResponse = {}, isLoading: leadsLoading } = useGetLeadsQuery({});

    // Extract leads from response data
    const leads = leadsResponse.data || [];

    // Create a map of lead IDs to lead titles for quick lookup
    const leadTitleMap = React.useMemo(() => {
        const map = new Map();
        leads.forEach(lead => {
            map.set(lead.id, lead.leadTitle || `Lead #${lead.id}`);
        });
        return map;
    }, [leads]);

    const handleEdit = (record) => {
        setSelectedProposal(record);
        setEditModalVisible(true);
    };

    const handleEditSuccess = () => {
        setEditModalVisible(false);
        setSelectedProposal(null);
        if (onProposalUpdated) {
            onProposalUpdated();
        }
        message.success('Proposal updated successfully');
    };

    // Function to get menu items for each row
    const getActionItems = (record) => [
        {
            key: 'edit',
            icon: <FiEdit2 style={{ fontSize: '16px' }} />,
            label: 'Edit',
            onClick: () => handleEdit(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 style={{ fontSize: '16px', color: '#ff4d4f' }} />,
            label: 'Delete',
            danger: true,
            onClick: () => onDelete?.(record)
        }
    ];

    const columns = [
        {
            title: 'Lead Title',
            dataIndex: 'lead_title',
            key: 'lead_title',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search lead title"
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
                record.lead_title.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (leadId) => {
                const leadTitle = leadTitleMap.get(leadId);
                return (
                    <div className="lead-title">
                        <Tooltip title={leadTitle || 'Lead not found'}>
                            <span>{leadTitle || 'Lead not found'}</span>
                        </Tooltip>
                    </div>
                );
            }
        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'subtotal',
            sorter: (a, b) => (a?.subtotal || '').localeCompare(b?.subtotal || ''),
            render: (amount) => (
                <span> ₹ {parseFloat(amount).toFixed(2)}</span>
            )
        },
        {
            title: 'Tax',
            dataIndex: 'tax',
            key: 'tax',
            sorter: (a, b) => (a?.tax || '').localeCompare(b?.tax || ''),
            render: (amount) => (
                <span> ₹ {parseFloat(amount).toFixed(2)}</span>
            )
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
            sorter: (a, b) => (a?.discount || '').localeCompare(b?.discount || ''),
            render: (amount) => (
                <span> ₹ {parseFloat(amount).toFixed(2)}</span>
            )
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (amount) => (
                <div className="proposal-amount">
                    <span> ₹ {parseFloat(amount).toFixed(2)}</span>
                </div>
            )
        },
        {
            title: 'Valid Till',
            dataIndex: 'valid_till',
            key: 'valid_till',
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
                if (!value || !record.valid_till) return false;
                return dayjs(record.valid_till).format('YYYY-MM-DD') === value;
            },
            filterIcon: filtered => (
                <FiCalendar style={{ color: filtered ? '#1890ff' : undefined }} />
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    menu={{ items: getActionItems(record) }}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayStyle={{ minWidth: '150px' }}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical style={{ fontSize: '18px' }} />}
                        style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f2f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    />
                </Dropdown>
            )
        }
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={proposals}
                rowKey="id"
                scroll={{ x: 1300 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} proposals`
                }}
                className="proposals-table"
            />

            <EditProposal
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setSelectedProposal(null);
                }}
                initialValues={selectedProposal}
                onSuccess={handleEditSuccess}
            />
        </>
    );
};

export default ProposalList;
