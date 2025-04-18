import React from "react";
import { Card, Avatar, Button, Typography, Badge, Tag, Row, Col } from "antd";
import { FiBarChart2, FiClock, FiBriefcase, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

const { Text } = Typography;

const WelcomeSection = ({ user, companyName, showAnalytics, setShowAnalytics }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const getRoleOrCompanyDisplay = () => {
        if (!user) return {
            text: "Guest",
            icon: <FiUser />,
            color: "default"
        };

        if (user.roleName?.toLowerCase() === "client") {
            return {
                text: user.companyName || "Company",
                icon: <FiBriefcase />,
                color: "blue"
            };
        }

        return {
            text: user.roleName || "Administrator",
            icon: <FiUser />,
            color: "cyan"
        };
    };

    const roleDisplay = getRoleOrCompanyDisplay();

    return (
        <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="welcome-section-wrapper"
        >
            <Card
                className="welcome-card"
                bodyStyle={{ padding: '24px' }}
                style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    margin: '0 0 24px 0',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Background Pattern */}
                <div className="welcome-pattern" style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '40%',
                    height: '100%',
                    background: 'linear-gradient(45deg, transparent 0%, rgba(24, 144, 255, 0.03) 100%)',
                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 100% 0)',
                    zIndex: 0
                }} />

                <Row gutter={[24, 24]} align="middle" style={{ position: 'relative', zIndex: 1 }}>
                    <Col xs={24} sm={24} md={16} lg={16} xl={16}>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '16px'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <FiClock style={{ color: '#1890ff', fontSize: '18px' }} />
                            </motion.div>
                            <Text style={{
                                fontSize: '15px',
                                color: '#666',
                                fontWeight: '500'
                            }}>
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            style={{ marginBottom: '16px' }}
                        >
                            <Text style={{
                                fontSize: 'clamp(24px, 5vw, 36px)',
                                fontWeight: '700',
                                background: 'linear-gradient(90deg, #1890ff, #69c0ff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: 'block',
                                letterSpacing: '-0.5px',
                                lineHeight: 1.2
                            }}>
                                {getGreeting()}, {user?.firstName || user?.username}!
                            </Text>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                        >
                            <Text style={{
                                fontSize: '16px',
                                color: '#666',
                                display: 'block',
                                lineHeight: 1.5
                            }}>
                                Welcome back to your enterprise dashboard. Stay productive and manage your business efficiently.
                            </Text>
                        </motion.div>
                    </Col>

                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.5 }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: '20px'
                            }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    background: '#fff',
                                    padding: '16px 24px',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                                    border: '1px solid rgba(24, 144, 255, 0.1)',
                                    width: '100%',
                                    maxWidth: '360px'
                                }}
                            >
                                <Badge dot color="#52c41a" offset={[-4, 4]}>
                                    <Avatar
                                        size={56}
                                        src={user?.profilePic}
                                        style={{
                                            background: "linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)",
                                            border: "3px solid #fff",
                                            boxShadow: "0 2px 8px rgba(24, 144, 255, 0.15)"
                                        }}
                                    >
                                        {!user?.profilePic && (user?.firstName?.[0] || 'U')}
                                    </Avatar>
                                </Badge>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.6 }}
                                        style={{ marginBottom: '8px' }}
                                    >
                                        <Tag
                                            icon={roleDisplay.icon}
                                            color={roleDisplay.color}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                lineHeight: '20px',
                                                margin: 0,
                                                maxWidth: '100%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {roleDisplay.text}
                                        </Tag>
                                    </motion.div>
                                    <motion.div
                                        initial={{ y: 5, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.7 }}
                                    >
                                        <Text style={{
                                            fontSize: '14px',
                                            color: '#666',
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {user?.email}
                                        </Text>
                                    </motion.div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4, delay: 0.8 }}
                                style={{
                                    width: '100%',
                                    maxWidth: '360px',
                                    display: 'flex',
                                    justifyContent: { xs: 'flex-start', sm: 'flex-start', md: 'flex-end' }
                                }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ width: '100%' }}
                                >
                                    <Button
                                        type="primary"
                                        icon={<FiBarChart2 style={{ fontSize: '18px' }} />}
                                        onClick={() => setShowAnalytics(!showAnalytics)}
                                        style={{
                                            background: showAnalytics
                                                ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                                                : 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
                                            border: 'none',
                                            height: '48px',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 16px rgba(24, 144, 255, 0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            justifyContent: 'center',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {showAnalytics ? 'View Dashboard' : 'Analytics'}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </Col>
                </Row>
            </Card>
        </motion.div>
    );
};

export default WelcomeSection; 