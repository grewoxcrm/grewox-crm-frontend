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

import DealOverview from './overview';
import DealMember from './overview/dealMember';
import DealFiles from './overview/files';

// import DealTasks from './overview/tasks';
import DealInvoices from './overview/invoices';

import DealPayments from './overview/payments';
import DealNotes from './overview/notes';
import DealActivity from './overview/activity';
import './deal.scss';
import { useGetDealsQuery, useUpdateDealMutation } from './services/dealApi';
import DealFollowup from './overview/followup';

const { Title, Text } = Typography;

const DealDetail = () => {
    const { dealId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useGetDealsQuery();
    const [updateDeal] = useUpdateDealMutation();
    
    // Get deals array first
    const deals = Array.isArray(data) ? data : [];
    // Then find the deal
    const deal = deals.find(deal => deal.id === dealId);
    
    // Use useEffect to update currentStatus when deal data changes
    const [currentStatus, setCurrentStatus] = useState('pending');
    
    React.useEffect(() => {
        if (deal?.status) {
            setCurrentStatus(deal.status);
        }
    }, [deal]);

    const handleStatusChange = async (status) => {
        try {
            await updateDeal({
                id: dealId,
                status: status,
                is_won: status === 'won'
            }).unwrap();
            
            setCurrentStatus(status);
            message.success(`Deal status updated to ${status}`);
        } catch (error) {
            message.error('Failed to update deal status');
        }
    };

    // Function to check if buttons should be shown
    const shouldShowStatusButtons = () => {
        // Show buttons only if is_won is null (not yet marked as won or lost)
        return deal?.is_won === null;
    };

    const items = [
        {
            key: 'overview',
            label: (
                <span className="nav-item">
                    <FiBriefcase className="nav-icon" /> Overview
                </span>
            ),
            children: <DealOverview deal={deal} currentStatus={currentStatus} />,
        },
        {
            key: 'members',
            label: (
                <span className="nav-item">
                    <FiUsers className="nav-icon" /> Deal Members
                </span>
            ),
            children: <DealMember deal={deal} />,
        },
        {
            key: 'files',
            label: (
                <span className="nav-item">
                    <FiFile className="nav-icon" /> Files
                </span>
            ),
            children: <DealFiles deal={deal} />,
        },
        // {
        //     key: 'tasks',
        //     label: (
        //         <span>
        //             <FiCheckSquare /> Tasks
        //         </span>
        //     ),
        //     children: <DealTasks deal={deal} />,
        // },
        {
            key: 'invoices',
            label: (
                <span className="nav-item">
                    <FiFileText className="nav-icon" /> Invoices
                </span>
            ),
            children: <DealInvoices deal={deal} />,
        },

        {
            key: 'payments',
            label: (
                <span className="nav-item">
                    <FiCreditCard className="nav-icon" /> Payments
                </span>
            ),
            children: <DealPayments deal={deal} />,
        },
        {
            key: 'notes',
            label: (
                <span className="nav-item">
                    <FiBookmark className="nav-icon" /> Notes
                </span>
            ),
            children: <DealNotes deal={deal} />,
        },
        {
            key: 'activity',
            label: (
                <span className="nav-item">
                    <FiActivity className="nav-icon" /> Activity
                </span>
            ),
            children: <DealActivity deal={deal} />,
        },
        {
            key: 'followup',
            label: (
                <span className="nav-item">
                    <FiActivity className="nav-icon" /> Follow-up
                </span>
            ),
            children: <DealFollowup deal={deal} />,
        },
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
                        <Link to="/dashboard/crm/deals">
                            <FiBriefcase /> Deals
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {deal?.data?.deal_name || 'Deal Details'}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-left">
                    <Title level={2}>{deal?.data?.deal_name || 'Deal Details'}</Title>
                    <Text type="secondary" className="subtitle">
                        Manage deal details and activities
                    </Text>
                </div>
                <div className="header-right">
                    <Space>
                        {shouldShowStatusButtons() && (
                            <>
                                <Button
                                    type="primary"
                                    icon={<FiTarget />}
                                    onClick={() => handleStatusChange('won')}
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
                                    Won
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<FiTarget />}
                                    onClick={() => handleStatusChange('lost')}
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
                                    Lost
                                </Button>
                            </>
                        )}
                        <Button
                            type="primary"
                            icon={<FiArrowLeft />}
                            onClick={() => navigate('/dashboard/crm/deals')}
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
                            Back to Deals
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

export default DealDetail; 