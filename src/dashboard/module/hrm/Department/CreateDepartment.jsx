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
} from 'antd';
import { FiGrid, FiX, FiPlus } from 'react-icons/fi';
import {
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
} from './services/departmentApi';
import { useGetAllBranchesQuery } from '../Branch/services/branchApi';
import CreateBranch from '../Branch/CreateBranch';

const { Text } = Typography;
const { Option } = Select;

const CreateDepartment = ({ open, onCancel, onSubmit, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [isCreateBranchModalOpen, setIsCreateBranchModalOpen] = useState(false);

    // RTK Query hooks
    const { data: branchesData, isLoading: isLoadingBranches } = useGetAllBranchesQuery();
    const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
    const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();

    // Transform branch data
    const branches = React.useMemo(() => {
        if (!branchesData) return [];
        if (Array.isArray(branchesData)) return branchesData;
        if (Array.isArray(branchesData.data)) return branchesData.data;
        return [];
    }, [branchesData]);

    useEffect(() => {
        if (isEditing && initialValues) {
            form.setFieldsValue(initialValues);
        } else {
            form.resetFields();
        }
    }, [form, isEditing, initialValues]);

    const handleSubmit = async (values) => {
        try {
            if (isEditing) {
                await updateDepartment({
                    id: initialValues.id,
                    data: values,
                }).unwrap();
                message.success('Department updated successfully');
            } else {
                await createDepartment(values).unwrap();
                message.success('Department created successfully');
            }
            form.resetFields();
            onCancel();
        } catch (error) {
            message.error(error?.data?.message || 'Operation failed');
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
                                {isEditing ? 'Edit Department' : 'Create New Department'}
                            </h2>
                            <Text
                                style={{
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                {isEditing
                                    ? 'Update department information'
                                    : 'Fill in the information to create department'}
                            </Text>
                        </div>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={initialValues}
                    requiredMark={false}
                    style={{
                        padding: '24px',
                    }}
                >
                    <Form.Item
                        name="department_name"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Department Name
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please enter department name' },
                            { max: 100, message: 'Department name cannot exceed 100 characters' }
                        ]}
                    >
                        <Input
                            prefix={<FiGrid style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter department name"
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
                            loading={isLoadingBranches}
                            listHeight={100}
                            dropdownStyle={{
                              Height: '100px',
                              overflowY: 'auto',
                              scrollbarWidth: 'thin',
                              scrollBehavior: 'smooth'
                            }}
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
                            loading={isCreating || isUpdating}
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
                            {isEditing ? 'Update Department' : 'Create Department'}
                        </Button>
                    </div>
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

export default CreateDepartment; 