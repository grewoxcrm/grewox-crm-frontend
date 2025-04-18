import React, { useState, useEffect, useMemo } from 'react';
import {
    Card, Typography, Button, Modal, Input, Avatar,
    Dropdown, Menu, Row, Col, Breadcrumb, Table, Descriptions, Tooltip, message, Space
} from 'antd';
import {
    FiPlus, FiSearch, FiMessageSquare,
    FiChevronDown, FiDownload,
    FiHome, FiMail, FiPhone, FiCalendar,
    FiEdit2, FiTrash2, FiEye, FiX, FiCheckCircle,
    FiBook, FiMoreVertical, FiBookmark
} from 'react-icons/fi';
import './inquary.scss';
import { Link } from 'react-router-dom';
import CreateInquaryModal from './CreateInquaryModal';
import { useGetAllInquiriesQuery, useDeleteInquiryMutation } from './services/inquaryApi';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { Title, Text } = Typography;

const formatDate = (date) => moment(date).format('MMM DD, YYYY');
const formatDateTime = (date) => moment(date).format('MMM DD, YYYY HH:mm');

const Inquiry = () => {
    const [searchText, setSearchText] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: inquiriesData, isLoading, refetch } = useGetAllInquiriesQuery();
    const [deleteInquiryMutation, { isLoading: isDeleting }] = useDeleteInquiryMutation();

    // Add the filtering logic using useMemo to avoid unnecessary recalculations
    const filteredInquiries = useMemo(() => {
        if (!inquiriesData?.data) return [];
        if (!searchText.trim()) return inquiriesData.data;

        const searchLower = searchText.toLowerCase().trim();
        return inquiriesData.data.filter(inquiry => {
            return (
                (inquiry.name && inquiry.name.toLowerCase().includes(searchLower)) ||
                (inquiry.email && inquiry.email.toLowerCase().includes(searchLower)) ||
                (inquiry.phone && inquiry.phone.toLowerCase().includes(searchLower)) ||
                (inquiry.subject && inquiry.subject.toLowerCase().includes(searchLower)) ||
                (inquiry.message && inquiry.message.toLowerCase().includes(searchLower))
            );
        });
    }, [inquiriesData?.data, searchText]);

    const handleEdit = (inquiry) => {
        setSelectedInquiry(inquiry);
        setIsFormVisible(true);
    };

    const handleDelete = async (inquiry) => {
        try {
            await deleteInquiryMutation(inquiry.id).unwrap();
            message.success('Inquiry deleted successfully');
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to delete inquiry');
        }
    };

    const handleView = (inquiry) => {
        setSelectedInquiry(inquiry);
        setIsViewModalVisible(true);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search name"
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
           
            render: (text) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Avatar style={{
                        backgroundColor: '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {text[0].toUpperCase()}
                    </Avatar>
                    <span style={{ fontWeight: '500' }}>{text}</span>
                </div>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),

            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiMail style={{ color: '#1890ff' }} />
                    <a href={`mailto:${text}`} style={{ color: '#1890ff' }}>{text}</a>
                </div>
            )
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            sorter: (a, b) => (a.phone || '').localeCompare(b.phone || ''),
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPhone style={{ color: '#52c41a' }} />
                    <span>{text}</span>
                </div>
            )
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            sorter: (a, b) => (a.subject || '').localeCompare(b.subject || ''),
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBookmark style={{ color: '#722ed1' }} />
                    <span style={{ fontWeight: '500' }}>{text}</span>
                </div>
            )
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            ellipsis: true,
            sorter: (a, b) => (a.message || '').localeCompare(b.message || ''),
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiMessageSquare style={{ color: '#faad14' }} />
                    <span style={{ color: '#666' }}>{text}</span>
                </div>
            )
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
            render: (date) => (
                <Tooltip title={formatDateTime(date)}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#f5f5f5',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        width: 'fit-content'
                    }}>
                        <FiCalendar style={{ color: '#1890ff' }} />
                        <span>{formatDate(date)}</span>
                    </div>
                </Tooltip>
            ),
            sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'view',
                                label: 'View Details',
                                icon: <FiEye style={{ color: '#1890ff' }} />,
                                onClick: () => handleView(record)
                            },
                            {
                                key: 'edit',
                                label: 'Edit',
                                icon: <FiEdit2 style={{ color: '#52c41a' }} />,
                                onClick: () => handleEdit(record)
                            },
                            {
                                key: 'delete',
                                label: 'Delete',
                                icon: <FiTrash2 style={{ color: '#ff4d4f' }} />,
                                danger: true,
                                onClick: () => handleDelete(record)
                            }
                        ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical style={{ fontSize: '16px' }} />}
                        className="action-btn"
                    />
                </Dropdown>
            )
        }
    ];

    const exportMenuItems = {
        items: [
            {
                key: 'csv',
                icon: <FiDownload />,
                label: 'Export as CSV',
                onClick: () => handleExport('csv')
            },
            {
                key: 'excel',
                icon: <FiDownload />,
                label: 'Export as Excel',
                onClick: () => handleExport('excel')
            },
            {
                key: 'pdf',
                icon: <FiDownload />,
                label: 'Export as PDF',
                onClick: () => handleExport('pdf')
            }
        ]
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            if (!filteredInquiries || filteredInquiries.length === 0) {
                message.warning('No data to export');
                return;
            }

            const data = filteredInquiries.map(inquiry => ({
                'Name': inquiry.name || 'N/A',
                'Email': inquiry.email || 'N/A',
                'Phone': inquiry.phone || 'N/A',
                'Subject': inquiry.subject || 'N/A',
                'Message': inquiry.message || 'N/A',
                'Created Date': moment(inquiry.createdAt).format('DD-MM-YYYY') || 'N/A'
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'inquiries_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'inquiries_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'inquiries_export');
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            console.error('Export error:', error);
            message.error(`Failed to export: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data, filename) => {
        const csvContent = [
            Object.keys(data[0]).join(','),
            ...data.map(item => Object.values(item).map(value => 
                `"${value?.toString().replace(/"/g, '""')}"`
            ).join(','))
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
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inquiries');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 }
        });
        doc.save(`${filename}.pdf`);
    };

    return (
        <div className="inquiry-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Inquiry</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Inquiries</Title>
                    <Text type="secondary">Manage all inquiries in the system</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search inquiries..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="search-input"
                            />
                            <div className="action-buttons">
                                <Dropdown 
                                    menu={exportMenuItems}
                                    trigger={['click']}
                                    disabled={loading || !filteredInquiries?.length}
                                >
                                    <Button className="export-button" loading={loading}>
                                        <FiDownload size={16} />
                                        <span>Export</span>
                                        <FiChevronDown size={14} />
                                    </Button>
                                </Dropdown>
                                <Button
                                    type="primary"
                                    icon={<FiPlus size={16} />}
                                    onClick={() => setIsFormVisible(true)}
                                    className="add-button"
                                >
                                    Add Inquiry
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card
                className="inquiry-table-card"
                bodyStyle={{
                    padding: 0,
                    borderRadius: '0 0 8px 8px'
                }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredInquiries}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                        showQuickJumper: false
                    }}
                    className="colorful-table"
                />
            </Card>

            <CreateInquaryModal
                open={isFormVisible}
                onCancel={() => {
                    setIsFormVisible(false);
                    setSelectedInquiry(null);
                }}
                onSubmit={() => {
                    setIsFormVisible(false);
                    setSelectedInquiry(null);
                    refetch();
                }}
                isEditing={!!selectedInquiry}
                initialValues={selectedInquiry}
                loading={isLoading}
            />

            <Modal
                title="Delete Inquiry"
                open={isDeleteModalVisible}
                onOk={async () => {
                    try {
                        await deleteInquiryMutation(selectedInquiry.id).unwrap();
                    } catch (error) {
                        Modal.error({
                            title: 'Error',
                            content: error?.data?.message || 'Something went wrong while deleting the inquiry.'
                        });
                    } finally {
                        setIsDeleteModalVisible(false);
                        setSelectedInquiry(null);
                    }
                }}
                confirmLoading={isDeleting}
                onCancel={() => {
                    setIsDeleteModalVisible(false);
                    setSelectedInquiry(null);
                }}
                okText="Delete"
                okButtonProps={{
                    danger: true
                }}
            >
                <p>Are you sure you want to delete this inquiry?</p>
                <p>This action cannot be undone.</p>
            </Modal>

            {/* Inquiry Details Modal */}
            <Modal
                title={null}
                open={isViewModalVisible && selectedInquiry}
                onCancel={() => setIsViewModalVisible(false)}
                footer={null}
                width={700}
                className="inquiry-details-modal"
                closeIcon={null}
                styles={{
                    body: { padding: 0 }
                }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    position: 'relative'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FiMessageSquare style={{ fontSize: '24px', color: '#fff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#fff'
                        }}>
                            Inquiry Details
                        </h2>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                            View detailed inquiry information
                        </Text>
                    </div>
                    <Button
                        type="text"
                        icon={<FiX />}
                        onClick={() => setIsViewModalVisible(false)}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            color: '#fff',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none'
                        }}
                    />
                </div>

                {selectedInquiry && (
                    <div style={{ padding: '24px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '20px',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Avatar size={64} style={{ backgroundColor: '#1890ff' }}>
                                    {selectedInquiry.name ? selectedInquiry.name[0].toUpperCase() : '?'}
                                </Avatar>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                                        {selectedInquiry.name}
                                    </h3>
                                    {selectedInquiry.status && (
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            background: selectedInquiry.status === 'pending' ? '#fff7e6' : '#f6ffed',
                                            color: selectedInquiry.status === 'pending' ? '#fa8c16' : '#52c41a',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            <FiCheckCircle style={{ marginRight: '4px' }} />
                                            {selectedInquiry.status.charAt(0).toUpperCase() + selectedInquiry.status.slice(1)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Descriptions bordered column={1} style={{ marginBottom: '24px' }}>
                            <Descriptions.Item
                                label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMail /> Email</span>}
                            >
                                <a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiPhone /> Phone</span>}
                            >
                                {selectedInquiry.phone}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiBook /> Subject</span>}
                            >
                                {selectedInquiry.subject}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMessageSquare /> Message</span>}
                            >
                                <div>
                                    {selectedInquiry.message}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCalendar /> Created At</span>}
                            >
                                {selectedInquiry.createdAt ? moment(selectedInquiry.createdAt).format('MMMM DD, YYYY') : 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <Button
                                icon={<FiEdit2 />}
                                onClick={() => {
                                    setIsViewModalVisible(false);
                                    handleEdit(selectedInquiry);
                                }}
                                style={{
                                    height: '40px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                Edit Inquiry
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => setIsViewModalVisible(false)}
                                style={{
                                    height: '40px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Inquiry;
