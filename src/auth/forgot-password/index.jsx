import React, { useState, useRef } from 'react';
import { Form, Input, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { FiMail, FiBox, FiArrowLeft, FiLock } from 'react-icons/fi';
import * as yup from 'yup';
import form_graphic from '../../assets/auth/form_grapihc.png';
import { Link } from 'react-router-dom';
import { useSendResetEmailMutation } from './services/forgot-passwordApi';
import './forgot-password.scss';

const validationSchema = yup.object().shape({
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required')
        .trim()
});

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const inputRefs = useRef([]);
    const [form] = Form.useForm();
    const [userEmail, setUserEmail] = useState('');

    // RTK Query hooks
    const [sendResetEmail] = useSendResetEmailMutation();

    React.useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (value, index) => {
        if (value.length > 1) {
            value = value[value.length - 1];
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newOtp = [...otp];

        for (let i = 0; i < pastedData.length; i++) {
            if (i < 6) {
                newOtp[i] = pastedData[i];
            }
        }

        setOtp(newOtp);
        if (newOtp[5]) {
            inputRefs.current[5].focus();
        }
    };

    const onFinish = async (values) => {
        try {
            const isValid = await validationSchema.validate(values, { abortEarly: false });
            if (!isValid) return;

            setLoading(true);
            setUserEmail(values.email);

            // Call the sendResetEmail API
            const response = await sendResetEmail({ email: values.email }).unwrap();
            
            message.success({
                content: response.message || 'Verification code sent to your email!',
                icon: <span className="success-icon">✓</span>
            });
            
            setShowOtpVerification(true);
            setTimer(30);
        } catch (error) {
            console.error('Reset password error:', error);
            message.error({
                content: error?.data?.message || 'Failed to send verification code. Please try again.',
                icon: <span className="error-icon">×</span>
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            message.error({
                content: 'Please enter complete verification code',
                icon: <span className="error-icon">×</span>
            });
            return;
        }

        setLoading(true);
        // Simulate API verification
        setTimeout(() => {
            setLoading(false);
            // Navigate to reset password page after verification
            window.location.href = '/reset-password';
        }, 1500);
    };

    const resendOTP = () => {
        if (timer > 0) return;
        setTimer(30);
        // Call the sendResetEmail API again
        sendResetEmail({ email: userEmail })
            .unwrap()
            .then(() => {
                message.success({
                    content: 'New verification code sent!',
                    icon: <span className="success-icon">✓</span>
                });
            })
            .catch(() => {
                message.error({
                    content: 'Failed to send new code',
                    icon: <span className="error-icon">×</span>
                });
            });
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-split">
               
                <motion.div
                    className="illustration-side"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="brand">
                        <FiBox className="logo" />
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
                        <h2>{showOtpVerification ? 'Verify Your Email' : 'Reset Password'}</h2>
                        <p>{showOtpVerification ? 'Enter the code we sent to your email' : "We'll help you get back into your account"}</p>
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

                    {showOtpVerification ? (
                        <div className="otp-verification">
                            <div className="otp-header">
                                <h1>Enter Verification Code</h1>
                                <p>We've sent a 6-digit code to your email address. Enter the code below to verify.</p>
                            </div>

                            <div className="otp-form">
                                <div className="otp-inputs">
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={el => inputRefs.current[index] = el}
                                            value={digit}
                                            onChange={e => handleOtpChange(e.target.value, index)}
                                            onKeyDown={e => handleKeyDown(e, index)}
                                            onPaste={handlePaste}
                                            maxLength={1}
                                            className="otp-input"
                                            size="large"
                                        />
                                    ))}
                                </div>

                                <Button
                                    type="primary"
                                    onClick={handleVerifyCode}
                                    loading={loading}
                                    className="verify-button"
                                    block
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </Button>

                                <div className="resend-section">
                                    <p>Didn't receive the code?</p>
                                    <Button
                                        type="link"
                                        onClick={resendOTP}
                                        disabled={timer > 0}
                                        className="resend-button"
                                    >
                                        {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="forgot-password-header">
                                <div className="header-icon">
                                    <FiLock />
                                </div>
                                <h1>Forgot Password?</h1>
                                <p>Enter your email address and we'll send you instructions to reset your password.</p>
                            </div>

                            <Form
                                form={form}
                                name="forgot-password"
                                className="forgot-password-form"
                                onFinish={onFinish}
                                layout="vertical"
                            >
                                <Form.Item
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Please enter your email address' },
                                        { type: 'email', message: 'Please enter a valid email address' }
                                    ]}
                                >
                                    <Input
                                        prefix={<FiMail className="site-form-item-icon" />}
                                        placeholder="Enter your email"
                                        size="large"
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="submit-button"
                                        loading={loading}
                                        block
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Instructions'}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
} 