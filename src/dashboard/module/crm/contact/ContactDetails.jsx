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

import ContactOverview from './overview/index';
import ContactDealList from './overview/contactdeals/index';
// import ContactFiles from './overview/files';
// import ContactInvoices from './overview/invoices';
// import ContactPayments from './overview/payments';
// import ContactNotes from './overview/notes';
// import ContactActivity from './overview/activity';
import './contact.scss';
import { useGetContactsQuery, useUpdateContactMutation } from './services/contactApi';

const { Title, Text } = Typography;

const ContactDetails = () => {
    const { contactId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useGetContactsQuery();
    const [updateContact] = useUpdateContactMutation();

    const contacts = data && Array.isArray(data.data) ? data.data : [];
    const contact = contacts.find(contact => contact.id === contactId);

    const [currentStatus, setCurrentStatus] = useState('active');
    
    React.useEffect(() => {
        if (contact?.status) {
            setCurrentStatus(contact.status);
        }
    }, [contact]);

    const handleStatusChange = async (status) => {
        try {
            await updateContact({
                id: contactId,
                status: status
            }).unwrap();
            
            setCurrentStatus(status);
            message.success(`Contact status updated to ${status}`);
        } catch (error) {
            message.error('Failed to update contact status');
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
            children: <ContactOverview contact={contact} currentStatus={currentStatus} />,
        },
        {
            key: 'contactdeals',
            label: (
                <span className="nav-item">
                    <FiBriefcase className="nav-icon" /> Contact Deals
                </span>
            ),
            children: <ContactDealList contact={contact} currentStatus={currentStatus} />,
        },
    //     {
    //         key: 'files',
    //         label: (
    //             <span className="nav-item">
    //                 <FiFile className="nav-icon" /> Files
    //             </span>
    //         ),
    //         children: <ContactFiles contact={contact} />,
    //     },
    //     {
    //         key: 'invoices',
    //         label: (
    //             <span className="nav-item">
    //                 <FiFileText className="nav-icon" /> Invoices
    //             </span>
    //         ),
    //         children: <ContactInvoices contact={contact} />,
    //     },
    //     {
    //         key: 'payments',
    //         label: (
    //             <span className="nav-item">
    //                 <FiCreditCard className="nav-icon" /> Payments
    //             </span>
    //         ),
    //         children: <ContactPayments contact={contact} />,
    //     },
    //     {
    //         key: 'notes',
    //         label: (
    //             <span className="nav-item">
    //                 <FiBookmark className="nav-icon" /> Notes
    //             </span>
    //         ),
    //         children: <ContactNotes contact={contact} />,
    //     },
    //     {
    //         key: 'activity',
    //         label: (
    //             <span className="nav-item">
    //                 <FiActivity className="nav-icon" /> Activity
    //             </span>
    //         ),
    //         children: <ContactActivity contact={contact} />,
    //     },
    ];

    return (
        <div className="contact-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome /> Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/crm/contact">
                            <FiUsers /> Contacts
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {contact?.name || 'Contact Details'}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-left">
                    <Title level={2}>{contact?.name || 'Contact Details'}</Title>
                    <Text type="secondary" className="subtitle">
                        Manage contact details and activities
                    </Text>
                </div>
                <div className="header-right">
                    <Space>
                       
                        <Button
                            type="primary"
                            icon={<FiArrowLeft />}
                            onClick={() => navigate('/dashboard/crm/contact')}
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
                            Back to Contacts
                        </Button>
                    </Space>
                </div>
            </div>

            <Card loading={isLoading}>
                <Tabs
                    defaultActiveKey="overview"
                    items={items}
                    className="contact-tabs"
                    type="card"
                    size="large"
                    animated={{ inkBar: true, tabPane: true }}
                />
            </Card>
        </div>
    );
};

export default ContactDetails;