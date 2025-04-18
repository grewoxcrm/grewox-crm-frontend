import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Tabs, Breadcrumb, Button, Typography, Space, message } from 'antd';
import {
    FiArrowLeft, FiHome, FiBriefcase, FiUsers, FiFile,
    FiFlag, FiCheckSquare, FiFileText, FiDollarSign,
    FiCreditCard, FiBookmark, FiActivity,
    FiCheck,
    FiX,
    FiTarget
} from 'react-icons/fi';

import CompanyOverview from './overview/index';
import CompanyDealList from './overview/companydeals';
import CompanyContactList from './overview/companycontacts';
// import CompanyContacts from './overview/contacts';
// import CompanyFiles from './overview/files';
// import CompanyInvoices from './overview/invoices';
// import CompanyPayments from './overview/payments';
// import CompanyNotes from './overview/notes';
// import CompanyActivity from './overview/activity';
import './companyaccount.scss';
import { useGetCompanyAccountsQuery, useUpdateCompanyAccountMutation } from './services/companyAccountApi';

const { Title, Text } = Typography;

const CompanyAccountDetails = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useGetCompanyAccountsQuery();
    const [updateCompanyAccount] = useUpdateCompanyAccountMutation();

    // Get companies array first
    const companies = data && Array.isArray(data.data) ? data.data : [];
    // Then find the company
    const company = companies.find(company => company.id === accountId);

    // Use useEffect to update currentStatus when company data changes
    const [currentStatus, setCurrentStatus] = useState('active');
    
    React.useEffect(() => {
        if (company?.status) {
            setCurrentStatus(company.status);
        }
    }, [company]);

    const handleStatusChange = async (status) => {
        try {
            await updateCompanyAccount({
                id: accountId,
                status: status
            }).unwrap();
            
            setCurrentStatus(status);
            message.success(`Company status updated to ${status}`);
        } catch (error) {
            message.error('Failed to update company status');
        }
    };

    const items = [
        {
            key: 'overview',
            label: (
                <span className="nav-item">
                    <FiBriefcase className="nav-icon" /> Overview
                </span>
            ),
            children: <CompanyOverview company={company} currentStatus={currentStatus} />,
        },
        {
            key: 'companydeals',
            label: (
                <span className="nav-item">
                    <FiBriefcase className="nav-icon" /> Company Deals
                </span>
            ),
            children: <CompanyDealList company={company} currentStatus={currentStatus} />,
        },
        {
            key: 'contacts',
            label: (
                <span className="nav-item">
                    <FiUsers className="nav-icon" /> Company Contacts
                </span>
            ),
            children: <CompanyContactList company={company} />,
        },
        // {
        //     key: 'files',
        //     label: (
        //         <span className="nav-item">
        //             <FiFile className="nav-icon" /> Files
        //         </span>
        //     ),
        //     children: <CompanyFiles company={company} />,
        // },
        // {
        //     key: 'invoices',
        //     label: (
        //         <span className="nav-item">
        //             <FiFileText className="nav-icon" /> Invoices
        //         </span>
        //     ),
        //     children: <CompanyInvoices company={company} />,
        // },
        // {
        //     key: 'payments',
        //     label: (
        //         <span className="nav-item">
        //             <FiCreditCard className="nav-icon" /> Payments
        //         </span>
        //     ),
        //     children: <CompanyPayments company={company} />,
        // },
        // {
        //     key: 'notes',
        //     label: (
        //         <span className="nav-item">
        //             <FiBookmark className="nav-icon" /> Notes
        //         </span>
        //     ),
        //     children: <CompanyNotes company={company} />,
        // },
        // {
        //     key: 'activity',
        //     label: (
        //         <span className="nav-item">
        //             <FiActivity className="nav-icon" /> Activity
        //         </span>
        //     ),
        //     children: <CompanyActivity company={company} />,
        // },
    ];

    return (
        <div className="project-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome /> Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/crm/company-account">
                            <FiBriefcase /> Companies
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {company?.company_name || 'Company Details'}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-left">
                    <Title level={2}>{company?.company_name || 'Company Details'}</Title>
                    <Text type="secondary" className="subtitle">
                        Manage company details and activities
                    </Text>
                </div>
                <div className="header-right">
                    <Space>
                        {/* <Button
                            type="primary"
                            icon={<FiTarget />}
                            onClick={() => handleStatusChange('active')}
                            style={{
                                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                border: 'none',
                                height: '44px',
                                padding: '0 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '10px',
                                fontWeight: '500'
                            }}
                        >
                            Set Active
                        </Button>
                        <Button
                            type="primary"
                            icon={<FiTarget />}
                            onClick={() => handleStatusChange('inactive')}
                            style={{
                                background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                                border: 'none',
                                height: '44px',
                                padding: '0 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '10px',
                                fontWeight: '500'
                            }}
                        >
                            Set Inactive
                        </Button> */}
                        <Button
                            type="primary"
                            icon={<FiArrowLeft />}
                            onClick={() => navigate('/dashboard/crm/company-account')}
                            style={{
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                border: 'none',
                                height: '44px',
                                padding: '0 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '10px',
                                fontWeight: '500'
                            }}
                        >
                            Back to Companies
                        </Button>
                    </Space>
                </div>
            </div>

            <Card loading={isLoading}>
                <Tabs
                    defaultActiveKey="overview"
                    items={items}
                    className="project-tabs"
                    type="card"
                    size="large"
                    animated={{ inkBar: true, tabPane: true }}
                />
            </Card>
        </div>
    );
};

export default CompanyAccountDetails; 