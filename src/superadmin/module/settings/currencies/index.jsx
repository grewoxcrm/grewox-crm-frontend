import React, { useState, useEffect } from 'react';
import {
    Card, Typography, Button, Table, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, message, Tag, Tooltip, Space
} from 'antd';
import {
    FiSearch, FiChevronDown,
    FiDownload, FiGrid, FiList, FiHome,
    FiCalendar, FiClock
} from 'react-icons/fi';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useGetAllCurrenciesQuery } from '../services/settingsApi';
import { Link } from 'react-router-dom';
import './currencies.scss';

const { Title, Text } = Typography;

// Date format helper functions
const formatDate = (date) => moment(date).format('MMM DD, YYYY');
const formatDateTime = (date) => moment(date).format('MMM DD, YYYY HH:mm');

const Currencies = () => {
    const [viewMode, setViewMode] = useState('table');
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { data: currencies = [], error, isLoading } = useGetAllCurrenciesQuery({
        page: currentPage,
        limit: 10
    });

    const filteredCurrencies = searchText
        ? currencies.filter(currency =>
            currency.currencyName?.toLowerCase().includes(searchText.toLowerCase()) ||
            currency.currencyCode?.toLowerCase().includes(searchText.toLowerCase()) ||
            currency.currencyIcon?.includes(searchText)
        )
        : currencies;

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const exportMenu = (
        <Menu>
            <Menu.Item key="csv" icon={<FiDownload />} onClick={() => handleExport('csv')}>
                Export as CSV
            </Menu.Item>
            <Menu.Item key="excel" icon={<FiDownload />} onClick={() => handleExport('excel')}>
                Export as Excel
            </Menu.Item>
            <Menu.Item key="pdf" icon={<FiDownload />} onClick={() => handleExport('pdf')}>
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    const handleExport = (type) => {
        try {
            const data = currencies.map(currency => ({
                'Currency Name': currency.currencyName,
                'Currency Code': currency.currencyCode,
                'Currency Symbol': currency.currencyIcon,
                'Created Date': formatDateTime(currency.createdAt),
                'Last Updated': formatDateTime(currency.updatedAt)
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'currencies_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'currencies_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'currencies_export');
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
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
        XLSX.utils.book_append_sheet(wb, ws, 'Currencies');
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

    const columns = [
        {
            title: 'Currency Name',
            dataIndex: 'currencyName',
            key: 'currencyName',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search currency name"
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
                record.currencyName.toLowerCase().includes(value.toLowerCase()) ||
                record.currencyCode?.toLowerCase().includes(value.toLowerCase()),
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Code',
            dataIndex: 'currencyCode',
            key: 'currencyCode',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search currency code"
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
                record.currencyCode.toLowerCase().includes(value.toLowerCase()),   
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Symbol',
            dataIndex: 'currencyIcon',
            key: 'currencyIcon',
            sorter: (a, b) => a.currencyIcon.localeCompare(b.currencyIcon),
            render: (text) => <Text className="currency-symbol">{text}</Text>
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <Tooltip title={formatDateTime(date)}>
                    <div className="date-cell">
                        <FiCalendar className="date-icon" />
                        <Text>{formatDate(date)}</Text>
                    </div>
                </Tooltip>
            ),
            sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => (
                <Tooltip title={formatDateTime(date)}>
                    <div className="date-cell">
                        <FiClock className="date-icon" />
                        <Text>{formatDate(date)}</Text>
                    </div>
                </Tooltip>
            ),
            sorter: (a, b) => moment(a.updatedAt).unix() - moment(b.updatedAt).unix(),
        }
    ];

    if (error) {
        message.error('Failed to load currencies');
    }

    return (
        <div className="currencies-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Settings</Breadcrumb.Item>
                    <Breadcrumb.Item>Currencies</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Currencies</Title>
                    <Text type="secondary">View system currencies</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search currencies..."
                                allowClear
                                onChange={(e) => handleSearch(e.target.value)}
                                value={searchText}
                                className="search-input"
                            />
                            <div className="action-buttons">
                                <Button.Group className="view-toggle">
                                    <Button
                                        type={viewMode === 'table' ? 'primary' : 'default'}
                                        icon={<FiList size={16} />}
                                        onClick={() => setViewMode('table')}
                                    />
                                    <Button
                                        type={viewMode === 'card' ? 'primary' : 'default'}
                                        icon={<FiGrid size={16} />}
                                        onClick={() => setViewMode('card')}
                                    />
                                </Button.Group>
                                <Dropdown overlay={exportMenu} trigger={['click']}>
                                    <Button className="export-button">
                                        <FiDownload size={16} />
                                        <span>Export</span>
                                        <FiChevronDown size={14} />
                                    </Button>
                                </Dropdown>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="currencies-table-card">
                <Table
                    dataSource={filteredCurrencies}
                    columns={columns}
                    loading={isLoading}
                    onChange={handleTableChange}
                    pagination={{
                        current: currentPage,
                        pageSize: 10,
                        total: currencies.length,
                        showSizeChanger: false
                    }}
                    rowKey="id"
                />
            </Card>
        </div>
    );
};

export default Currencies;
