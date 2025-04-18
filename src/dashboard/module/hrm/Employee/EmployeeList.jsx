import React, { useMemo, useState, useEffect } from 'react';
import { Table, Button, Tag, Dropdown, Menu, Avatar, message, Input, Space, Switch } from 'antd';
import {
    FiEdit2, FiTrash2, FiMoreVertical, FiUserCheck, FiLock, FiUser, FiEye, FiShield, FiBriefcase, FiUsers, FiLogIn,
    FiGitBranch, FiGrid, FiAward, FiMapPin, FiLayers, FiCpu, FiDollarSign
} from 'react-icons/fi';
import moment from 'moment';
import { useGetRolesQuery } from '../role/services/roleApi'; // Adjust the import path as needed
import { useGetAllBranchesQuery } from '../Branch/services/branchApi'; // Add this import
import { useGetEmployeesQuery } from './services/employeeApi';
import { useGetAllDepartmentsQuery } from '../Department/services/departmentApi';
import { useGetAllDesignationsQuery } from '../Designation/services/designationApi';
import { useNavigate } from 'react-router-dom';
import { useAdminLoginMutation } from '../../../../auth/services/authApi';
import { useGetSalaryQuery, useUpdateSalaryMutation } from '../payRoll/services/salaryApi';

// Define styles outside the component
const switchStyles = `
  .status-switch.ant-switch {
    min-width: 40px;
    height: 22px;
    background: #faad14;
    padding: 0 2px;
  }

  .status-switch.ant-switch .ant-switch-handle {
    width: 18px;
    height: 18px;
    top: 2px;
    left: 2px;
    transition: all 0.2s ease-in-out;
  }

  .status-switch.ant-switch.ant-switch-checked .ant-switch-handle {
    left: calc(100% - 20px);
  }

  .status-switch.ant-switch.paid {
    background: #52c41a;
  }

  .status-switch.ant-switch:not(.ant-switch-disabled) {
    background-color: #faad14;
  }

  .status-switch.ant-switch.paid:not(.ant-switch-disabled) {
    background: #52c41a;
  }

  .status-switch.ant-switch:focus {
    box-shadow: none;
  }

  .status-switch.ant-switch .ant-switch-handle::before {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const EmployeeList = ({ employees, onEdit, onDelete, onView }) => {
    const navigate = useNavigate();
    const [adminLogin] = useAdminLoginMutation();
    const [loading, setLoading] = useState(false);
    const [updateSalary] = useUpdateSalaryMutation();

    // Fetch roles data
    const { data: rolesData } = useGetRolesQuery();

    // Add branch data fetch
    const { data: branchesData } = useGetAllBranchesQuery();
    const { data: departmentsData } = useGetAllDepartmentsQuery();
    const { data: designationsData } = useGetAllDesignationsQuery();
    const { data: salaryData } = useGetSalaryQuery();

    // Function to get role name from role_id
    const getRoleName = (role_id) => {
        console.log(role_id)
        if (!rolesData?.data) return 'N/A';
        const foundRole = rolesData.data.find(role => role.id === role_id);
        return foundRole ? foundRole.role_name : 'N/A';
    };

    // Helper functions to find names using find method
    const getBranchName = (branchId) => {
        const branch = branchesData?.data?.find(b => b.id === branchId);
        return branch ? branch.branchName : 'N/A';
    };

    const getDepartmentName = (departmentId) => {
        const department = departmentsData?.find(d => d.id === departmentId);
        return department ? department.department_name : 'N/A';
    };

    const getDesignationName = (designationId) => {
        const designation = designationsData?.find(d => d.id === designationId);
        return designation ? designation.designation_name : 'N/A';
    };

    // Function to get badge style based on type
    const getBadgeStyle = (type, value) => {
        const styles = {
            branch: {
                color: '#1890FF',
                bg: '#E6F7FF',
                border: '#91D5FF'
            },
            department: {
                color: '#722ED1',
                bg: '#F9F0FF',
                border: '#D3ADF7'
            },
            designation: {
                color: '#13C2C2',
                bg: '#E6FFFB',
                border: '#87E8DE'
            }
        };

        return styles[type] || styles.branch;
    };

    // Update the role color mapping to match user management
    const getRoleColor = (role) => {
        const roleColors = {
            'super-admin': {
                color: '#531CAD',
                bg: '#F9F0FF',
                border: '#D3ADF7'
            },
            'client': {
                color: '#08979C',
                bg: '#E6FFFB',
                border: '#87E8DE'
            },
            'sub-client': {
                color: '#389E0D',
                bg: '#F6FFED',
                border: '#B7EB8F'
            },
            'employee': {
                color: '#D46B08',
                bg: '#FFF7E6',
                border: '#FFD591'
            },
            'default': {
                color: '#595959',
                bg: '#FAFAFA',
                border: '#D9D9D9'
            }
        };
        return roleColors[role?.toLowerCase()] || roleColors.default;
    };

    const getInitials = (username) => {
        return username
            ? username.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
            : 'U';
    };

    const handleEmployeeLogin = async (employee) => {
        try {
            const response = await adminLogin({
                email: employee.email,
                isClientPage: true
            }).unwrap();

            if (response.success) {
                message.success('Logged in as employee successfully');
                navigate('/dashboard');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to login as employee');
        }
    };

    const handleSalaryStatusChange = async (checked, salaryId) => {
        try {
            setLoading(true);
            const response = await updateSalary({
                id: salaryId,
                data: {
                    status: checked ? 'paid' : 'unpaid'
                }
            }).unwrap();

            if (response.success) {
                message.success(`Payment status updated to ${checked ? 'paid' : 'unpaid'}`);
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            message.error(error?.data?.message || 'Failed to update payment status');
        } finally {
            setLoading(false);
        }
    };

    const getEmployeeSalary = (employeeId) => {
        if (!salaryData?.data) return null;
        return salaryData.data.find(salary => salary.employeeId === employeeId);
    };

    const getActionMenu = (record) => (
        <Menu className="action-menu">
            <Menu.Item
                key="view"
                icon={<FiEye />}
                onClick={() => onView(record)}
            >
                View Details
            </Menu.Item>
            <Menu.Item
                key="edit"
                icon={<FiEdit2 />}
                onClick={() => onEdit(record)}
            >
                Edit Employee
            </Menu.Item>
            <Menu.Item
                key="login"
                icon={<FiLogIn />}
                onClick={() => handleEmployeeLogin(record)}
            >
                Login as Employee
            </Menu.Item>
            <Menu.Item
                key="status"
                icon={<FiUserCheck />}
                onClick={() => console.log('Change status')}
            >
                Change Status
            </Menu.Item>
            <Menu.Item
                key="delete"
                icon={<FiTrash2 />}
                danger
                onClick={() => onDelete(record)}
            >
                Delete Employee
            </Menu.Item>
        </Menu>
    );

    const getItemStyle = (type) => {
        const styles = {
            branch: {
                color: '#2563EB',
                icon: <FiGitBranch className="item-icon" />,
            },
            department: {
                color: '#7C3AED',
                icon: <FiGrid className="item-icon" />,
            },
            designation: {
                color: '#EA580C',
                icon: <FiAward className="item-icon" />,
            }
        };
        return styles[type];
    };

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profilePic',
            key: 'profilePic',
            sorter: (a, b) => (a.profilePic || '').localeCompare(b.profilePic || ''),
            render: (profilePic, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        size={40}
                        src={profilePic}
                        icon={!profilePic && <FiUser />}
                        style={{
                            backgroundColor: !profilePic ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {!profilePic && getInitials(record.name)}
                    </Avatar>
                </div>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search name"
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
                record.name.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (text) => (
                <div style={{
                    fontWeight: 500,
                    color: '#262626',
                    fontSize: '14px'
                }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role_id',
            key: 'role_id',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search role"
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
                record.roleName.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (role_id) => {
                const roleName = getRoleName(role_id);
                const roleStyle = getRoleColor(roleName);
                return (
                    <div className="role-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            className="role-indicator"
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: roleStyle.color,
                                boxShadow: `0 0 8px ${roleStyle.color}`,
                            }}
                        />
                        <span className="custom-badge" style={{
                            color: roleStyle.color,
                            backgroundColor: roleStyle.bg,
                            border: `1px solid ${roleStyle.border}`,
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            display: 'inline-block',
                            lineHeight: '1.4',
                            transition: 'all 0.3s ease'
                        }}>
                            {roleName}
                        </span>
                    </div>
                );
            },

        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search branch"
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
                record.branchName.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (branchId) => {
                const branchName = getBranchName(branchId);
                const style = getItemStyle('branch');
                return (
                    <div className="item-wrapper">
                        <div className="item-content">
                            <div className="icon-wrapper" style={{
                                color: style.color,
                                background: `${style.color}15`
                            }}>
                                {style.icon}
                            </div>
                            <div className="info-wrapper">
                                <div className="name" style={{
                                    color: style.color,
                                    fontWeight: 600,
                                    fontSize: '14px'
                                }}>
                                    {branchName}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search department"
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
                record.departmentName.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (departmentId) => {
                const departmentName = getDepartmentName(departmentId);
                const style = getItemStyle('department');
                return (
                    <div className="item-wrapper">
                        <div className="item-content">
                            <div className="icon-wrapper" style={{
                                color: style.color,
                                background: `${style.color}15`
                            }}>
                                {style.icon}
                            </div>
                            <div className="info-wrapper">
                                <div className="name" style={{
                                    color: style.color,
                                    fontWeight: 600,
                                    fontSize: '14px'
                                }}>
                                    {departmentName}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Designation',
            dataIndex: 'designation',
            key: 'designation',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search designation"
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
                record.designationName.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (designationId) => {
                const designationName = getDesignationName(designationId);
                const style = getItemStyle('designation');
                return (
                    <div className="item-wrapper">
                        <div className="item-content">
                            <div className="icon-wrapper" style={{
                                color: style.color,
                                background: `${style.color}15`
                            }}>
                                {style.icon}
                            </div>
                            <div className="info-wrapper">
                                <div className="name" style={{
                                    color: style.color,
                                    fontWeight: 600,
                                    fontSize: '14px'
                                }}>
                                    {designationName}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Salary Status',
            key: 'salaryStatus',
            width: 200,
            render: (_, record) => {
                const salaryInfo = getEmployeeSalary(record.id);
                return (
                    <div className="salary-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {salaryInfo ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ color: '#52c41a', fontSize: '14px' }}>₹</span>
                                    <span style={{ fontWeight: 500 }}>
                                        {Number(salaryInfo.salary || 0).toLocaleString('en-IN', {
                                            maximumFractionDigits: 2,
                                            minimumFractionDigits: 2
                                        })}
                                    </span>
                                    <span style={{ color: '#8c8c8c', fontSize: '13px' }}>INR</span>
                                </div>
                                <Switch
                                    size="small"
                                    checked={salaryInfo.status === 'paid'}
                                    onChange={(checked) => handleSalaryStatusChange(checked, salaryInfo.id)}
                                    loading={loading}
                                    className={`status-switch ${salaryInfo.status === 'paid' ? 'paid' : ''}`}
                                />
                                <Tag
                                    color={salaryInfo.status === 'paid' ? 'success' : 'warning'}
                                    style={{
                                        margin: 0,
                                        textTransform: 'capitalize',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        padding: '0 8px',
                                        height: '22px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {salaryInfo.status}
                                </Tag>
                            </>
                        ) : (
                            <Tag
                                color="default"
                                style={{
                                    margin: 0,
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    padding: '0 8px',
                                    height: '22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: '#f5f5f5',
                                    border: 'none',
                                    color: '#8c8c8c'
                                }}
                            >
                                No Salary Info
                            </Tag>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '120px',
            align: 'center',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Button
                        type="primary"
                        icon={<FiLogIn size={14} />}
                        size="small"
                        onClick={() => handleEmployeeLogin(record)}
                        className="login-button"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            height: '32px',
                            padding: '0 12px',
                            borderRadius: '6px',
                            fontWeight: 500,
                            background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                            border: 'none',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
                            fontSize: '13px'
                        }}
                    >
                        Login
                    </Button>
                    <Dropdown
                        overlay={getActionMenu(record)}
                        trigger={['click']}
                        placement="bottomRight"
                        overlayClassName="user-actions-dropdown"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical size={16} />}
                            className="action-button"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown>
                </div>
            ),
        },
    ];

    // Transform the employees data with role names
    const transformedEmployees = useMemo(() => {
        if (!employees) return [];
        return employees.map(emp => ({
            ...emp,
            key: emp.id,
            name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            branchName: getBranchName(emp.branch),
            departmentName: getDepartmentName(emp.department),
            designationName: getDesignationName(emp.designation),
            roleName: getRoleName(emp.role_id) // Add role name to transformed data
        }));
    }, [employees, branchesData, departmentsData, designationsData, rolesData]); // Add rolesData to dependencies

    useEffect(() => {
        // Add styles to head
        const styleElement = document.createElement('style');
        styleElement.innerHTML = switchStyles;
        document.head.appendChild(styleElement);

        return () => {
            // Cleanup styles on unmount
            document.head.removeChild(styleElement);
        };
    }, []);

    return (
        <Table
            columns={columns}
            dataSource={transformedEmployees} // Use transformed data
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} employees`,
            }}
            className="custom-table"
            scroll={{ x: 1000 }}
            style={{
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
        />
    );
};

export default EmployeeList;
