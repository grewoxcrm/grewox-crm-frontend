import React from 'react';
import { Card, Avatar, Tag, Button, Dropdown, Menu, message } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiUserCheck, FiLock, FiUser, FiUsers, FiEye, FiMail, FiCalendar, FiLogIn } from 'react-icons/fi';
import moment from 'moment';
import { useAdminLoginMutation } from '../../../../auth/services/authApi';
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user, onEdit, onDelete, onView }) => {
    const navigate = useNavigate();
    const [adminLogin] = useAdminLoginMutation();

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

    const handleAdminLogin = async () => {
        try {
            const response = await adminLogin({
                email: user.email,
                isClientPage: true
            }).unwrap();

            if (response.success) {
                message.success('Logged in as user successfully');
                navigate('/dashboard');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to login as user');
        }
    };

    const getActionMenu = (record) => (
        <Menu className="action-menu">
            <Menu.Item key="view" icon={<FiEye />} onClick={() => onView(record)}>
                View Details
            </Menu.Item>
            <Menu.Item key="edit" icon={<FiEdit2 />} onClick={() => onEdit(record)}>
                Edit User
            </Menu.Item>
            <Menu.Item key="resetPassword" icon={<FiLock />}>
                Reset Password
            </Menu.Item>
            <Menu.Item key="status" icon={<FiUserCheck />}>
                Change Status
            </Menu.Item>
            {user.role_name !== 'Super Admin' && (
                <Menu.Item key="delete" icon={<FiTrash2 />} danger onClick={() => onDelete(record)}>
                    Delete User
                </Menu.Item>
            )}
        </Menu>
    );

    const roleStyle = getRoleColor(user.role_name);

    const getLoginButtonText = (roleName) => {
        if (!roleName) return 'Login as User';
        const formattedRole = roleName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        return `Login as ${formattedRole}`;
    };

    return (
        <Card
            className="user-card modern-card"
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
                    {getLoginButtonText(user.role_name)}
                </Button>
            ]}
        >
            <div className="card-top-pattern" />

            <div className="user-card-header">
                <div className="user-main-info">
                    <Avatar
                        size={56}
                        src={user.profilePic}
                        icon={!user.profilePic && <FiUser />}
                        className="user-avatar"
                        style={{
                            backgroundColor: !user.profilePic ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                        }}
                    >
                        {!user.profilePic && getInitials(user.username)}
                    </Avatar>
                    <div className="user-info">
                        <h3>{user.username}</h3>
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
                                {user.role_name || 'N/A'}
                            </Tag>
                        </div>
                    </div>
                </div>
                <Dropdown
                    overlay={getActionMenu(user)}
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

            <div className="user-details">
                <div className="detail-item">
                    <FiMail className="detail-icon" />
                    <span className="detail-text">{user.email}</span>
                </div>
                <div className="detail-item">
                    <FiCalendar className="detail-icon" />
                    <div className="date-cell">
                        <span className="date">
                            {moment(user.created_at).format('MMM DD, YYYY')}
                        </span>
                        <span className="time">
                            {moment(user.created_at).format('h:mm A')}
                        </span>
                    </div>
                </div>
                {user.updated_at && (
                    <div className="detail-item">
                        <FiCalendar className="detail-icon" />
                        <div className="date-cell">
                            <span className="date">
                                {moment(user.updated_at).format('MMM DD, YYYY')}
                            </span>
                            <span className="time">
                                {moment(user.updated_at).format('h:mm A')}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default UserCard; 