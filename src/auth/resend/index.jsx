import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { FiBox, FiArrowLeft, FiMail, FiLock } from 'react-icons/fi';
import form_graphic from '../../assets/auth/form_grapihc.png';
import { Link, useNavigate } from 'react-router-dom';
import './resend.scss';

export default function ResendVerification() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResend = () => {
        setLoading(true);
        setTimeout(() => {
            message.success({
                content: 'Verification code sent successfully!',
                icon: <span className="success-icon">✓</span>
            });
            setLoading(false);
            navigate('/login');
        }, 1500);
    };

    return (
        <div className="otp-container">
            <div className="otp-split">
                <motion.div
                    className="illustration-side"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="brand">
                        <FiLock className="logo" />
                        <span className="brand-name">Work Software</span>
                    </div>
                    <motion.img
                        src={form_graphic}
                        alt="Work illustration"
                        className="illustration"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.div
                        className="illustration-text"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <h2>Resend Verification</h2>
                        <p>Get a new verification code</p>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="form-side"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Link to="/login" className="back-link">
                        <FiArrowLeft /> Back
                    </Link>

                    <div className="otp-header">
                        <div className="header-icon">
                            <FiMail />
                        </div>
                        <h1>Reset Verification Password</h1>
                        <p>Enter your current password and new password to reset your verification password</p>
                    </div>

                    <div className="otp-form">
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please enter your email' },
                                { type: 'email', message: 'Please enter a valid email' }
                            ]}
                        >
                            <Input
                                prefix={<FiLock className="site-form-item-icon" />}
                                size="large"
                                placeholder="New Password"
                                className="email-input"
                            />
                            <Input
                                prefix={<FiLock className="site-form-item-icon" />}
                                size="large"
                                placeholder="Confirm Password"
                                className="email-input"
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            onClick={handleResend}
                            loading={loading}
                            className="verify-button"
                            block
                        >
                            {loading ? 'Sending...' : 'Send Verification Code'}
                        </Button>

                        <div className="resend-section">
                            <p>Remember your code?</p>
                            <Button
                                type="link"
                                onClick={() => navigate('/login')}
                                className="resend-button"
                            >
                                Enter Code
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
