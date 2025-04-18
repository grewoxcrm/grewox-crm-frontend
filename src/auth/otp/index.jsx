import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { FiBox, FiArrowLeft } from 'react-icons/fi';
import form_graphic from '../../assets/auth/form_grapihc.png';
import { Link, useNavigate } from 'react-router-dom';
import './otp.scss';

export default function OTPVerification() {
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const [timer, setTimer] = useState(30);
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (value, index) => {
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

    const resendOTP = () => {
        setTimer(30);
        message.info({
            content: 'New OTP has been sent to your email!',
            icon: <span className="info-icon">i</span>
        });
    };

    const onFinish = async () => {
        try {
            setLoading(true);
            const otpString = otp.join('');

            if (otpString.length !== 6) {
                throw new Error('Please enter complete OTP');
            }

            // Add your OTP verification logic here
            console.log('Verifying OTP:', otpString);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            message.success({
                content: 'OTP verified successfully!',
                icon: <span className="success-icon">✓</span>
            });

            // Navigate to next step
            navigate('/reset-password');
        } catch (error) {
            console.error('OTP verification error:', error);
            message.error({
                content: error?.message || 'Failed to verify OTP. Please try again.',
                icon: <span className="error-icon">×</span>
            });
        } finally {
            setLoading(false);
        }
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
                        <h2>Verify Your Email</h2>
                        <p>Enter the code we sent to your email</p>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="form-side"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Link to="/forgot-password" className="back-link">
                        <FiArrowLeft /> Back
                    </Link>

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
                                    onChange={e => handleChange(e.target.value, index)}
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
                            onClick={() => navigate('/reset-password')}
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
                </motion.div>
            </div>
        </div>
    );
} 