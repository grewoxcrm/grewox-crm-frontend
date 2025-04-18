import React, { useState } from 'react';
import { Card, Button, Dropdown, Avatar, Typography, Modal, Descriptions, message, Tag } from 'antd';
import {
    FiEye,
    FiEdit2,
    FiTrash2,
    FiMail,
    FiArrowUp,
    FiMoreVertical,
    FiPhone,
    FiCheckCircle,
    FiXCircle,
    FiMapPin,
    FiBriefcase,
    FiX,
    FiLogIn,
} from 'react-icons/fi';
import moment from 'moment';
import EditCompany from './EditCompany';
import { useAdminLoginMutation } from '../../../auth/services/authApi';
import { useNavigate } from 'react-router-dom';
import { PiRocketBold } from 'react-icons/pi';
import CreateUpgradePlan from './CreateUpgradePlan';
import { useGetAllAssignedPlansQuery } from './services/companyApi';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CompanyCard = ({ company, onView, onEdit, onDelete, onUpgrade, onEmailUpdate }) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
    const [adminLogin] = useAdminLoginMutation();
    const navigate = useNavigate();

    // Fetch all assigned plans
    const { data: assignedPlans } = useGetAllAssignedPlansQuery();

    // Check if company has active subscription
    const activeSubscription = React.useMemo(() => {
        if (!assignedPlans?.data) return null;
        return assignedPlans.data.find(
            sub => sub.client_id === company.id && sub.status !== 'cancelled'
        );
    }, [assignedPlans, company.id]);

    // Update the status configuration
    const getStatusStyles = (isActive) => ({
        active: {
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            color: '#15803d',
            border: '1px solid #86efac',
            boxShadow: '0 2px 4px rgba(22, 101, 52, 0.1)',
            icon: <CheckCircleOutlined style={{
                fontSize: '12px',
                color: '#16a34a',
                filter: 'drop-shadow(0 1px 1px rgba(22, 101, 52, 0.1))'
            }} />,
            hover: {
                background: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
                boxShadow: '0 4px 6px rgba(22, 101, 52, 0.15)'
            }
        },
        inactive: {
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            boxShadow: '0 2px 4px rgba(153, 27, 27, 0.1)',
            icon: <CloseCircleOutlined style={{
                fontSize: '12px',
                color: '#dc2626',
                filter: 'drop-shadow(0 1px 1px rgba(153, 27, 27, 0.1))'
            }} />,
            hover: {
                background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                boxShadow: '0 4px 6px rgba(153, 27, 27, 0.15)'
            }
        }
    })[isActive ? 'active' : 'inactive'];

    const statusStyle = getStatusStyles(!!activeSubscription);

    const handleEdit = () => {
        setEditModalVisible(true);
    };

    const handleEditCancel = () => {
        setEditModalVisible(false);
    };

    const handleAdminLogin = async () => {
        try {
            const response = await adminLogin({
                email: company.email,
                isClientPage: true
            }).unwrap();

            if (response.success) {
                message.success('Logged in as company successfully');
                // Force reload to update the app state with new user
                navigate('/dashboard');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to login as company');
        }
    };

    const handleUpgradeModalClose = () => {
        setUpgradeModalVisible(false);
    };

    // Menu items for the dropdown
    const actionItems = [
        {
            key: 'view',
            icon: <FiEye />,
            label: 'View Details',
            onClick: () => setDetailsModalVisible(true)
        },
        {
            key: 'edit',
            icon: <FiEdit2 />,
            label: 'Edit Company',
            onClick: handleEdit
        },
        {
            key: 'login',
            icon: <FiLogIn />,
            label: 'Login as Company',
            onClick: handleAdminLogin
        },
        {
            key: 'upgrade',
            icon: <PiRocketBold />,
            label: 'Upgrade Plan',
            onClick: () => setUpgradeModalVisible(true)
        },
        {
            type: 'divider'
        },
        {
            key: 'delete',
            icon: <FiTrash2 />,
            label: 'Delete Company',
            danger: true,
            onClick: () => onDelete(company)
        }
    ];

    return (
        <>
            <Card
                className="company-card"
                hoverable
                bodyStyle={{ padding: 0 }}
                style={{
                    width: '320px',
                    minWidth: '300px',
                    maxWidth: '100%',
                    height: '100%',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: 'none',
                    background: '#FFFFFF',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    margin: '12px',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(59, 130, 246, 0.15)'
                    }
                }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                    padding: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '110px'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.3
                    }} />

                    <div className="ant-card-extra" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px' 
                    }}>
                       
                        
                       <Dropdown
                        menu={{
                            items: actionItems,
                            style: {
                                borderRadius: '12px',
                                padding: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical style={{ fontSize: '18px' }} />}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '12px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '10px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(8px)',
                                border: 'none',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        />
                    </Dropdown>
                    </div>
                </div>

                <div style={{
                    marginTop: '-50px',
                    padding: '0 20px 20px',
                    position: 'relative'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <Avatar
                            size={80}
                            src={company.profilePic}
                            style={{
                                border: '4px solid #FFFFFF',
                                backgroundColor: '#60A5FA',
                                fontSize: '28px',
                                fontWeight: 'bold',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                marginBottom: '12px'
                            }}
                        >
                            {company.firstName ? `${company.firstName[0]}${company.lastName[0]}` : company.name[0]}
                        </Avatar>
                        <Text style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1F2937',
                            textAlign: 'center',
                            marginBottom: '4px'
                        }}>
                            {company.firstName ? `${company.firstName} ${company.lastName}` : company.name}
                        </Text>
                        <Tag
                            className="status-tag"
                            style={{
                                background: statusStyle.background,
                                color: statusStyle.color,
                                border: statusStyle.border,
                                boxShadow: statusStyle.boxShadow,
                                padding: '4px 12px',
                                marginTop: '10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                letterSpacing: '0.02em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backdropFilter: 'blur(8px)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {statusStyle.icon}
                            <span>{activeSubscription ? 'ACTIVE' : 'INACTIVE'}</span>
                        </Tag>
                    </div>

                    <div style={{
                        display: 'grid',
                        gap: '12px',
                        marginBottom: '20px'
                    }}>
                        {[
                            { icon: <FiMail size={15} />, value: company.email, isLink: true },
                            { icon: <FiPhone size={15} />, value: `+${company.phoneCode} ${company.phone}` },
                            { icon: <FiMapPin size={15} />, value: `${company.city}, ${company.state}` }
                        ].map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 12px',
                                    background: '#F9FAFB',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{
                                    color: '#3B82F6',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {item.icon}
                                </div>
                                {item.isLink ? (
                                    <a
                                        href={`mailto:${item.value}`}
                                        style={{
                                            fontSize: '14px',
                                            color: '#3B82F6',
                                            textDecoration: 'none',
                                            flex: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {item.value}
                                    </a>
                                ) : (
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#4B5563',
                                        flex: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {item.value}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        <Button
                            type="primary"
                            icon={<FiLogIn style={{ fontSize: '16px' }} />}
                            onClick={handleAdminLogin}
                            style={{
                                height: '38px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgba(24, 144, 255, 0.3)',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px -1px rgba(24, 144, 255, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(24, 144, 255, 0.3)';
                            }}
                        >
                            Login as Company
                        </Button>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {activeSubscription ? (
                                <Button
                                    type="default"
                                    icon={<PiRocketBold style={{ fontSize: '16px' }} />}
                                    onClick={() => setUpgradeModalVisible(true)}
                                    style={{
                                        flex: 1,
                                        height: '38px',
                                        borderRadius: '10px',
                                        border: '1px solid #E5E7EB',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    Subscribed Plan Active
                                </Button>
                            ) : (
                                <Button
                                    type="default"
                                    icon={<PiRocketBold style={{ fontSize: '16px' }} />}
                                    onClick={() => setUpgradeModalVisible(true)}
                                    style={{
                                        flex: 1,
                                        height: '38px',
                                        borderRadius: '10px',
                                        border: '1px solid #E5E7EB',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    Upgrade to Premium
                                </Button>
                            )}

                            <Button
                                icon={<FiEye style={{ fontSize: '16px' }} />}
                                onClick={() => setDetailsModalVisible(true)}
                                style={{
                                    height: '38px',
                                    borderRadius: '10px',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                Details
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
            <Modal
                title={null}
                open={detailsModalVisible}
                onCancel={() => setDetailsModalVisible(false)}
                footer={null}
                width={720}
                destroyOnClose={true}
                centered
                closeIcon={null}
                className="pro-modal custom-modal"
                style={{
                    '--antd-arrow-background-color': '#ffffff'
                }}
                styles={{
                    body: {
                        padding: 0,
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }
                }}
            >
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    padding: '24px',
                    color: '#ffffff',
                    position: 'relative'
                }}>
                    <Button
                        type="text"
                        onClick={() => setDetailsModalVisible(false)}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            color: '#ffffff',
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                    >
                        <FiX style={{ fontSize: '20px' }} />
                    </Button>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <FiBriefcase style={{ fontSize: '24px', color: '#ffffff' }} />
                        </div>
                        <div>
                            <h2 style={{
                                margin: '0',
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#ffffff',
                            }}>
                                Company Details
                            </h2>
                            <Text style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)'
                            }}>
                                View detailed company information
                            </Text>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <Avatar
                            size={64}
                            src={company.profilePic}
                            style={{
                                backgroundColor: '#E5E7EB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {company.name[0]}
                        </Avatar>

                        <div>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                margin: '0 0 4px 0'
                            }}>
                                {company.name}
                            </h3>
                            <span style={{
                                color: statusStyle.color,
                                background: statusStyle.background,
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: '500'
                            }}>
                                {statusStyle.icon}
                                {activeSubscription ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    <Descriptions
                        column={1}
                        bordered
                        size="small"
                        labelStyle={{
                            width: '140px',
                            fontWeight: '500',
                            color: '#6B7280'
                        }}
                        contentStyle={{
                            color: '#111827'
                        }}
                    >
                        <Descriptions.Item label="Contact Person">
                            {company.firstName} {company.lastName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            <a href={`mailto:${company.email}`} style={{ color: '#3B82F6' }}>
                                {company.email}
                            </a>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone">
                            +{company.phoneCode} {company.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="GST Number">
                            {company.gstIn}
                        </Descriptions.Item>
                        {company.website && (
                            <Descriptions.Item label="Website">
                                <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: '#3B82F6',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    {company.website}
                                    <FiArrowUp style={{ transform: 'rotate(45deg)', fontSize: '12px' }} />
                                </a>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Address">
                            {company.address}<br />
                            {company.city}, {company.state}<br />
                            {company.country} - {company.zipcode}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created">
                            {moment(company.created_at).format('MMM DD, YYYY')}
                        </Descriptions.Item>
                    </Descriptions>

                    <div style={{
                        background: '#F9FAFB',
                        borderRadius: '12px',
                        padding: '16px'
                    }}>
                        <h4 style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            marginBottom: '12px',
                            color: '#374151'
                        }}>
                            Bank Details
                        </h4>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {[
                                { label: 'Bank Name', value: company.bankname },
                                { label: 'Account Holder', value: company.accountholder },
                                { label: 'Account Number', value: company.accountnumber },
                                { label: 'Account Type', value: company.accounttype },
                                { label: 'IFSC', value: company.ifsc },
                                { label: 'Branch', value: company.banklocation }
                            ].map((item, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    fontSize: '13px',
                                    gap: '8px'
                                }}>
                                    <span style={{
                                        width: '120px',
                                        color: '#6B7280',
                                        fontWeight: '500'
                                    }}>
                                        {item.label}:
                                    </span>
                                    <span style={{
                                        color: '#111827',
                                        fontFamily: item.label === 'Account Number' || item.label === 'IFSC' ? 'monospace' : 'inherit'
                                    }}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            <EditCompany
                visible={editModalVisible}
                onCancel={handleEditCancel}
                initialValues={company}
                loading={false}
            />

            <CreateUpgradePlan 
                open={upgradeModalVisible}
                onCancel={handleUpgradeModalClose}
                companyId={company.id}
                isEditing={false}
                initialValues={null}
            />
        </>
    );
};

// Helper component for info items
const InfoItem = ({ label, value, isEmail }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>
            {label}
        </span>
        {isEmail ? (
            <a
                href={`mailto:${value}`}
                style={{
                    fontSize: '14px',
                    color: '#3B82F6',
                    textDecoration: 'none',
                    fontWeight: '500'
                }}
            >
                {value}
            </a>
        ) : (
            <span style={{ fontSize: '14px', color: '#111827' }}>
                {value}
            </span>
        )}
    </div>
);

export default CompanyCard; 