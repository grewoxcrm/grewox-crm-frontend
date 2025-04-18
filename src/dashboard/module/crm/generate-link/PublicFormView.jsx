import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Switch, InputNumber, message, Spin, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCustomFormByIdQuery, useSubmitFormResponseMutation } from './services/customFormApi';
import { FiUser, FiMail, FiPhone, FiFileText, FiCalendar, FiToggleRight, FiHash, FiMapPin } from 'react-icons/fi';
import dayjs from 'dayjs';
import './PublicForm.scss';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PublicFormView = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { data: formData, isLoading, error } = useGetCustomFormByIdQuery(formId);
    const [submitFormResponse, { isLoading: isSubmitting }] = useSubmitFormResponseMutation();
    const [fields, setFields] = useState({});

    useEffect(() => {
        if (formData?.data) {
            try {
                const parsedFields = typeof formData.data.fields === 'string'
                    ? JSON.parse(formData.data.fields)
                    : formData.data.fields;
                setFields(parsedFields);
            } catch (error) {
                console.error('Error parsing fields:', error);
                message.error('Error loading form fields');
            }
        }
    }, [formData]);

    const getFieldIcon = (type) => {
        switch (type) {
            case 'string':
                return <FiFileText className="field-icon" />;
            case 'number':
                return <FiHash className="field-icon" />;
            case 'text':
                return <FiFileText className="field-icon" />;
            case 'boolean':
                return <FiToggleRight className="field-icon" />;
            default:
                return <FiFileText className="field-icon" />;
        }
    };

    const renderField = (fieldName, field) => {
        const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');

        const commonProps = {
            key: fieldName,
            name: fieldName,
            label: (
                <Space>
                    {getFieldIcon(field.type)}
                    <span>{label}</span>
                </Space>
            ),
            rules: [{ required: field.required, message: `Please enter ${label}` }],
            className: 'custom-form-item'
        };

        switch (field.type) {
            case 'string':
                return (
                    <Form.Item {...commonProps}>
                        <Input className="custom-input" placeholder={`Enter ${label.toLowerCase()}`} />
                    </Form.Item>
                );
            case 'number':
                return (
                    <Form.Item {...commonProps}>
                        <InputNumber
                            className="custom-input"
                            style={{ width: '100%' }}
                            placeholder={`Enter ${label.toLowerCase()}`}
                        />
                    </Form.Item>
                );
            case 'text':
                return (
                    <Form.Item {...commonProps}>
                        <TextArea
                            className="custom-textarea"
                            rows={4}
                            placeholder={`Enter ${label.toLowerCase()}`}
                        />
                    </Form.Item>
                );
            case 'boolean':
                return (
                    <Form.Item {...commonProps} valuePropName="checked">
                        <Switch className="custom-switch" />
                    </Form.Item>
                );
            default:
                return null;
        }
    };

    const handleSubmit = async (values) => {
        try {
            const response = await submitFormResponse({
                formId,
                data: values
            }).unwrap();

            if (response.success) {
                message.success({
                    content: response.message || 'Form submitted successfully',
                    duration: 5
                });
                form.resetFields();
                setTimeout(() => {
                    navigate('/form-submitted', {
                        state: {
                            formTitle: formData?.data?.title,
                            submissionId: response.data?.id
                        }
                    });
                }, 2000);
            } else {
                message.error(response.message || 'Failed to submit form');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            message.error(error.data?.message || 'Failed to submit form. Please try again later.');
        }
    };

    const isFormExpired = () => {
        if (!formData?.data?.end_date) return false;
        return new Date() > new Date(formData.data.end_date);
    };

    if (isFormExpired()) {
        return (
            <div className="public-form-error">
                <Title level={3}>Form Expired</Title>
                <Text type="secondary">This form is no longer accepting submissions.</Text>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="public-form-loading">
                <Spin size="large" />
                <Text>Loading form...</Text>
            </div>
        );
    }

    if (error) {
        return (
            <div className="public-form-error">
                <Title level={3}>Unable to load form</Title>
                <Text type="secondary">Please try again later or contact support.</Text>
            </div>
        );
    }

    return (
        <div className="public-form-container">
            <div className="form-header">
                <div className="header-content">
                    <div className="header-main">
                        <div className="header-text">
                            <Title level={2}>{formData?.data?.title}</Title>
                            <Paragraph>{formData?.data?.description}</Paragraph>
                        </div>
                    </div>

                    <div className="event-info">
                        <div className="event-card">
                            <div className="event-card-item">
                                <FiCalendar className="icon" />
                                <div className="info">
                                    <Text className="label">Event Date</Text>
                                    <Text className="value">
                                        {dayjs(formData?.data?.start_date).format('MMM DD, YYYY')}
                                    </Text>
                                </div>
                            </div>
                            <div className="event-card-item">
                                <FiMapPin className="icon" />
                                <div className="info">
                                    <Text className="label">Location</Text>
                                    <Text className="value">{formData?.data?.event_location}</Text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="form-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="custom-form"
                    validateTrigger={['onBlur', 'onChange']}
                >
                    {Object.entries(fields).map(([fieldName, field]) =>
                        renderField(fieldName, field)
                    )}

                    <Form.Item className="form-submit">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={isSubmitting}
                            disabled={isFormExpired()}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Form'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default PublicFormView; 