import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Select,
    DatePicker,
    Space,
    message,
} from 'antd';
import { FiUser, FiFileText, FiGrid, FiX, FiCalendar, FiLink, FiPlus, FiTrash2 } from 'react-icons/fi';
import moment from 'moment';
import { useCreateTrainingMutation, useUpdateTrainingMutation } from './services/trainingApi';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CreateTraining = ({ open, onCancel, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // RTK Query hooks
    const [createTraining] = useCreateTrainingMutation();
    const [updateTraining] = useUpdateTrainingMutation();

    // Set form values when editing
    useEffect(() => {
        if (isEditing && initialValues) {
            try {
                // Parse the links if it's a string
                const links = typeof initialValues.links === 'string' 
                    ? JSON.parse(initialValues.links) 
                    : initialValues.links;

                // Create training items array from links
                const trainingItems = Array.isArray(links?.url) 
                    ? links.url.map((url, index) => ({
                        title: initialValues.title,
                        links: url
                    }))
                    : [{
                        title: initialValues.title,
                        links: links?.url || ''
                    }];

                // Set form values for editing
                form.setFieldsValue({
                    category: initialValues.category,
                    trainingItems: trainingItems
                });
            } catch (error) {
                console.error('Error setting form values:', error);
                message.error('Error loading training data');
            }
        } else {
            // Reset form for create mode
            form.resetFields();
            form.setFieldsValue({
                trainingItems: [{}]
            });
        }
    }, [initialValues, isEditing, form]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            
            // Create arrays for titles and links
            const titles = values.trainingItems.map(item => item.title.trim());
            const urls = values.trainingItems.map(item => item.links.trim());

            // Create the final formatted values
            const formData = {
                category: values.category.trim(),
                title: titles[0], // Keep first title as main title
                links: {
                    url: urls // Store all URLs as an array
                }
            };

            console.log('Submitting form data:', formData); // Debug log

            if (isEditing && initialValues?.id) {
                // Update existing training
                await updateTraining({
                    id: initialValues.id,
                    data: formData
                }).unwrap();
                message.success('Training updated successfully!');
            } else {
                // Create new training
                await createTraining(formData).unwrap();
                message.success('Training created successfully!');
            }
            
            form.resetFields();
            onCancel();
        } catch (error) {
            if (error.data?.message) {
                message.error(error.data.message);
            } else {
                message.error('Failed to process training. Please try again.');
            }
            console.error('Form submission failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={520}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
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
                        <FiGrid style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            {isEditing ? 'Edit Training' : 'Create New Training'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update training information'
                                : 'Fill in the information to create training'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    ...initialValues,
                    date: initialValues ? [
                        moment(initialValues.start_date),
                        moment(initialValues.end_date)
                    ] : undefined,
                    trainingItems: initialValues?.trainingItems || [{}]
                }}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <Form.Item
                    name="category"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Training Category
                        </span>
                    }
                    rules={[
                        { required: true, message: 'Please enter training category' },
                        { max: 100, message: 'Category cannot exceed 100 characters' }
                    ]}
                >
                    <Input
                        prefix={<FiGrid style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter training category"
                        size="large"
                        style={{
                            borderRadius: '10px',
                            padding: '8px 16px',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                            transition: 'all 0.3s ease',
                        }}
                    />
                </Form.Item>

                <Form.List name="trainingItems" initialValue={[{}]}>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }, index) => (
                                <div key={key} style={{ marginBottom: '16px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'flex-start',
                                        gap: '16px'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'title']}
                                                label={
                                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                                        Training Title
                                                    </span>
                                                }
                                                rules={[
                                                    { required: true, message: 'Please enter training title' },
                                                    { max: 100, message: 'Title cannot exceed 100 characters' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<FiGrid style={{ color: '#1890ff', fontSize: '16px' }} />}
                                                    placeholder="Enter training title"
                                                    size="large"
                                                    style={{
                                                        borderRadius: '10px',
                                                        padding: '8px 16px',
                                                        height: '48px',
                                                        backgroundColor: '#f8fafc',
                                                        border: '1px solid #e6e8eb',
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'links']}
                                                label={
                                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                                        Training Link
                                                    </span>
                                                }
                                                rules={[
                                                    { required: true, message: 'Please enter training link' },
                                                    { type: 'url', message: 'Please enter a valid URL' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<FiLink style={{ color: '#1890ff', fontSize: '16px' }} />}
                                                    placeholder="Enter training link"
                                                    size="large"
                                                    style={{
                                                        borderRadius: '10px',
                                                        padding: '8px 16px',
                                                        height: '48px',
                                                        backgroundColor: '#f8fafc',
                                                        border: '1px solid #e6e8eb',
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                />
                                            </Form.Item>
                                        </div>
                                        
                                        {fields.length > 1 && (
                                            <Button
                                                type="text"
                                                onClick={() => remove(name)}
                                                icon={<FiTrash2 style={{ fontSize: '18px', color: '#ff4d4f' }} />}
                                                style={{
                                                    marginTop: '32px',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '8px',
                                                    border: '1px solid #ff4d4f',
                                                }}
                                            />
                                        )}
                                    </div>
                                    {index < fields.length - 1 && (
                                        <Divider style={{ margin: '16px 0' }} />
                                    )}
                                </div>
                            ))}
                            
                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    icon={<FiPlus />}
                                    style={{
                                        width: '100%',
                                        borderColor: '#1890ff',
                                        color: '#1890ff',
                                        height: '40px',
                                        borderRadius: '8px',
                                        marginBottom: '24px'
                                    }}
                                >
                                    Add Training Item
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

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
                        {isEditing ? 'Update Training' : 'Create Training'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateTraining; 
