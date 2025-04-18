import React, { useState, useEffect } from 'react';
import {
    Typography,
    Button,
    Modal,
    message,
    Input,
    Dropdown,
    Menu,
    Row,
    Col,
    Breadcrumb,
    Card,
    Table,
    Pagination
} from 'antd';
import {
    FiPlus,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiGrid,
    FiList,
    FiHome
} from 'react-icons/fi';
import './company.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateCompany from './createCompany';
import CompanyCard from './CompanyCard';
import CompanyList from './CompanyList';
import { useGetAllCompaniesQuery, useDeleteCompanyMutation } from './services/companyApi';
import { Link } from 'react-router-dom';
import EditCompany from './EditCompany';

const { Title, Text } = Typography;

const Company = () => {
    // States
    const [searchText, setSearchText] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    const [currentPage, setCurrentPage] = useState(1);

    const { data: companiesData, isLoading: isLoadingCompanies, refetch } = useGetAllCompaniesQuery();
    const [deleteCompany, { isLoading: isDeleting }] = useDeleteCompanyMutation();

    console.log(companiesData);

    useEffect(() => {
        if (companiesData?.data) {
            const transformedData = companiesData.data.map(company => ({
                id: company.id,
                name: company.username || 'N/A',
                email: company.email || 'N/A',
                phone: company.phone || 'N/A',
                phoneCode: company.phoneCode || '',
                status: company.role_id ? 'active' : 'inactive',
                created_at: company.createdAt || '-',
                firstName: company.firstName || '',
                lastName: company.lastName || '',
                bankname: company.bankname || '',
                ifsc: company.ifsc || '',
                banklocation: company.banklocation || '',
                accountholder: company.accountholder || '',
                accountnumber: company.accountnumber || '',
                gstIn: company.gstIn || '',
                city: company.city || '',
                state: company.state || '',
                website: company.website || '',
                accounttype: company.accounttype || '',
                country: company.country || '',
                zipcode: company.zipcode || '',
                address: company.address || '',
                profilePic: company.profilePic || null
            }));
            setCompanies(transformedData);
            setFilteredCompanies(transformedData);
        }
    }, [companiesData]);

    useEffect(() => {
        const filtered = companies.filter(company =>
            company.name.toLowerCase().includes(searchText.toLowerCase()) ||
            company.email.toLowerCase().includes(searchText.toLowerCase()) ||
            company.phone.includes(searchText) ||
            (company.firstName && company.firstName.toLowerCase().includes(searchText.toLowerCase())) ||
            (company.lastName && company.lastName.toLowerCase().includes(searchText.toLowerCase())) ||
            (company.city && company.city.toLowerCase().includes(searchText.toLowerCase())) ||
            (company.state && company.state.toLowerCase().includes(searchText.toLowerCase())) ||
            (company.gstIn && company.gstIn.toLowerCase().includes(searchText.toLowerCase()))
        );
        setFilteredCompanies(filtered);
    }, [companies, searchText]);

    // Handlers
    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleAddCompany = () => {
        setSelectedCompany(null);
        setIsEditModalVisible(false);
        setIsFormVisible(true);
    };

    const handleEditCompany = (company) => {
        setSelectedCompany(company);
        setIsEditModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Company',
            content: 'Are you sure you want to delete this company?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: {
                padding: '20px',
            },
            onOk: async () => {
                try {
                    await deleteCompany(record.id).unwrap();
                    message.success('Company deleted successfully');
                    refetch();
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete company');
                }
            },
        });
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedCompany) {
                await updateCompany({ id: selectedCompany.id, data: formData }).unwrap();
                message.success('Company updated successfully');
            } else {
                await createCompany(formData).unwrap();
                message.success('Company created successfully');
            }
            setIsFormVisible(false);
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Operation failed');
        }
    };

    // Export functions
    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = companies.map(company => ({
                'Company Name': company.name,
                'Email': company.email,
                'Phone': company.phone,
                'Status': company.status,
                'Created Date': moment(company.created_at).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv': exportToCSV(data, 'companies_export'); break;
                case 'excel': exportToExcel(data, 'companies_export'); break;
                case 'pdf': exportToPDF(data, 'companies_export'); break;
                default: break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
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
        XLSX.utils.book_append_sheet(wb, ws, 'Companies');
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

    return (
        <div className="company-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Company</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Companies</Title>
                    <Text type="secondary">Manage all companies in the system</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search companies..."
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
                                <Button
                                    type="primary"
                                    icon={<FiPlus size={16} />}
                                    onClick={handleAddCompany}
                                    className="add-button"
                                >
                                    Add Company
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="company-table-card">
                {viewMode === 'table' ? (
                    <CompanyList
                        companies={filteredCompanies}
                        loading={isLoadingCompanies || isDeleting}
                        onEdit={handleEditCompany}
                        onDelete={handleDelete}
                    />
                ) : (
                    <Row gutter={[16, 16]} className="company-cards-grid">
                        {filteredCompanies
                            .slice((currentPage - 1) * 10, currentPage * 10)
                            .map(company => (
                                <Col xs={24} sm={12} md={8} lg={6} key={company.id}>
                                    <CompanyCard
                                        company={company}
                                        onEdit={handleEditCompany}
                                        onDelete={handleDelete}
                                    />
                                </Col>
                            ))}
                        {filteredCompanies.length > 10 && (
                            <Col span={24} style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                                <Pagination
                                    current={currentPage}
                                    pageSize={10}
                                    total={filteredCompanies.length}
                                    showSizeChanger={false}
                                    showQuickJumper={false}
                                    onChange={(page) => setCurrentPage(page)}
                                />
                            </Col>
                        )}
                    </Row>
                )}
            </Card>

            <CreateCompany
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                initialValues={selectedCompany}
                loading={isLoadingCompanies || isDeleting}
            />

            <EditCompany
                visible={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setSelectedCompany(null);
                }}
                initialValues={selectedCompany}
                loading={isLoadingCompanies}
            />
        </div>
    );
};

export default Company;
