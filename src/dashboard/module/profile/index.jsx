import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Card,
    Typography,
    Breadcrumb,
    Divider,
    Row,
    Col,
    Badge,
    Button,
    message,
    Spin
} from 'antd';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiHome,
    FiMapPin,
    FiShield,
    FiSettings,
    FiMap,
    FiGlobe,
} from 'react-icons/fi';
import { selectCurrentUser, selectUserRole } from '../../../auth/services/authSlice';
import './profile.scss';
import EditProfileModal from './EditProfileModal';

const { Title, Text } = Typography;

// Helper functions
const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const formatRole = (role) => {
    if (!role || typeof role !== 'string') return 'User';
    if (role === 'client') return 'Company';
    return role.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

const getUserFullName = (user) => {
    if (user?.firstName && user?.lastName) {
        return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || 'User';
};

const ProfileHeader = ({ user, userRole, onEditClick }) => {
    return (
        <div className="profile-header">
            <div className="profile-header-content">
                <div className="profile-avatar-container">
                    <Badge dot status="success" offset={[-10, 106]} className="status-badge">
                        <div className="profile-avatar">
                            {user?.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={getUserFullName(user)}
                                />
                            ) : (
                                <div className="avatar-initials">
                                    {getInitials(getUserFullName(user))}
                                </div>
                            )}
                        </div>
                    </Badge>
                </div>
                <div className="profile-title">
                    <Title level={3}>{getUserFullName(user)}</Title>
                    <Text className="username">@{user?.username || 'user'}</Text>
                    <div className="role-badge">
                        <FiShield />
                        {formatRole(userRole)}
                    </div>
                </div>
            </div>
            <div className="profile-actions">
                <Button type="primary" icon={<FiSettings />} onClick={onEditClick}>
                    Edit Profile
                </Button>
            </div>
        </div>
    );
};

const PersonalInfo = ({ user }) => {
    const infoItems = [
        { icon: FiUser, label: 'First Name', value: user?.firstName || 'Not provided' },
        { icon: FiUser, label: 'Last Name', value: user?.lastName || 'Not provided' },
        { icon: FiMail, label: 'Email', value: user?.email },
        { icon: FiPhone, label: 'Phone', value: user?.phone || 'Not provided' },
    ];

    return (
        <div className="profile-info-section">
            <Title level={4}>Personal Information</Title>
            <Row gutter={[24, 24]}>
                {infoItems.map((item, index) => (
                    <Col xs={24} sm={12} key={index}>
                        <div className="info-item">
                            <div className="info-label">
                                <item.icon className="info-icon" />
                                <Text type="secondary">{item.label}</Text>
                            </div>
                            <Text strong>{item.value}</Text>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

const AdditionalInfo = ({ user, userRole }) => {
    const infoItems = [

        {
            icon: FiMapPin,
            label: 'Address',
            value: user?.address || 'Not provided'
        },
        {
            icon: FiHome,
            label: 'City',
            value: user?.city || 'Not provided'
        },
        {
            icon: FiMap,
            label: 'State',
            value: user?.state || 'Not provided'
        },
        {
            icon: FiGlobe,
            label: 'Country',
            value: user?.country || 'Not provided'
        },
        {
            icon: FiMapPin,
            label: 'Zip Code',
            value: user?.zipCode || 'Not provided'
        },
        {
            icon: FiShield,
            label: 'Role',
            value: formatRole(userRole)
        },
    ];

    return (
        <div className="profile-info-section">
            <Title level={4}>Additional Information</Title>
            <Row gutter={[24, 24]}>
                {infoItems.map((item, index) => (
                    <Col xs={24} sm={12} key={index}>
                        <div className="info-item">
                            <div className="info-label">
                                <item.icon className="info-icon" />
                                <Text type="secondary">{item.label}</Text>
                            </div>
                            <Text strong>{item.value}</Text>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

const Profile = () => {
    const user = useSelector(selectCurrentUser);
    const userRole = useSelector(selectUserRole);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const handleEditProfile = () => {
        setIsEditModalVisible(true);
    };

    const handleCancelEdit = () => {
        setIsEditModalVisible(false);
    };

    const handleSubmitEdit = async (formData) => {
        try {
            // Add your update profile API call here
            // await updateProfile(formData);
            message.success('Profile updated successfully');
            setIsEditModalVisible(false);
        } catch (error) {
            message.error('Failed to update profile');
        }
    };

    return (
        <div className="profile-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Profile</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>My Profile</Title>
                    <Text type="secondary">View and manage your account information</Text>
                </div>
            </div>

            <Card className="profile-details-card">
                <ProfileHeader
                    user={user}
                    userRole={userRole}
                    onEditClick={handleEditProfile}
                />
                <Divider />
                <PersonalInfo user={user} />
                <Divider />
                <AdditionalInfo user={user} userRole={userRole} />
            </Card>

            <EditProfileModal
                visible={isEditModalVisible}
                onCancel={handleCancelEdit}
                onSubmit={handleSubmitEdit}
                initialValues={user}
            />
        </div>
    );
};

export default Profile;
