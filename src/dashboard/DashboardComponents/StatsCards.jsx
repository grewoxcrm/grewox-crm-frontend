import React from "react";
import { Col, Card, Typography } from "antd";
import { motion } from "framer-motion";
import CountUp from 'react-countup';
import { Link } from "react-router-dom";

const { Text } = Typography;

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const getStarColor = (color) => {
    // Create a slightly lighter version of the main color for stars
    return color + '40'; // 40 is for 25% opacity in hex
};

const StatsCards = ({ stats }) => {
    return (
        <>
            {stats.map((stat, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                    <motion.div variants={fadeInUp}>
                        <Link to={stat.link}>
                            <Card
                                className="stats-card"
                                style={{
                                    background: stat.gradient,
                                    border: 'none',
                                    borderRadius: '12px',
                                    height: '140px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                bodyStyle={{
                                    padding: '20px',
                                    height: '100%',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                                hoverable
                            >
                                {/* Decorative Stars */}
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    width: '20px',
                                    height: '20px',
                                    background: getStarColor(stat.color),
                                    opacity: 0.4,
                                    transform: 'rotate(45deg)'
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    top: '40px',
                                    right: '40px',
                                    width: '40px',
                                    height: '40px',
                                    background: getStarColor(stat.color),
                                    opacity: 0.2,
                                    transform: 'rotate(45deg)'
                                }} />

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{
                                            background: stat.iconGradient,
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>
                                            <span style={{ color: '#fff', fontSize: '20px' }}>
                                                {stat.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <Text style={{
                                                fontSize: '16px',
                                                color: '#1f2937',
                                                fontWeight: '500',
                                                display: 'block'
                                            }}>
                                                {stat.title}
                                            </Text>
                                            <Text type="secondary" style={{
                                                fontSize: '12px'
                                            }}>
                                                {stat.tag}
                                            </Text>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            color: stat.color,
                                            marginBottom: '4px',
                                            lineHeight: '1',
                                            letterSpacing: '-0.02em'
                                        }}>
                                            <CountUp
                                                start={0}
                                                end={stat.value}
                                                duration={2}
                                                separator=","
                                                decimal="."
                                                decimals={stat.format === 'currency' ? 2 : 0}
                                                prefix={stat.format === 'currency' ? stat.currencySymbol : ''}
                                            />
                                        </div>
                                        <Text type="secondary" style={{
                                            fontSize: '13px',
                                            display: 'block'
                                        }}>
                                            {stat.description}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </motion.div>
                </Col>
            ))}
        </>
    );
};

export default StatsCards; 