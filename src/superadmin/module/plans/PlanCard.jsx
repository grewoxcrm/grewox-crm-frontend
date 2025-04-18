import React from 'react';
import { Card, Typography, Button, Tag, Dropdown, Switch } from 'antd';
import {
    FiEye,
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiDollarSign,
    FiUsers,
    FiHardDrive,
    FiCheckCircle,
    FiXCircle,
    FiCheck
} from 'react-icons/fi';
import { useGetAllCurrenciesQuery } from '../settings/services/settingsApi';

const { Text, Title } = Typography;

const PlanCard = ({ plan, onEdit, onDelete, onView, onToggleStatus }) => {
    const statusInfo = {
        active: {
            color: '#52c41a',
            icon: <FiCheckCircle style={{ marginRight: '4px' }} />
        },
        inactive: {
            color: '#ff4d4f',
            icon: <FiXCircle style={{ marginRight: '4px' }} />
        }
    };

    const status = plan.status || 'inactive';

    const { data: currencies } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });
    const getCurrencyIcon = (currencyId) => {
        const currency = currencies?.find(c => c.id === currencyId);
        return currency?.currencyIcon || '$';
    };

    const actionItems = [
        {
            key: 'view',
            icon: <FiEye />,
            label: 'View Details',
            onClick: () => onView?.(plan)
        },
        {
            key: 'edit',
            icon: <FiEdit2 />,
            label: 'Edit Plan',
            onClick: () => onEdit?.(plan)
        },
        {
            key: 'delete',
            icon: <FiTrash2 />,
            label: 'Delete Plan',
            danger: true,
            onClick: () => onDelete?.(plan)
        }
    ];

    const handleToggleStatus = (checked) => {
        onToggleStatus?.(plan.id, checked ? 'active' : 'inactive');
    };

    const formatStorageSize = (sizeInMB) => {
        const size = parseFloat(sizeInMB);
        if (size >= 1024) {
            const gbValue = size / 1024;
            // Remove decimals if it's a whole number
            return `${Number.isInteger(gbValue) ? gbValue.toFixed(0) : gbValue.toFixed(2)} GB`;
        }
        return `${Math.round(size)} MB`;
    };

    return (
        <Card
            className="plan-card"
            hoverable
            bodyStyle={{
                padding: '24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
            extra={
                <div className="card-actions">
                    <div className={`status-switch ${status}`}>
                        <Switch
                            checked={plan.status === 'active'}
                            onChange={handleToggleStatus}
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                            className={`switch-${status}`}
                        />
                    </div>
                    <Dropdown
                        menu={{ items: actionItems }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical />}
                            className="more-actions-button"
                        />
                    </Dropdown>
                </div>
            }
        >
            <div className="plan-card-header">
                <Title level={3} className="plan-name">
                    {plan.name}
                </Title>
                <div className="price-section">
                    <span className="icon">
                        <small className="currency-icon">
                            {getCurrencyIcon(plan.currency)}
                        </small>
                        {Number(plan.price || 0).toFixed(2)}
                    </span>
                    <span className="amount">/{plan.duration.toLowerCase()}</span>
                </div>
            </div>

            <div className="plan-features">
                <div className="features-group">
                    <Title level={5} className="features-title">
                        <FiUsers className="section-icon" /> User Limits
                    </Title>
                    <ul className="features-list">
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.max_users}</strong> Users</span>
                        </li>
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.max_clients}</strong> Clients</span>
                        </li>
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.max_vendors}</strong> Vendors</span>
                        </li>
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.max_customers}</strong> Customers</span>
                        </li>
                    </ul>
                </div>

                <div className="features-group">
                    <Title level={5} className="features-title">
                        <FiHardDrive className="section-icon" /> Resources
                    </Title>
                    <ul className="features-list">
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{formatStorageSize(plan.storage_limit)}</strong> Storage Space</span>
                        </li>
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.trial_period} Days</strong> Free Trial</span>
                        </li>
                    </ul>
                </div>
            </div>
        </Card>
    );
};

export default PlanCard;