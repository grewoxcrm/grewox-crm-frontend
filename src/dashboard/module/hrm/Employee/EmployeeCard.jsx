import React from 'react';
import { Card, Avatar, Tag, Button, Dropdown, Menu, message } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiUserCheck, FiUser, FiEye, FiMail, FiCalendar, FiBriefcase, FiLogIn, FiUsers } from 'react-icons/fi';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useAdminLoginMutation } from '../../../../auth/services/authApi';
import { useGetRolesQuery } from '../role/services/roleApi';

const EmployeeCard = ({ employee, onEdit, onDelete, onView }) => {
    const navigate = useNavigate();
    const [adminLogin] = useAdminLoginMutation();
    const { data: rolesData } = useGetRolesQuery();

    const getRoleName = (role_id) => {
        if (!rolesData?.data) return 'Employee';
        const foundRole = rolesData.data.find(role => role.id === role_id);
        return foundRole ? foundRole.role_name : 'Employee';
    };

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
                color: '#D46B08', // Default to employee color
                bg: '#FFF7E6',
                border: '#FFD591'
            }
        };
        return roleColors[role?.toLowerCase()] || roleColors.default;
    };

    const getInitials = (name) => {
        return name
            ? name.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
            : 'E';
    };

    const handleAdminLogin = async () => {
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

    const getActionMenu = (record) => (
        <Menu className="action-menu">
            <Menu.Item key="view" icon={<FiEye />} onClick={() => onView(record)}>
                View Details
            </Menu.Item>
            <Menu.Item key="edit" icon={<FiEdit2 />} onClick={() => onEdit(record)}>
                Edit Employee
            </Menu.Item>
            <Menu.Item key="status" icon={<FiUserCheck />}>
                Change Status
            </Menu.Item>
            <Menu.Item key="delete" icon={<FiTrash2 />} danger onClick={() => onDelete(record)}>
                Delete Employee
            </Menu.Item>
        </Menu>
    );

    const roleName = getRoleName(employee.role_id);
    const roleStyle = getRoleColor(roleName);

    const getLoginButtonText = (roleName) => {
        if (!roleName) return 'Login as Employee';
        const formattedRole = roleName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        return `Login as ${formattedRole}`;
    };

    return (
        <Card
            className="employee-card modern-card"
            bordered={false}
            style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
                height: '100%',
                position: 'relative'
            }}
            actions={[
                <Button
                    type="primary"
                    icon={<FiLogIn />}
                    className="login-as-button"
                    block
                    onClick={handleAdminLogin}
                    style={{
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        border: 'none',
                        height: '40px',
                        borderRadius: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    {getLoginButtonText(roleName)}
                </Button>
            ]}
        >
            <div className="card-top-pattern" />

            <div className="employee-card-header">
                <div className="employee-main-info">
                    <Avatar
                        size={56}
                        src={employee.profilePic}
                        icon={!employee.profilePic && <FiUser />}
                        className="employee-avatar"
                        style={{
                            backgroundColor: !employee.profilePic ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                        }}
                    >
                        {!employee.profilePic && getInitials(employee.name)}
                    </Avatar>
                    <div className="employee-info">
                        <h3>{employee.name}</h3>
                        <div className="role-wrapper">
                            <div
                                className="role-indicator"
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: roleStyle.color,
                                    boxShadow: `0 0 8px ${roleStyle.color}`
                                }}
                            />
                            <Tag
                                style={{
                                    textTransform: 'capitalize',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    margin: 0,
                                    background: roleStyle.bg,
                                    border: `1px solid ${roleStyle.border}`,
                                    color: roleStyle.color,
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <FiUsers size={12} />
                                {roleName}
                            </Tag>
                        </div>
                    </div>
                </div>
                <Dropdown
                    overlay={getActionMenu(employee)}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-dropdown-button"
                    />
                </Dropdown>
            </div>

            <div className="employee-details">
                <div className="detail-item">
                    <FiMail className="detail-icon" />
                    <span className="detail-text">{employee.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                    <FiCalendar className="detail-icon" />
                    <div className="date-cell">
                        <span className="date">
                            {moment(employee.created_at).format('MMM DD, YYYY')}
                        </span>
                        <span className="time">
                            {moment(employee.created_at).format('h:mm A')}
                        </span>
                    </div>
                </div>
                {employee.updated_at && (
                    <div className="detail-item">
                        <FiCalendar className="detail-icon" />
                        <div className="date-cell">
                            <span className="date">
                                {moment(employee.updated_at).format('MMM DD, YYYY')}
                            </span>
                            <span className="time">
                                {moment(employee.updated_at).format('h:mm A')}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default EmployeeCard; 