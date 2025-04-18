import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Select,
    Row,
    Col,
    DatePicker,
    TimePicker,
    message,
} from 'antd';
import {
    FiX,
    FiFileText,
    FiAlertCircle,
    FiUser,
    FiCalendar,
    FiClock,
    FiPlus,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useGetAllBranchesQuery } from '../Branch/services/branchApi';
import { useCreateAnnouncementMutation, useUpdateAnnouncementMutation } from './services/announcementApi';
import CreateBranch from '../Branch/CreateBranch';

dayjs.extend(customParseFormat);

const { Text } = Typography;
const { TextArea } = Input;

const CreateAnnouncement = ({
    open,
    onCancel,
    isEditing,
    initialValues,
}) => {
    const [form] = Form.useForm();
    const [messageApi] = message.useMessage();
    const [isCreateBranchModalOpen, setIsCreateBranchModalOpen] = useState(false);

    // API Mutations
    const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
    const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();

    // Get branches data from API
    const { data: branchesData, isLoading: branchesLoading } = useGetAllBranchesQuery();

    // Transform branches data
    const branches = React.useMemo(() => {
        if (!branchesData) return [];
        
        // If branchesData is array directly
        if (Array.isArray(branchesData)) {
            return branchesData.map(branch => ({
                value: branch.id,
                label: branch.branchName || branch.name || `Branch ${branch.id}`
            }));
        }
        
        // If branchesData has data property
        if (branchesData.data && Array.isArray(branchesData.data)) {
            return branchesData.data.map(branch => ({
                value: branch.id,
                label: branch.branchName || branch.name || `Branch ${branch.id}`
            }));
        }

        return [];
    }, [branchesData]);

    useEffect(() => {
        if (initialValues) {
            try {
                // Convert date strings to dayjs objects
                const date = initialValues.date ? dayjs(initialValues.date) : null;
                const time = initialValues.time ? dayjs(initialValues.time, 'HH:mm') : null;

                const formattedValues = {
                    ...initialValues,
                    date: date,
                    time: time,
                    branch: initialValues.branch ? JSON.parse(initialValues.branch).branch : []
                };

                form.setFieldsValue(formattedValues);
            } catch (error) {
                console.error('Error formatting form values:', error);
                form.resetFields();
            }
        } else {
            form.resetFields();
        }
    }, [initialValues, form]);

    const handleSubmit = async (values) => {
        try {
            // Format dates properly
            const formattedValues = {
                ...values,
                date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : null,
                time: values.time ? dayjs(values.time).format('HH:mm') : null,
                branch: {
                    branch: values.branch || []
                }
            };

            if (isEditing && initialValues?.id) {
                await updateAnnouncement({
                    id: initialValues.id,
                    data: formattedValues
                }).unwrap();
                message.success('Announcement updated successfully!');
            } else {
                await createAnnouncement(formattedValues).unwrap();
                message.success('Announcement created successfully!');
            }

            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('API Error:', error);
            message.error(error.data?.message || 'Failed to save announcement');
        }
    };

    const handleCreateBranchSuccess = async (newBranch) => {
        setIsCreateBranchModalOpen(false);
        message.success('Branch created successfully');
        if (newBranch?.id) {
            const currentBranches = form.getFieldValue('branch') || [];
            form.setFieldValue('branch', [...currentBranches, newBranch.id]);
        }
    };

    const dropdownRender = (menu) => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <div onClick={e => e.stopPropagation()}>
                <Button
                    type="primary"
                    icon={<FiPlus style={{ fontSize: '16px' }} />}
                    onClick={() => setIsCreateBranchModalOpen(true)}
                    style={{ 
                        width: '100%',
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        border: 'none',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
                        fontWeight: '500',
                        color: '#ffffff',
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
                width={720}
                destroyOnClose={true}
                centered
                closeIcon={null}
                className="announcement-form-modal"
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
                        background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
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
                            <FiFileText style={{ fontSize: '24px', color: '#ffffff' }} />
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
                                {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
                            </h2>
                            <Text
                                style={{
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                {isEditing
                                    ? 'Update announcement information'
                                    : 'Fill in the information to create announcement'}
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
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="title"
                                label={
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Title
                                    </span>
                                }
                                rules={[{ required: true, message: 'Please enter announcement title' }]}
                            >
                                <Input
                                    prefix={<FiFileText style={{ color: '#1890ff', fontSize: '16px' }} />}
                                    placeholder="Enter announcement title"
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
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="branch"
                                label={
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Branches
                                    </span>
                                }
                                rules={[{ required: true, message: 'Please select at least one branch' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select branches"
                                    size="large"
                                    listHeight={100}
                                    dropdownStyle={{
                                        Height: '100px',
                                        overflowY: 'auto',
                                        scrollbarWidth: 'thin',
                                        scrollBehavior: 'smooth'
                                    }}
                                    dropdownRender={dropdownRender}
                                    style={{
                                        borderRadius: '10px',
                                        height: '48px',
                                        backgroundColor: '#f8fafc',
                                    }}
                                    options={branches}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option?.label?.toLowerCase().includes(input.toLowerCase())
                                    }
                                    maxTagCount={2}
                                    maxTagTextLength={10}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label={
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Date
                                    </span>
                                }
                                rules={[{ required: true, message: 'Please select date' }]}
                            >
                                <DatePicker
                                    placeholder="Select date"
                                    size="large"
                                    style={{
                                        width: '100%',
                                        borderRadius: '10px',
                                        height: '48px',
                                        backgroundColor: '#f8fafc',
                                    }}
                                    suffixIcon={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                                    format="DD-MM-YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="time"
                                label={
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Time
                                    </span>
                                }
                                rules={[{ required: true, message: 'Please select time' }]}
                            >
                                <TimePicker
                                    placeholder="Select time"
                                    size="large"
                                    style={{
                                        width: '100%',
                                        borderRadius: '10px',
                                        height: '48px',
                                        backgroundColor: '#f8fafc',
                                    }}
                                    suffixIcon={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                                    format="HH:mm"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Description
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <TextArea
                            placeholder="Enter announcement description"
                            rows={4}
                            style={{
                                borderRadius: '10px',
                                padding: '12px 16px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                                transition: 'all 0.3s ease',
                                resize: 'none',
                            }}
                        />
                    </Form.Item>

                    <Divider style={{ margin: '24px 0' }} />

                    <div
                        className="form-footer"
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                        }}
                    >
                        <Button
                            size="large"
                            onClick={onCancel}
                            className="cancel-btn"
                            style={{
                                padding: '8px 24px',
                                height: '44px',
                                borderRadius: '10px',
                                border: '1px solid #e6e8eb',
                                fontWeight: '500',
                                minWidth: '120px',
                            }}
                            disabled={isCreating || isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="large"
                            type="primary"
                            htmlType="submit"
                            loading={isCreating || isUpdating}
                            className="create-btn"
                            style={{
                                padding: '8px 32px',
                                height: '44px',
                                borderRadius: '10px',
                                fontWeight: '500',
                                background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                                minWidth: '180px',
                            }}
                        >
                            {isEditing ? 'Update Announcement' : 'Create Announcement'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <CreateBranch
                open={isCreateBranchModalOpen}
                onCancel={() => setIsCreateBranchModalOpen(false)}
                onSubmit={handleCreateBranchSuccess}
                buttonStyle={{
                    cancel: {
                        padding: '8px 24px',
                        height: '44px',
                        borderRadius: '8px',
                        border: '1px solid #e6e8eb',
                        fontWeight: '500',
                    },
                    submit: {
                        padding: '8px 24px',
                        height: '44px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        border: 'none',
                        fontWeight: '500',
                    }
                }}
            />
        </>
    );
};

export default CreateAnnouncement; 