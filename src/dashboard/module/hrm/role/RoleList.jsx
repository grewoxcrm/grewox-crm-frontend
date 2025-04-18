import React, { useState } from "react";
import { Table, Button, Tag, Space, Dropdown, Modal, Tabs, Row, Col, Typography, Tooltip, message, Input } from "antd";
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye, FiX, FiShield, FiCheck, FiPlus, FiEdit } from "react-icons/fi";
import EditRole from "./EditRole";

const { Text } = Typography;

const RoleList = ({ roles, onEdit, onDelete }) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewPermissionsModal, setViewPermissionsModal] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState(null);
    const [activeTab, setActiveTab] = useState('CRM');

    const modules = ['User Management', 'CRM', 'Communication', 'HRM', 'Job'];
    const subModules = {
        'User Management': [
            { key: 'extra-users-list', title: 'Users' },
            { key: 'extra-users-client-list', title: 'Clients' }
        ],
        CRM: [
            { key: 'dashboards-project-list', title: 'Project' },
            { key: 'dashboards-sales', title: 'Sales' },
            { key: 'dashboards-lead', title: 'Leads' },
            { key: 'dashboards-deal', title: 'Deals' },
            { key: 'dashboards-proposal', title: 'Proposal' },
            { key: 'dashboards-task', title: 'Task' },
            { key: 'dashboards-TaskCalendar', title: 'Task Calendar' },
            { key: 'dashboards-systemsetup', title: 'CRM System Setup' }
        ],
        // Communication: [
        //     { key: 'dashboards-mail', title: 'Mail' },
        //     { key: 'dashboards-chat', title: 'Chat' },
        //     { key: 'dashboards-calendar', title: 'Calendar' },
        // ],
        HRM: [
            { key: 'extra-hrm-employee', title: 'Employee' },
            { key: 'extra-hrm-payroll', title: 'Payroll' },
            { key: 'extra-hrm-performance-indicator', title: 'Indicator' },
            { key: 'extra-hrm-role', title: 'Role' },
            { key: 'extra-hrm-designation', title: 'Designation' },
            { key: 'extra-hrm-department', title: 'Department' },
            { key: 'extra-hrm-attendance-attendancelist', title: 'Attendance' },
            { key: 'extra-hrm-leave-leavelist', title: 'Leave Management' },
            { key: 'extra-hrm-meeting', title: 'Meeting' },
            { key: 'extra-hrm-announcement', title: 'Announcement' },
            { key: 'extra-hrm-jobs-joblist', title: 'Job' },
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

    const handleEdit = (role) => {
        if (!role?.id) {
            message.error("Cannot edit role: Missing ID");
            return;
        }
        onEdit?.(role);
    };

    const handleEditCancel = () => {
        setSelectedRole(null);
        setEditModalVisible(false);
    };

    const handleEditComplete = (updatedRole) => {
        setEditModalVisible(false);
        setSelectedRole(null);
        onEdit?.(updatedRole);
    };

    const showAllPermissions = (role) => {
        if (!role?.permissions) {
            message.warning("No permissions to display");
            return;
        }

        // Parse permissions if they're stored as a string
        let parsedPermissions;
        try {
            parsedPermissions = typeof role.permissions === 'string'
                ? JSON.parse(role.permissions)
                : role.permissions;

            // Find first module with permissions and set it as active
            for (const module of modules) {
                const hasPermissions = subModules[module]?.some(subModule => {
                    const perms = parsedPermissions[subModule.key];
                    return perms && perms[0]?.permissions?.length > 0;
                });
                if (hasPermissions) {
                    setActiveTab(module);
                    break;
                }
            }

            setSelectedRole(role);
            setSelectedPermissions(parsedPermissions);
            setViewPermissionsModal(true);
        } catch (error) {
            console.error('Error parsing permissions:', error);
            message.error("Failed to parse permissions");
        }
    };

    const handleClosePermissionsModal = () => {
        setViewPermissionsModal(false);
        setSelectedRole(null);
        setSelectedPermissions(null);
    };

    const renderFullPermissions = (permissions) => {
        if (!permissions) return <div>No Permissions</div>;

        try {
            return (
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
                                <Row className="permission-header" align="middle" style={{
                                    marginBottom: '16px',
                                    padding: '12px 16px',
                                    backgroundColor: '#fafafa',
                                    borderRadius: '8px',
                                }}>
                                    <Col span={8}>
                                        <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                                            Module Name
                                        </Text>
                                    </Col>
                                    <Col span={16}>
                                        <Row align="middle">
                                            {['View', 'Create', 'Update', 'Delete'].map(action => (
                                                <Col key={action} span={6} style={{
                                                    fontSize: '14px',
                                                    color: '#262626',
                                                    textAlign: 'center',
                                                    fontWeight: 500,
                                                }}>
                                                    {action}
                                                </Col>
                                            ))}
                                        </Row>
                                    </Col>
                                </Row>

                                {subModules[module]?.map(subModule => {
                                    const modulePerms = permissions[subModule.key]?.[0]?.permissions || [];

                                    return (
                                        <Row
                                            key={subModule.key}
                                            className="permission-row"
                                            align="middle"
                                            style={{
                                                padding: '12px 16px',
                                                borderBottom: '1px solid #f0f0f0',
                                                transition: 'background-color 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: '#fafafa',
                                                }
                                            }}
                                        >
                                            <Col span={8}>
                                                <Text style={{ fontSize: '14px', color: '#595959' }}>
                                                    {subModule.title}
                                                </Text>
                                            </Col>
                                            <Col span={16}>
                                                <Row align="middle" justify="space-around">
                                                    {['view', 'create', 'update', 'delete'].map(action => (
                                                        <Col key={action} span={6} style={{ textAlign: 'center' }}>
                                                            {modulePerms.includes(action) ? (
                                                                <FiCheck className="permission-check" />
                                                            ) : (
                                                                <div className="permission-empty" />
                                                            )}
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Col>
                                        </Row>
                                    );
                                })}
                            </div>
                        ),
                    }))}
                />
            );
        } catch (error) {
            console.error('Error rendering permissions:', error);
            return <div>Error displaying permissions</div>;
        }
    };

    const renderPermissionTags = (permissions, record) => {
        if (!permissions) return <Tag color="default">No Permissions</Tag>;

        try {
            const parsedPermissions = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
            const modules = Object.keys(parsedPermissions);
            const firstThreeModules = modules.slice(0, 3);

            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {firstThreeModules.map(moduleName => {
                        const modulePerms = parsedPermissions[moduleName][0]?.permissions || [];
                        const displayName = moduleName
                            .replace('dashboards-', '')
                            .replace('extra-pages-customersupports-', '')
                            .replace('extra-', '');

                        return (
                            <Tag
                                key={moduleName}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    background: '#1890ff',
                                    border: 'none',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    height: '36px'
                                }}
                            >
                                <span style={{ fontWeight: '500' }}>{displayName}</span>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    borderLeft: '1px solid rgba(255,255,255,0.3)',
                                    marginLeft: '4px',
                                    paddingLeft: '8px',
                                    height: '20px'
                                }}>
                                    {modulePerms.includes('view') && (
                                        <Tooltip title="View Permission">
                                            <FiEye size={16} style={{ cursor: 'pointer' }} />
                                        </Tooltip>
                                    )}
                                    {modulePerms.includes('create') && (
                                        <Tooltip title="Create Permission">
                                            <FiPlus size={16} style={{ cursor: 'pointer' }} />
                                        </Tooltip>
                                    )}
                                    {modulePerms.includes('update') && (
                                        <Tooltip title="Update Permission">
                                            <FiEdit size={16} style={{ cursor: 'pointer' }} />
                                        </Tooltip>
                                    )}
                                    {modulePerms.includes('delete') && (
                                        <Tooltip title="Delete Permission">
                                            <FiTrash2 size={16} style={{ cursor: 'pointer' }} />
                                        </Tooltip>
                                    )}
                                </span>
                            </Tag>
                        );
                    })}
                    <Tooltip title="View All Permissions">
                        <Button
                            type="primary"
                            icon={<FiEye size={16} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                showAllPermissions({
                                    ...record,
                                    permissions: parsedPermissions
                                });
                            }}
                            style={{
                                padding: '8px 12px',
                                height: '36px',
                                fontSize: '14px',
                                background: '#1890ff',
                                border: 'none',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '500',
                                boxShadow: 'none'
                            }}
                        >
                            <span>View All</span>
                            <Tag
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '4px',
                                    padding: '0 6px',
                                    fontSize: '12px',
                                    border: 'none',
                                    color: '#ffffff',
                                    margin: 0,
                                    height: '20px',
                                    lineHeight: '20px'
                                }}
                            >
                                {modules.length}
                            </Tag>
                        </Button>
                    </Tooltip>
                </div>
            );
        } catch (error) {
            console.error('Error rendering permission tags:', error);
            return <Tag color="default">Invalid Permissions</Tag>;
        }
    };

    const getActionMenu = (record) => {
        const items = [
            {
                key: 'edit',
                icon: <FiEdit2 style={{ fontSize: '14px', color: '#1890ff' }} />,
                label: 'Edit',
                onClick: (e) => {
                    e.domEvent.stopPropagation();
                    handleEdit(record);
                }
            }
        ];

        if (record.role_name !== 'super-admin' && record.role_name !== 'client') {
            items.push({
                key: 'delete',
                icon: <FiTrash2 style={{ fontSize: '14px', color: '#ff4d4f' }} />,
                label: 'Delete',
                onClick: (e) => {
                    e.domEvent.stopPropagation();
                    onDelete(record);
                }
            });
        }

        return items;
    };

    const columns = [
        {
            title: "Role",
            dataIndex: "role_name",
            key: "role_name",
            width: "20%",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search role name"
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                  />
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => confirm()}
                      size="small"
                      style={{ width: 90 }}
                    >
                      Filter
                    </Button>
                    <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                      Reset
                    </Button>
                  </Space>
                </div>
              ),
              onFilter: (value, record) =>
                record.role_name.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (text) => (
                <div style={{
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#262626'
                }}>
                    {text || "N/A"}
                </div>
            ),
        },
        {
            title: "Permissions",
            dataIndex: "permissions",
            key: "permissions",
            width: "65%",
            sorter: (a, b) => (a?.permissions || "").localeCompare(b?.permissions || ""),
            render: (permissions, record) => renderPermissionTags(permissions, record),
        },
        {
            title: "Action",
            key: "action",
            width: "15%",
            align: "center",
            render: (_, record) => (
                <Dropdown
                    menu={{ items: getActionMenu(record) }}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayStyle={{ minWidth: '120px' }}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical style={{ fontSize: '16px', color: '#8c8c8c' }} />}
                        style={{
                            padding: '4px 8px',
                            height: '32px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <>
            <Table
                dataSource={roles}
                columns={columns}
                rowKey={(record) => record.id}
                // loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: 10,
                    total: roles?.length,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    onChange: (page) => setCurrentPage(page),
                }}
                style={{
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
            />

            <Modal
                title={null}
                open={viewPermissionsModal}
                onCancel={handleClosePermissionsModal}
                footer={null}
                width={720}
                destroyOnClose={true}
                centered
                closeIcon={null}
                className="pro-modal custom-modal"
                styles={{
                    body: {
                        padding: 0,
                        borderRadius: "8px",
                        overflow: "hidden",
                    },
                }}
            >
                <div className="modal-header" style={{
                    background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    padding: "24px",
                    color: "#ffffff",
                    position: "relative",
                }}>
                    <Button
                        type="text"
                        onClick={handleClosePermissionsModal}
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
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                    }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <FiShield style={{ fontSize: "24px", color: "#ffffff" }} />
                        </div>
                        <div>
                            <h2 style={{
                                margin: "0",
                                fontSize: "24px",
                                fontWeight: "600",
                                color: "#ffffff",
                            }}>
                                {selectedRole?.role_name || 'Role'} Permissions
                            </h2>
                            <Text style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}>
                                View all permissions for this role
                            </Text>
                        </div>
                    </div>
                </div>

                <div className="permission-content" style={{
                    padding: "24px",
                    backgroundColor: "#ffffff",
                }}>
                    {renderFullPermissions(selectedPermissions)}
                </div>
            </Modal>
        </>
    );
};

export default RoleList; 