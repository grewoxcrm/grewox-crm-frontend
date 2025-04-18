import React from 'react';
import { Card, Tag, Button, Tooltip, Dropdown, Empty, Progress } from 'antd';
import {
    FiEdit2, FiTrash2, FiEye, FiCalendar,
    FiUser, FiMoreVertical, FiDollarSign,
    FiClock
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ projects = [], loading, onEdit, onDelete, onView, searchText }) => {
    const navigate = useNavigate();

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return { color: '#52c41a', bg: '#f6ffed', progress: 100 };
            case 'in-progress':
                return { color: '#1890ff', bg: '#e6f7ff', progress: 60 };
            case 'not-started':
                return { color: '#faad14', bg: '#fff7e6', progress: 0 };
            default:
                return { color: '#d9d9d9', bg: '#fafafa', progress: 0 };
        }
    };

    const getTagColor = (tag) => {
        switch (tag?.toLowerCase()) {
            case 'urgent':
                return { color: '#f5222d', bg: '#fff1f0', border: '#ffa39e' };
            case 'normal':
                return { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' };
            case 'low':
                return { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' };
            default:
                return { color: '#d9d9d9', bg: '#fafafa', border: '#f0f0f0' };
        }
    };

    const getDropdownItems = (project) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(project),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit',
                onClick: () => onEdit(project),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => onDelete(project),
                danger: true,
            },
        ],
    });

    const filteredProjects = projects?.filter(project =>
        project.project_name?.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

    const handleCardClick = (project) => {
        navigate(`/dashboard/crm/project/${project.id}`);
    };

    if (!loading && (!filteredProjects || filteredProjects.length === 0)) {
        return (
            <div className="project-empty">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span>
                            {searchText ? 'No projects found matching your search' : 'No projects available'}
                        </span>
                    }
                />
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="project-grid">
            {filteredProjects.map((project) => {
                const statusStyle = getStatusColor(project.status);
                const tagStyle = getTagColor(project.tag);
                const projectMembers = JSON.parse(project.project_members || '{"project_members":[]}').project_members;

                return (
                    <Card
                        key={project.id}
                        className="project-card"
                        bordered={false}
                        onClick={() => handleCardClick(project)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="project-status-bar" style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: statusStyle.color,
                            borderRadius: '12px 12px 0 0'
                        }} />

                        <div className="project-header">
                            <div className="project-title-section">
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        marginBottom: '8px',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {project.project_name}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        textTransform: 'capitalize'
                                    }}>
                                        {project.project_category}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Tag
                                        style={{
                                            color: statusStyle.color,
                                            background: statusStyle.bg,
                                            border: `1px solid ${statusStyle.color}40`,
                                            borderRadius: '4px',
                                            padding: '2px 12px',
                                            textTransform: 'capitalize',
                                            margin: 0
                                        }}
                                    >
                                        {project.status?.replace(/-/g, ' ')}
                                    </Tag>
                                    <Tag
                                        style={{
                                            color: tagStyle.color,
                                            background: tagStyle.bg,
                                            border: `1px solid ${tagStyle.border}`,
                                            borderRadius: '4px',
                                            padding: '2px 12px',
                                            textTransform: 'capitalize',
                                            margin: 0
                                        }}
                                    >
                                        {project.tag}
                                    </Tag>
                                </div>
                            </div>

                            <Dropdown
                                menu={getDropdownItems(project)}
                                trigger={['click']}
                                placement="bottomRight"
                                overlayClassName="project-actions-dropdown"
                            >
                                <Button
                                    type="text"
                                    icon={<FiMoreVertical />}
                                    className="action-dropdown-button"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Dropdown>
                        </div>

                        <div className="project-details">
                            <div className="details-grid">
                                <div className="detail-item">
                                    <div className="detail-label">Duration</div>
                                    <div className="detail-value">
                                        <FiCalendar className="detail-icon" />
                                        <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Budget</div>
                                    <div className="detail-value">
                                        <FiDollarSign className="detail-icon" />
                                        <span>{formatCurrency(project.budget, project.currency)}</span>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Est. Hours</div>
                                    <div className="detail-value">
                                        <FiClock className="detail-icon" />
                                        <span>{project.estimatedhours || 0} Hours</span>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Team Size</div>
                                    <div className="detail-value">
                                        <FiUser className="detail-icon" />
                                        <span>{projectMembers.length} Members</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="project-progress" style={{ marginTop: '16px' }}>
                            <Progress
                                percent={statusStyle.progress}
                                showInfo={false}
                                strokeColor={statusStyle.color}
                                trailColor={statusStyle.bg}
                                size="small"
                            />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default ProjectCard; 