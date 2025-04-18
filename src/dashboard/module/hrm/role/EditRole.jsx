import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Tabs, Form, Row, Col, Checkbox, Typography, message } from 'antd';
import { FiX, FiShield } from 'react-icons/fi';
import './role.scss';

const { Text } = Typography;

const EditRole = ({ visible, onCancel, onSubmit, loading, initialValues }) => {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('Staff');
    const [selectedPermissions, setSelectedPermissions] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const modules = ['CRM', 'Sales', 'Purchase', 'User Management', 'HRM', 'Job'];

    const subModules = {
        CRM: [
            { key: 'dashboards-project-list', title: 'Project' },
            { key: 'dashboards-lead', title: 'Leads' },
            { key: 'dashboards-deal', title: 'Deals' },
            { key: 'dashboards-proposal', title: 'Proposal' },
            { key: 'dashboards-task', title: 'Task' },
            { key: 'dashboards-TaskCalendar', title: 'Task Calendar' },
            { key: 'dashboards-systemsetup', title: 'CRM System Setup' }
        ],
        Sales: [
            { key: 'dashboards-sales-product-services', title: 'Product & Services' },
            { key: 'dashboards-sales-customer', title: 'Customer' },
            { key: 'dashboards-sales-invoice', title: 'Invoice' },
            { key: 'dashboards-sales-revenue', title: 'Revenue' },
            { key: 'dashboards-sales-credit-notes', title: 'Credit Notes' }
        ],
        Purchase: [
            { key: 'dashboards-purchase-vendor', title: 'Vendor' },
            { key: 'dashboards-purchase-billing', title: 'Billing' },
            { key: 'dashboards-purchase-debit-note', title: 'Debit Note' }
        ],
        'User Management': [
            { key: 'extra-users-list', title: 'Users' },
            { key: 'extra-users-client-list', title: 'Clients' }
        ],
        // Communication: [
        //     { key: 'dashboards-mail', title: 'Mail' },
        //     { key: 'dashboards-chat', title: 'Chat' },
        //     { key: 'dashboards-calendar', title: 'Calendar' }
        // ],
        HRM: [
            { key: 'extra-hrm-employee', title: 'Employee' },
            { key: 'extra-hrm-payroll', title: 'PayRoll' },
            { key: 'extra-hrm-role', title: 'Role' },
            { key: 'extra-hrm-branch', title: 'Branch' },
            { key: 'extra-hrm-designation', title: 'Designation' },
            { key: 'extra-hrm-department', title: 'Department' },
            { key: 'extra-hrm-attendance-attendancelist', title: 'Attendance' },
            { key: 'extra-hrm-holiday', title: 'Holiday' },
            { key: 'extra-hrm-leave-leavelist', title: 'Leave Management' },
            { key: 'extra-hrm-meeting', title: 'Meeting' },
            { key: 'extra-hrm-announcement', title: 'Announcement' },
            { key: 'extra-hrm-document', title: 'Document' },
            { key: 'extra-hrm-trainingSetup', title: 'Training Setup' }
        ],
        Job: [
            { key: 'extra-hrm-jobs-joblist', title: 'Jobs' },
            { key: 'extra-hrm-jobs-jobcandidate', title: 'Job Candidates' },
            { key: 'extra-hrm-jobs-jobonbording', title: 'Job On-Boarding' },
            { key: 'extra-hrm-jobs-jobapplication', title: 'Job Applications' },
            { key: 'extra-hrm-jobs-jobofferletter', title: 'Offer Letters' },
            { key: 'extra-hrm-jobs-interview', title: 'Interviews' }
        ]
    };

    const permissions = ['view', 'create', 'update', 'delete'];

    // Reset form and state when modal becomes invisible
    useEffect(() => {
        let timeoutId;
        if (!visible) {
            form.resetFields();
            setSelectedPermissions({});
            setActiveTab('Staff');
            setIsSubmitting(false);
        } else {
            // Only initialize when becoming visible with a small delay
            timeoutId = setTimeout(() => {
                initializeForm();
            }, 100);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [visible, form]);

    // Handle initial values with proper cleanup
    const initializeForm = () => {
        if (!initialValues) return;

        try {
            const formattedPermissions = {};

            // Initialize all permissions as false
            modules.forEach(module => {
                subModules[module]?.forEach(subModule => {
                    formattedPermissions[subModule.key] = {
                        view: false,
                        create: false,
                        update: false,
                        delete: false
                    };
                });
            });

            // Parse and set permissions from initialValues
            if (initialValues.permissions) {
                const parsedPermissions = typeof initialValues.permissions === 'string'
                    ? JSON.parse(initialValues.permissions)
                    : initialValues.permissions;

                Object.entries(parsedPermissions).forEach(([key, value]) => {
                    if (value && value[0] && value[0].permissions) {
                        const perms = value[0].permissions;
                        formattedPermissions[key] = {
                            view: perms.includes('view'),
                            create: perms.includes('create'),
                            update: perms.includes('update'),
                            delete: perms.includes('delete')
                        };
                    }
                });

                // Find first module with permissions and set it as active
                for (const module of modules) {
                    const hasPermissions = subModules[module]?.some(subModule => {
                        const perms = formattedPermissions[subModule.key];
                        return perms && Object.values(perms).some(Boolean);
                    });
                    if (hasPermissions) {
                        setActiveTab(module);
                        break;
                    }
                }
            }

            form.setFieldsValue({
                id: initialValues.id,
                role_name: initialValues.role_name,
                permissions: formattedPermissions
            });
            setSelectedPermissions(formattedPermissions);
        } catch (error) {
            console.error('Error initializing form:', error);
            message.error('Failed to initialize form data');
        }
    };

    const handlePermissionChange = () => {
        const values = form.getFieldsValue();
        setSelectedPermissions(values.permissions || {});
    };

    const handleCancel = () => {
        form.resetFields();
        setSelectedPermissions({});
        setActiveTab('Staff');
        setIsSubmitting(false);
        onCancel?.();
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const values = await form.validateFields();

            // Format permissions for API
            const formattedPermissions = {};
            Object.entries(values.permissions || {}).forEach(([moduleKey, permissions]) => {
                if (permissions) {
                    const enabledPermissions = Object.entries(permissions)
                        .filter(([_, enabled]) => enabled)
                        .map(([permission]) => permission);

                    if (enabledPermissions.length > 0) {
                        formattedPermissions[moduleKey] = [{
                            key: moduleKey,
                            permissions: enabledPermissions
                        }];
                    }
                }
            });

            // Submit with properly formatted data
            await onSubmit({
                id: values.id || initialValues?.id,
                role_name: values.role_name,
                permissions: formattedPermissions
            });

        } catch (error) {
            console.error('Validation failed:', error);
            message.error('Failed to save changes');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModuleSelectAll = (module, checked) => {
        const newValues = { ...form.getFieldsValue() };
        if (!newValues.permissions) newValues.permissions = {};

        // Get all submodules for this module
        const moduleSubModules = subModules[module] || [];

        // Update all permissions for all submodules in this module
        moduleSubModules.forEach(subModule => {
            newValues.permissions[subModule.key] = {
                view: checked,
                create: checked,
                update: checked,
                delete: checked
            };
        });

        form.setFieldsValue(newValues);
        handlePermissionChange();
    };

    const isModuleFullySelected = (module) => {
        const values = form.getFieldsValue().permissions || {};
        const moduleSubModules = subModules[module] || [];

        return moduleSubModules.every(subModule =>
            permissions.every(permission =>
                values[subModule.key]?.[permission] === true
            )
        );
    };

    const isModuleIndeterminate = (module) => {
        const values = form.getFieldsValue().permissions || {};
        const moduleSubModules = subModules[module] || [];

        const hasSelected = moduleSubModules.some(subModule =>
            permissions.some(permission =>
                values[subModule.key]?.[permission] === true
            )
        );

        const hasUnselected = moduleSubModules.some(subModule =>
            permissions.some(permission =>
                values[subModule.key]?.[permission] !== true
            )
        );

        return hasSelected && hasUnselected;
    };

    const handleRowSelectAll = (subModuleKey, checked) => {
        const newValues = { ...form.getFieldsValue() };
        if (!newValues.permissions) newValues.permissions = {};

        // Set all permissions for this submodule
        newValues.permissions[subModuleKey] = {
            view: checked,
            create: checked,
            update: checked,
            delete: checked
        };

        form.setFieldsValue(newValues);
        handlePermissionChange();
    };

    const isRowFullySelected = (subModuleKey) => {
        const values = form.getFieldsValue().permissions || {};
        return values[subModuleKey] &&
            permissions.every(perm => values[subModuleKey][perm] === true);
    };

    const isRowIndeterminate = (subModuleKey) => {
        const values = form.getFieldsValue().permissions || {};
        if (!values[subModuleKey]) return false;

        const hasSelected = permissions.some(perm => values[subModuleKey][perm] === true);
        const hasUnselected = permissions.some(perm => values[subModuleKey][perm] !== true);

        return hasSelected && hasUnselected;
    };

    const handlePermissionClick = (subModuleKey, permission, checked) => {
        const newValues = { ...form.getFieldsValue() };
        if (!newValues.permissions) newValues.permissions = {};
        if (!newValues.permissions[subModuleKey]) {
            newValues.permissions[subModuleKey] = {
                view: false,
                create: false,
                update: false,
                delete: false
            };
        }

        newValues.permissions[subModuleKey][permission] = checked;
        form.setFieldsValue(newValues);
        handlePermissionChange();
    };

    const renderPermissionColumns = (subModule) => (
        <>
            <Col span={4} style={{ paddingLeft: 8 }}>
                <Form.Item style={{ margin: 0 }}>
                    <Checkbox
                        checked={isRowFullySelected(subModule.key)}
                        indeterminate={isRowIndeterminate(subModule.key)}
                        onChange={(e) => handleRowSelectAll(subModule.key, e.target.checked)}
                        className="row-select-all"
                    >
                        All
                    </Checkbox>
                </Form.Item>
            </Col>
            {permissions.map(permission => (
                <Col span={5} key={permission}>
                    <Form.Item
                        name={['permissions', subModule.key, permission]}
                        valuePropName="checked"
                        style={{ margin: 0 }}
                    >
                        <Checkbox
                            onChange={(e) => handlePermissionClick(subModule.key, permission, e.target.checked)}
                        >
                            {permission}
                        </Checkbox>
                    </Form.Item>
                </Col>
            ))}
        </>
    );

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={720}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="role-modal"
            maskClosable={false}
            keyboard={false}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: 8,
                    overflow: 'hidden'
                }
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    padding: "24px",
                    color: "#ffffff",
                    position: "relative",
                }}
            >
                <Button
                    type="text"
                    onClick={handleCancel}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        color: "#ffffff",
                        width: "32px",
                        height: "32px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                    }}
                >
                    <FiX style={{ fontSize: "20px" }} />
                </Button>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <FiShield style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: "0",
                                fontSize: "24px",
                                fontWeight: "600",
                                color: "#ffffff",
                            }}
                        >
                            Edit Role
                        </h2>
                        <Text
                            style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            Modify role details and permissions
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onValuesChange={handlePermissionChange}
                style={{ padding: "24px" }}
            >
                <Form.Item name="id" hidden>
                    <Input />
                </Form.Item>

                <div
                    style={{
                        display: "grid",
                        gap: "24px",
                        marginBottom: "24px",
                    }}
                >
                    <Form.Item
                        name="role_name"
                        label={
                            <span
                                style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                }}
                            >
                                Role Name
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter role name' }]}
                    >
                        <Input
                            placeholder="Enter Role Name"
                            size="large"
                            style={{
                                borderRadius: "10px",
                                padding: "8px 16px",
                                height: "48px",
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e6e8eb",
                                transition: "all 0.3s ease",
                            }}
                        />
                    </Form.Item>

                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        type="card"
                        className="custom-tabs"
                        items={modules.map(module => ({
                            key: module,
                            label: module,
                            children: (
                                <div className="permission-section">
                                    <Row className="permission-header" align="middle">
                                        <Col span={8}>
                                            <Checkbox
                                                checked={isModuleFullySelected(module)}
                                                indeterminate={isModuleIndeterminate(module)}
                                                onChange={(e) => handleModuleSelectAll(module, e.target.checked)}
                                                className="module-select-all"
                                            >
                                                {module}
                                            </Checkbox>
                                        </Col>
                                        <Col span={16}>
                                            <Row align="middle">
                                                <Col span={4} style={{ paddingLeft: 8 }}>All</Col>
                                                {permissions.map(perm => (
                                                    <Col span={5} key={perm} style={{ textTransform: 'capitalize' }}>
                                                        {perm}
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Col>
                                    </Row>
                                    {subModules[module]?.map(subModule => (
                                        <Row key={subModule.key} className="permission-row" align="middle">
                                            <Col span={8} style={{ paddingLeft: 24 }}>
                                                {subModule.title}
                                            </Col>
                                            <Col span={16}>
                                                <Row align="middle">
                                                    {renderPermissionColumns(subModule)}
                                                </Row>
                                            </Col>
                                        </Row>
                                    ))}
                                </div>
                            )
                        }))}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                    }}
                >
                    <Button
                        size="large"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        style={{
                            padding: "8px 24px",
                            height: "44px",
                            borderRadius: "10px",
                            border: "1px solid #e6e8eb",
                            fontWeight: "500",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        onClick={handleSubmit}
                        loading={loading || isSubmitting}
                        disabled={isSubmitting}
                        style={{
                            padding: "8px 32px",
                            height: "44px",
                            borderRadius: "10px",
                            fontWeight: "500",
                            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                        }}
                    >
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditRole;