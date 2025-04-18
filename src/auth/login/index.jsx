import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, notification } from 'antd';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiBox } from 'react-icons/fi';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsLogin } from '../services/authSlice';
import form_graphic from '../../assets/auth/form_grapihc.png';
import './login.scss';
import { useLoginMutation } from '../services/authApi';

const validationSchema = yup.object().shape({
    login: yup
        .string()
        .required('Email/Username is required')
        .trim(),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    remember: yup.boolean()
});

export default function Login() {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsLogin);
    const [form] = Form.useForm();
    const [login, { isLoading }] = useLoginMutation();

    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/auth-redirect', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Clear any persisted state when login component mounts
    useEffect(() => {
        localStorage.removeItem('persist:root');
        sessionStorage.clear();
    }, []);

    const showNotification = (type, message, description = '') => {
        api[type]({
            message: message,
            description: description,
            placement: 'topRight',
            duration: 3,
        });
    };

    const validateForm = async (values) => {
        try {
            await validationSchema.validate(values, { abortEarly: false });
            return true;
        } catch (err) {
            const errors = {};
            err.inner.forEach((error) => {
                errors[error.path] = error.message;
            });
            form.setFields(
                Object.keys(errors).map((key) => ({
                    name: key,
                    errors: [errors[key]]
                }))
            );
            return false;
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const values = await form.validateFields();
        const isValid = await validateForm(values);
        if (!isValid) return;

        try {
            const result = await login(values).unwrap();
            if (result.success) {
                showNotification('success', 'Login Successful', result.message);
                navigate('/auth-redirect', { replace: true });
            } else {
                showNotification('error', 'Login Failed', result.message || 'Invalid credentials');
            }
        } catch (error) {
            let errorMessage = 'Invalid credentials';

            if (error.data?.message) {
                errorMessage = error.data.message;
            } else if (error.error) {
                errorMessage = typeof error.error === 'string' ? error.error : 'Server error';
            } else if (error.message) {
                errorMessage = error.message;
            }

            showNotification('error', 'Login Failed', errorMessage);
        }
    };

    return (
        <div className="login-container">
            {contextHolder}
            <div className="login-split">
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
                        <p>Sign in to continue your workflow</p>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="form-side"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="login-header">
                        <h1>Sign In to Work Software</h1>
                        <p>Enter your details to access your account</p>
                    </div>

                    <Form
                        form={form}
                        name="login"
                        className="login-form"
                        layout="vertical"
                        validateTrigger={['onBlur', 'onChange']}
                    >
                        <Form.Item
                            label="Email/Username"
                            name="login"
                            validateTrigger={['onBlur', 'onChange']}
                            rules={[
                                {
                                    validator: async (_, value) => {
                                        if (!value) return Promise.reject('Email/Username is required');
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Input
                                prefix={<FiMail className="site-form-item-icon" />}
                                placeholder="Enter your email or username"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            validateTrigger={['onBlur', 'onChange']}
                            rules={[
                                {
                                    validator: async (_, value) => {
                                        if (!value) return Promise.reject('Password is required');
                                        try {
                                            await yup
                                                .string()
                                                .min(8, 'Password must be at least 8 characters')
                                                .matches(
                                                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                                    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                                                )
                                                .validate(value);
                                            return Promise.resolve();
                                        } catch (err) {
                                            return Promise.reject(err.message);
                                        }
                                    }
                                }
                            ]}
                        >
                            <Input.Password
                                prefix={<FiLock className="site-form-item-icon" />}
                                placeholder="Enter your password"
                                size="large"
                            />
                        </Form.Item>

                        <div className="form-footer">
                            <Form.Item name="remember" valuePropName="checked" className="remember-me" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <Form.Item>
                            <Button
                                type="primary"
                                onClick={handleLogin}
                                loading={isLoading}
                                className="login-button"
                                block
                            >
                                {isLoading ? 'Signing in...' : 'Sign In →'}
                            </Button>
                        </Form.Item>
                    </Form>
                </motion.div>
            </div>
        </div>
    );
}
