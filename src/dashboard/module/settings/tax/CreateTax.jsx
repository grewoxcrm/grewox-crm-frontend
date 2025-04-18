import React, { useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    message,
    Select,
    InputNumber,
    Switch
} from 'antd';
import { FiPercent, FiFileText, FiX } from 'react-icons/fi';
import { useCreateTaxMutation, useUpdateTaxMutation } from './services/taxApi';

const { Text } = Typography;

const CreateTax = ({ open, onCancel, onSubmit, isEditing, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [createTax] = useCreateTaxMutation();
    const [updateTax] = useUpdateTaxMutation();

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) {
                // Format the initial values for editing
                const formattedValues = {
                    ...initialValues,
                    gstName: initialValues.gstName,
                    gstPercentage: initialValues.gstPercentage,
                    isActive: initialValues.isActive !== false
                };
                
                form.setFieldsValue(formattedValues);
            } else {
                // Set default values for new tax
                form.setFieldsValue({
                    isActive: true
                });
            }
        }
    }, [open, form, initialValues]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Format the data according to the required payload structure
            const formattedValues = {
                gstName: values.gstName,
                gstPercentage: values.gstPercentage,
                isActive: values.isActive
            };

            // Validate required fields
            const requiredFields = ['gstName', 'gstPercentage'];
            for (const field of requiredFields) {
                if (!formattedValues[field]) {
                    console.error(`${field} is missing!`);
                    message.error(`${field} is required`);
                    return;
                }
            }

            if (isEditing && initialValues?.id) {
               await updateTax({
                    id: initialValues.id,
                    data: formattedValues
                }).unwrap();
                message.success('Tax updated successfully!');
            } else {
                await createTax(formattedValues).unwrap();
                message.success('Tax created successfully!');
            }

            onCancel();
        } catch (error) {
            message.error(error.data?.message || 'Please check your input and try again.');
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="tax-form-modal custom-modal"
            style={{
                '--antd-arrow-background-color': '#ffffff',
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                }
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    padding: '24px',
                    color: '#ffffff',
                    position: 'relative',
                }}
            >
                <Button
                    type="text"
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        color: '#ffffff',
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                >
                    <FiX style={{ fontSize: '20px' }} />
                </Button>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FiPercent style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: '0',
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#ffffff',
                            }}
                        >
                            {isEditing ? 'Edit Tax' : 'Create New Tax'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update tax information'
                                : 'Fill in the information to create tax'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ 
                    isActive: true
                }}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
                className="tax-create-form"
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="gstName"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                GST Name
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please enter GST name' },
                            { max: 100, message: 'GST name cannot exceed 100 characters' }
                        ]}
                    >
                        <Input
                            prefix={<FiFileText className="input-icon" />}
                            placeholder="Enter GST name"
                            size="large"
                            className="styled-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="gstPercentage"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                GST Percentage
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please enter GST percentage' }
                        ]}
                    >
                        <Input
                            prefix={<FiPercent className="input-icon" />}
                            placeholder="Enter GST percentage"
                            size="large"
                            className="styled-input"
                            type="number"
                            min={0}
                            max={100}
                        />
                    </Form.Item>
                </div>

                <Divider style={{ margin: '24px 0' }} />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                    }}
                >
                    <Button
                        size="large"
                        onClick={onCancel}
                        style={{
                            padding: '8px 24px',
                            height: '44px',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isEditing ? 'Update Tax' : 'Create Tax'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateTax;
