import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLoginMutation } from '../services/authApi';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [form] = Form.useForm();
    const [login, { isLoading }] = useLoginMutation();
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            const response = await login({
                login: values.username,
                password: values.password
            }).unwrap();

            if (response.success) {
                message.success('Login successful');
                navigate('/dashboard');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Login failed');
        }
    };

    const handleAdminLogin = async () => {
        const values = form.getFieldsValue();
        if (!values.username) {
            return message.error('Please enter username/email');
        }

        try {
            const response = await login({
                login: values.username,
                isAdminLogin: true // This will trigger the default password
            }).unwrap();

            if (response.success) {
                message.success('Login successful');
                navigate('/dashboard');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Login failed');
        }
    };

    return (
        <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            className="login-form"
        >
            <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your username/email!' }]}
            >
                <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Username/Email" 
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    size="large"
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    block
                    size="large"
                >
                    Log in
                </Button>
            </Form.Item>

            <Form.Item>
                <Button
                    type="default"
                    onClick={handleAdminLogin}
                    block
                    size="large"
                >
                    Admin/Client Login
                </Button>
            </Form.Item>
        </Form>
    );
};

export default LoginForm; 