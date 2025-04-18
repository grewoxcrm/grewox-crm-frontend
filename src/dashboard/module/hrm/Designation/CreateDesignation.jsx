import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    message,
    Select,
    Space,
} from 'antd';
import { FiGrid, FiX, FiPlus } from 'react-icons/fi';
import { useCreateDesignationMutation, useUpdateDesignationMutation } from './services/designationApi';
import { useGetAllBranchesQuery } from '../Branch/services/branchApi';
import CreateBranch from '../Branch/CreateBranch';

const { Text } = Typography;
const { Option } = Select;

const CreateDesignation = ({ open, onCancel, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isCreateBranchModalOpen, setIsCreateBranchModalOpen] = useState(false);

    // RTK Query hooks
    const { data: branchesData, isLoading: isLoadingBranches } = useGetAllBranchesQuery();

    const [createDesignation] = useCreateDesignationMutation();
    const [updateDesignation] = useUpdateDesignationMutation();

    // Transform branch data
    const branches = React.useMemo(() => {
        if (!branchesData) return [];
        if (Array.isArray(branchesData)) return branchesData;
        if (Array.isArray(branchesData.data)) return branchesData.data;
        return [];
    }, [branchesData]);

    // Set form values when editing
    useEffect(() => {
        if (isEditing && initialValues) {
            try {
                // Set form values for editing
                form.setFieldsValue({
                    designation_name: initialValues.designation_name,
                    branch: initialValues.branch,
                });
            } catch (error) {
                console.error('Error setting form values:', error);
                message.error('Error loading designation data');
            }
        } else {
            // Reset form for create mode
            form.resetFields();
        }
    }, [initialValues, isEditing, form]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            // Create the final formatted values
            const formData = {
                designation_name: values.designation_name.trim(),
                branch: values.branch
            };

            if (isEditing && initialValues?.id) {
                // Update existing designation
                await updateDesignation({
                    id: initialValues.id,
                    data: formData
                }).unwrap();
                message.success('Designation updated successfully!');
            } else {
                // Create new designation
                await createDesignation(formData).unwrap();
                message.success('Designation created successfully!');
            }

            form.resetFields();
            onCancel();
        } catch (error) {
            if (error.data?.message) {
                message.error(error.data.message);
            } else {
                message.error('Failed to process designation. Please try again.');
            }
            console.error('Form submission failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBranchSuccess = async (newBranch) => {
        setIsCreateBranchModalOpen(false);
        message.success('Branch created successfully');
        if (newBranch?.id) {
            form.setFieldValue('branch', newBranch.id);
        }
    };

    const dropdownRender = (menu) => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <div onClick={e => e.stopPropagation()}>
                <Button
                    type="link"
                    icon={<FiPlus style={{ fontSize: '16px' }} />}
                    onClick={() => setIsCreateBranchModalOpen(true)}
                    style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        color: '#1890ff',
                        fontWeight: 500,
                        gap: '8px'
                    }}
                >
                    Add New Branch
                </Button>
            </div>
        </>
    );

    return (
        <>
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
                                {isEditing ? 'Edit Designation' : 'Create New Designation'}
                            </h2>
                            <Text
                                style={{
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                {isEditing
                                    ? 'Update designation information'
                                    : 'Fill in the information to create designation'}
                            </Text>
                        </div>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={false}
                    style={{
                        padding: '24px',
                    }}
                >
                    <Form.Item
                        name="designation_name"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Designation Name
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please enter designation name' },
                            { max: 100, message: 'Designation name cannot exceed 100 characters' }
                        ]}
                    >
                        <Input
                            prefix={<FiGrid style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter designation name"
                            size="large"
                            style={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="branch"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Branch
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select a branch' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select a branch"
                            size="large"
                            listHeight={100}
                            dropdownStyle={{
                                Height: '100px',
                                overflowY: 'auto',
                                scrollbarWidth: 'thin',
                                scrollBehavior: 'smooth'
                            }}
                            loading={isLoadingBranches}
                            dropdownRender={dropdownRender}
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                            }}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {branches.map(branch => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.branchName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={onCancel}>Cancel</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                }}
                            >
                                {isEditing ? 'Update Designation' : 'Create Designation'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <CreateBranch
                open={isCreateBranchModalOpen}
                onCancel={() => setIsCreateBranchModalOpen(false)}
                onSubmit={handleCreateBranchSuccess}
            />
        </>
    );
};

export default CreateDesignation; 