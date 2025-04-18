import React from 'react';
import { Card, Row, Col, Button, Typography, Space, Badge, Breadcrumb, Dropdown, Menu, Statistic } from 'antd';
import { motion } from 'framer-motion';
import {
    FiEdit2,
    FiSettings,
    FiUsers,
    FiActivity,
    FiCheckCircle,
    FiDollarSign,
    FiHome,
    FiLogOut,
    FiMoreVertical,
    FiUserPlus,
    FiCreditCard,
    FiMail,
    FiUser,
    FiCalendar
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import { Link } from 'react-router-dom';
import { useLogout } from '../../../hooks/useLogout';
import { useGetAllCompaniesQuery } from '../company/services/companyApi';
import { useGetAllPlansQuery } from '../plans/services/planApi';
import { useGetAllSubscribedUsersQuery } from '../SubscribedUser/services/SubscribedUserApi';
import CountUp from 'react-countup';
import './dashboard.scss';

const { Title, Text } = Typography;

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const SuperAdminDashboard = () => {
    const user = useSelector(selectCurrentUser);
    const handleLogout = useLogout();
    const { data: companiesData } = useGetAllCompaniesQuery();
    const { data: plansData } = useGetAllPlansQuery({ page: 1, limit: 100 });
    const { data: subscribedUsersData } = useGetAllSubscribedUsersQuery();

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getUserFullName = () => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user?.username || 'User';
    };

    const getRoleName = () => {
        return user?.roleName?.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') || 'User Role';
    };

    // Calculate statistics
    const totalClients = companiesData?.data?.length || 0;

    // Count active subscriptions from subscribedUsersData
    const activeSubscriptions = subscribedUsersData?.data?.filter(sub =>
        sub.status === 'active'
    ).length || 0;

    // Calculate total revenue from active subscriptions
    const totalRevenue = subscribedUsersData?.data?.reduce((total, sub) => {
        if (sub.status === 'active' && sub.payment_status === 'paid') {
            const plan = plansData?.data?.find(p => p.id === sub.plan_id);
            return total + Number(plan?.price || 0);
        }
        return total;
    }, 0) || 0;

    const statsCards = [
        {
            title: 'Total Companies',
            value: totalClients,
            description: 'Total registered clients',
            icon: <FiUsers className="stats-icon" />,
            gradient: 'linear-gradient(145deg, #ffffff, #f0f7ff)',
            iconGradient: 'linear-gradient(135deg, #1890ff, #69c0ff)',
            color: '#1890ff',
            tag: `Paid Users: ${activeSubscriptions}`
        },
        {
            title: 'Total Plans',
            value: plansData?.data?.length || 0,
            description: 'Available subscription plans',
            icon: <FiCreditCard className="stats-icon" />,
            gradient: 'linear-gradient(145deg, #ffffff, #f6f3ff)',
            iconGradient: 'linear-gradient(135deg, #722ed1, #b37feb)',
            color: '#722ed1',
            tag: `Most Purchase Plan: ${plansData?.data?.[0]?.name || 'Basic'}`
        },
        {
            title: 'Total Revenue',
            value: totalRevenue,
            description: 'Revenue from active subscriptions',
            icon: <FiDollarSign className="stats-icon" />,
            gradient: 'linear-gradient(145deg, #ffffff, #f0fff4)',
            iconGradient: 'linear-gradient(135deg, #52c41a, #95de64)',
            color: '#52c41a',
            tag: `Total Order Amount: ₹${totalRevenue.toLocaleString()}`
        },
    ];

    // Show recent subscription activities
    const recentActivities = subscribedUsersData?.data?.slice(0, 5).map(sub => {
        const company = companiesData?.data?.find(c => c.id === sub.client_id);
        const plan = plansData?.data?.find(p => p.id === sub.plan_id);
        return {
            id: sub.id,
            text: `${company?.username || 'Client'} subscribed to ${plan?.name || 'plan'}`,
            icon: <FiUserPlus />,
            time: new Date(sub.start_date).toLocaleString()
        };
    }) || [];

    return (
        <motion.div
            className='dashboard-container'
            initial="initial"
            animate="animate"
            variants={staggerContainer}
        >
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <motion.div className="page-header" variants={fadeInUp}>
                <div className="page-title">
                    <Title level={2}>Revenue Overview</Title>
                    <Text type="secondary">Track your business growth</Text>
                </div>
            </motion.div>

            <Row gutter={[24, 24]}>
                {statsCards.map((card, index) => (
                    <Col xs={24} lg={8} key={index}>
                        <motion.div variants={fadeInUp}>
                            <Card
                                className="stats-card"
                                style={{
                                    background: card.gradient,
                                    border: '1px solid rgba(255, 255, 255, 0.8)'
                                }}
                            >
                                <div className="stats-content">
                                    <div className="stats-header">
                                        <div
                                            className="icon-wrapper"
                                            style={{ background: card.iconGradient }}
                                        >
                                            {card.icon}
                                        </div>
                                        <div
                                            className="tag-wrapper"
                                            style={{
                                                color: card.color,
                                                background: 'rgba(255, 255, 255, 0.9)'
                                            }}
                                        >
                                            {card.tag}
                                        </div>
                                    </div>
                                    <div className="stats-info">
                                        <h3 style={{ color: '#1f2937' }}>{card.title}</h3>
                                        <div className="stats-value" style={{ color: card.color }}>
                                            {card.title === 'Total Revenue' && '₹'}
                                            <CountUp
                                                start={0}
                                                end={card.value}
                                                duration={2}
                                                separator=","
                                                decimal="."
                                                decimals={card.title === 'Total Revenue' ? 2 : 0}
                                            />
                                        </div>
                                        <p style={{ color: '#6b7280' }}>{card.description}</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>
        </motion.div>
    );
};

export default SuperAdminDashboard;
