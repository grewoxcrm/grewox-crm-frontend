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
    FiCalendar,
    FiMapPin,
    FiShield,
    FiSettings,
    FiChevronRight
} from 'react-icons/fi';
import { selectCurrentUser, selectUserRole } from '../../../auth/services/authSlice';
import { useUpdateSuperAdminProfileMutation, useGetSuperAdminProfileQuery } from './services/superadminProfileApi';
import { resetUpdateStatus } from './services/superadminProfileSlice';
import EditProfileModal from './EditProfileModal';
import './profile.scss';

const { Title, Text } = Typography;


// Helper functions
const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const formatRole = (role) => {
    if (!role || typeof role !== 'string') return 'User';
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
                    <Text className="username">@{user?.username || 'superadmin'}</Text>
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
            label: 'Location',
            value: user?.location || 'Not provided'
        },
        {
            icon: FiShield,
            label: 'Role',
            value: formatRole(userRole)
        }
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
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const userRole = useSelector(selectUserRole);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    // Fetch profile data using the getSuperAdmin API
    const { data: profileData, isLoading: isProfileLoading, refetch: refetchProfile } =
        useGetSuperAdminProfileQuery(user?.id, { skip: !user?.id });

    // Use the profile data from the API if available, otherwise use the data from Redux
    const profileInfo = profileData?.data || user;

    // Use the RTK Query mutation hook
    const [updateSuperAdminProfile, { isLoading: isSubmitting, isSuccess, isError, error }] = useUpdateSuperAdminProfileMutation();

    // Handle success and error states
    useEffect(() => {
        if (isSuccess) {
            message.success('Profile updated successfully');
            setIsEditModalVisible(false);
            dispatch(resetUpdateStatus());
            // Refetch profile data after successful update
            if (user?.id) {
                refetchProfile();
            }
        }

        if (isError) {
            const errorMessage = error?.data?.message || 'Unknown error';

            // Check if it's an S3 permission error
            if (errorMessage.includes('not authorized to perform: s3:DeleteObject') ||
                errorMessage.includes('explicit deny in an identity-based policy')) {
                // Show a more concise error message
                message.warning({
                    content: 'Profile information updated, but profile picture could not be changed due to permission restrictions.',
                    duration: 5,
                    key: 'profile-update-error'
                });
                // Refetch profile data even after this specific error
                if (user?.id) {
                    refetchProfile();
                }
            } else {
                message.error({
                    content: 'Failed to update profile: ' + errorMessage,
                    key: 'profile-update-error'
                });
            }
        }
    }, [isSuccess, isError, error, dispatch, user, refetchProfile]);

    const handleEditProfile = () => {
        setIsEditModalVisible(true);
    };

    const handleCancelEdit = () => {
        setIsEditModalVisible(false);
    };

    const handleSubmitEdit = async (formData) => {
        if (user?.id) {
            await updateSuperAdminProfile({ id: user.id, formData });
        } else {
            message.error('User ID not found');
        }
    };

    if (isProfileLoading) {
        return (
            <div className="profile-page loading">
                <div className="page-breadcrumb">
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <Link to="/superadmin">
                                <FiHome style={{ marginRight: '4px' }} />
                                Home
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Profile</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="loading-container">
                    <Spin size="large" />
                    <Text>Loading profile information...</Text>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
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
                    user={profileInfo}
                    userRole={userRole}
                    onEditClick={handleEditProfile}
                />
                <Divider />
                <PersonalInfo user={profileInfo} />
                <Divider />
                <AdditionalInfo user={profileInfo} userRole={userRole} />
            </Card>

            <EditProfileModal
                visible={isEditModalVisible}
                onCancel={handleCancelEdit}
                onSubmit={handleSubmitEdit}
                initialValues={profileInfo}
                loading={isSubmitting}
            />
        </div>
    );
};

export default Profile;

