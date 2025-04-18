import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Tabs, Breadcrumb, Button, Typography, Tag, Space, Row, Col, Descriptions, message } from 'antd';
import {
    FiArrowLeft,
    FiHome,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiDollarSign,
    FiTarget,
    FiCalendar,
    FiActivity,
    FiFileText,
    FiUsers,
    FiClock,
    FiPaperclip,
    FiFolder,
    FiTrendingUp,
    FiTrendingDown,
    FiMinusCircle,
    FiPhoneCall,
    FiBox,
    FiBriefcase,
} from 'react-icons/fi';
import { useGetLeadQuery, useUpdateLeadMutation } from '../services/LeadApi';
import { useGetAllCurrenciesQuery } from '../../../../module/settings/services/settingsApi';
import CreateDeal from '../../deal/CreateDeal';
import { useGetPipelinesQuery } from '../../crmsystem/pipeline/services/pipelineApi';
import { useGetLeadStagesQuery } from '../../crmsystem/leadstage/services/leadStageApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../auth/services/authSlice.js';
import { selectStageOrder } from '../../crmsystem/leadstage/services/leadStageSlice';
import dayjs from 'dayjs';
import { useGetSourcesQuery, useGetStatusesQuery, useGetCategoriesQuery } from '../../crmsystem/souce/services/SourceApi.js';

import LeadActivity from './activity';
import LeadNotes from './notes';
import LeadFiles from './files';
import LeadMembers from './members';
import LeadFollowup from './followup/index.jsx';
import './LeadOverview.scss';

const { Title, Text } = Typography;

const LeadStageProgress = ({ stages = [], currentStageId, onStageClick, isWon, isLoading }) => {
    if (!stages || stages.length === 0) {
        return null;
    }
    const currentStageIndex = stages.findIndex(stage => stage.id === currentStageId);

    const handleItemClick = (stageId) => {
        if (isLoading || stageId === currentStageId || isWon || !onStageClick) {
            return;
        }
        onStageClick(stageId);
    };

    return (
        <div className="lead-stage-progress-container">
            {stages.map((stage, index) => {
                const isCompleted = currentStageIndex > -1 && index < currentStageIndex;
                const isCurrent = stage.id === currentStageId;
                const isUpcoming = currentStageIndex === -1 || index > currentStageIndex;

                let statusClass = '';
                if (isCompleted) statusClass = 'completed';
                else if (isCurrent) statusClass = 'current';
                else if (isUpcoming) statusClass = 'upcoming';

                return (
                    <button
                        key={stage.id}
                        className={`stage-item ${statusClass}`}
                        onClick={() => handleItemClick(stage.id)}
                        type="button"
                        aria-label={`Set stage to ${stage.stageName}`}
                        aria-current={isCurrent ? 'step' : undefined}
                    >
                        <span className="stage-name">{stage.stageName}</span>
                    </button>
                );
            })}
        </div>
    );
};

const LeadOverviewContent = ({ leadData: initialLeadData, pipelineStages, onStageUpdate, isUpdating }) => {
    const loggedInUser = useSelector(selectCurrentUser);
    const [localLeadData, setLocalLeadData] = useState(initialLeadData);
    const { data: currencies = [] } = useGetAllCurrenciesQuery();
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
    const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);

    const sources = sourcesData?.data || [];
    const categories = categoriesData?.data || [];
    const statuses = statusesData?.data || [];

    // Update local state when prop changes
    React.useEffect(() => {
        setLocalLeadData(initialLeadData);
    }, [initialLeadData]);

    const formatCurrencyValue = (value, currencyId) => {
        const currencyDetails = currencies?.find(c => c.id === currencyId || c.currencyCode === currencyId);
        if (!currencyDetails) return `${value}`;

        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value).replace(/^/, currencyDetails.currencyIcon + ' ');
    };

    const getSourceName = (sourceId) => {
        const source = sources.find(s => s.id === sourceId);
        return source?.name || 'N/A';
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'N/A';
    };

    const getStatusName = (statusId) => {
        const status = statuses.find(s => s.id === statusId);
        return status?.name || 'Pending';
    };

    const handleLocalStageUpdate = async (newStageId) => {
        // Optimistically update local state
        setLocalLeadData(prev => ({
            ...prev,
            leadStage: newStageId
        }));

        // Call parent handler
        onStageUpdate(newStageId);
    };

    return (
        <div className="overview-content">
            <div className="stage-progress-card">
                <LeadStageProgress
                    stages={pipelineStages}
                    currentStageId={localLeadData?.leadStage}
                    onStageClick={handleLocalStageUpdate}
                    isWon={localLeadData?.is_converted}
                    isLoading={isUpdating}
                />
            </div>

            <Card className="info-card contact-card">
                <div className="profile-header">
                    <div className="profile-main">
                        <div className="company-avatar">
                            <FiUser size={24} />
                        </div>
                        <div className="profile-info">
                            <h2 className="company-name">{localLeadData?.leadTitle || 'Company Name'}</h2>
                            <div className="contact-name">
                                <FiBriefcase className="icon" />
                                {localLeadData?.company_name || '-'} {localLeadData?.firstName && localLeadData?.lastName ? `(${localLeadData?.firstName} ${localLeadData?.lastName})` : ""}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="profile-stats">
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiMail />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Email Address</div>
                            <a href={`mailto:${localLeadData?.email}`} className="stat-value">
                                {localLeadData?.email || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiPhone />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Phone Number</div>
                            <a href={`tel:${localLeadData?.telephone}`} className="stat-value">
                                {localLeadData?.telephone || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiMapPin />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Location</div>
                            <div className="stat-value">{localLeadData?.address || '-'}</div>
                        </div>
                    </div>
                </div>
            </Card>

            <Row gutter={[16, 16]} className="metrics-row">
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card lead-value-card">
                        <div className="metric-icon">
                            <FiDollarSign />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Lead Value</div>
                            <div className="metric-value">
                                {localLeadData?.leadValue ? formatCurrencyValue(localLeadData.leadValue, localLeadData.currency) : '-'}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className={`metric-card interest-level-card ${localLeadData?.interest_level || 'medium'}`}>
                        <div className={`metric-icon ${localLeadData?.interest_level || 'medium'}`}>
                            <FiTarget />
                        </div>
                        <div className="metric-content">
                            <div className={`metric-label ${localLeadData?.interest_level || 'medium'}`}>Interest Level</div>
                            <div className="metric-value">
                                {localLeadData?.interest_level === 'high' ? (
                                    <span className="interest-text high">
                                        <FiTrendingUp className="icon" /> High Interest
                                    </span>
                                ) : localLeadData?.interest_level === 'low' ? (
                                    <span className="interest-text low">
                                        <FiTrendingDown className="icon" /> Low Interest
                                    </span>
                                ) : (
                                    <span className="interest-text medium">
                                        <FiMinusCircle className="icon" /> Medium Interest
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card created-date-card">
                        <div className="metric-icon">
                            <FiCalendar className='icon' />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Created</div>
                            <div className="metric-value">
                                {localLeadData?.createdAt ? new Date(localLeadData.createdAt).toLocaleDateString() : '-'}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card members-card">
                        <div className="metric-icon">
                            <FiUsers />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Lead Members</div>
                            <div className="metric-value">
                                {localLeadData?.lead_members ? JSON.parse(localLeadData.lead_members).lead_members.length : '0'}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <div className="lead-details-section">
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card source-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiPhone />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Source</div>
                                    <div className="detail-value">
                                        {getSourceName(localLeadData?.source)}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card stage-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiActivity />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Stage</div>
                                    <div className="detail-value">
                                        {pipelineStages.find(stage => stage.id === localLeadData?.leadStage)?.stageName || 'N/A'}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card category-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiFolder />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Category</div>
                                    <div className="detail-value">
                                        {getCategoryName(localLeadData?.category)}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card status-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiClock />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Status</div>
                                    <div className="detail-value">
                                        {getStatusName(localLeadData?.status)}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

const LeadOverview = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const { data: lead, isLoading: isLoadingLead } = useGetLeadQuery(leadId);
    const { data: pipelines = [] } = useGetPipelinesQuery();
    const { data: allStagesData, isLoading: isLoadingStages } = useGetLeadStagesQuery();
    const [updateLead, { isLoading: isUpdatingLead }] = useUpdateLeadMutation();
    const currentUser = useSelector(selectCurrentUser);
    const [isCreateDealModalOpen, setIsCreateDealModalOpen] = useState(false);
    const [localLeadData, setLocalLeadData] = useState(lead?.data);
    const savedStageOrder = useSelector(selectStageOrder);

    // Update local state when lead data changes
    React.useEffect(() => {
        setLocalLeadData(lead?.data);
    }, [lead?.data]);

    const pipelineStages = useMemo(() => {
        if (!localLeadData?.pipeline || !allStagesData) return [];
        const stagesArray = Array.isArray(allStagesData) ? allStagesData : (allStagesData.data || []);

        const filteredStages = stagesArray.filter(stage =>
            stage.pipeline === localLeadData.pipeline && stage.stageType === 'lead'
        );

        if (savedStageOrder && savedStageOrder.length > 0) {
            const stageOrderMap = new Map(savedStageOrder.map((id, index) => [id, index]));

            return [...filteredStages].sort((a, b) => {
                const indexA = stageOrderMap.has(a.id) ? stageOrderMap.get(a.id) : Infinity;
                const indexB = stageOrderMap.has(b.id) ? stageOrderMap.get(b.id) : Infinity;

                if (indexA !== Infinity && indexB !== Infinity) {
                    return indexA - indexB;
                }
                if (indexA !== Infinity && indexB === Infinity) {
                    return -1;
                }
                if (indexA === Infinity && indexB !== Infinity) {
                    return 1;
                }
                return (a.order ?? 0) - (b.order ?? 0) || a.stageName.localeCompare(b.stageName);
            });
        } else {
            return filteredStages.sort((a, b) =>
                (a.order ?? 0) - (b.order ?? 0) || a.stageName.localeCompare(b.stageName)
            );
        }
    }, [localLeadData?.pipeline, allStagesData, savedStageOrder]);

    const formattedLeadData = useMemo(() => {
        if (!localLeadData) return null;
        return {
            id: localLeadData.id,
            leadTitle: localLeadData.leadTitle,
            firstName: localLeadData.firstName,
            lastName: localLeadData.lastName,
            email: localLeadData.email,
            phone: localLeadData.telephone?.split(' ')[1] || '',
            phoneCode: localLeadData.phoneCode,
            company: localLeadData.company_name,
            source: localLeadData.source,
            pipeline: localLeadData.pipeline,
            stage: localLeadData.leadStage,
            currency: localLeadData.currency,
            value: localLeadData.leadValue,
            category: localLeadData.category,
            address: localLeadData.address,
            status: localLeadData.status,
            interest_level: localLeadData.interest_level,
            lead_members: localLeadData.lead_members ? JSON.parse(localLeadData.lead_members).lead_members : []
        };
    }, [localLeadData]);

    const handleConvertToDeal = () => {
        if (localLeadData?.is_converted) {
            message.warning("This lead has already been converted to a deal");
            return;
        }
        setIsCreateDealModalOpen(true);
    };

    const handleStageUpdate = async (newStageId) => {
        if (newStageId === localLeadData?.leadStage) {
            return;
        }

        if (isUpdatingLead) return;

        // Optimistically update local state
        setLocalLeadData(prev => ({
            ...prev,
            leadStage: newStageId
        }));

        try {
            await updateLead({
                id: leadId,
                data: {
                    leadStage: newStageId,
                    updated_by: currentUser?.username || 'system'
                }
            }).unwrap();
            message.success('Lead stage updated successfully!');
        } catch (error) {
            // Revert optimistic update on error
            setLocalLeadData(prev => ({
                ...prev,
                leadStage: prev.leadStage
            }));
            message.error(error?.data?.message || 'Failed to update lead stage.');
        }
    };

    const items = [
        {
            key: 'overview',
            label: (
                <span>
                    <FiFileText /> Overview
                </span>
            ),
            children: <LeadOverviewContent
                leadData={localLeadData}
                pipelineStages={pipelineStages}
                onStageUpdate={handleStageUpdate}
                isUpdating={isUpdatingLead}
            />,
        },
        {
            key: 'members',
            label: (
                <span>
                    <FiUsers /> Lead Members
                </span>
            ),
            children: <LeadMembers leadId={leadId} />,
        },
        {
            key: 'activity',
            label: (
                <span>
                    <FiActivity /> Activity
                </span>
            ),
            children: <LeadActivity leadId={leadId} />,
        },
        {
            key: 'notes',
            label: (
                <span>
                    <FiFileText /> Notes
                </span>
            ),
            children: <LeadNotes leadId={leadId} />,
        },
        {
            key: 'files',
            label: (
                <span>
                    <FiPaperclip /> Files
                </span>
            ),
            children: <LeadFiles leadId={leadId} />,
        },
        {
            key: 'followup',
            label: (
                <span>
                    <FiPhoneCall /> Follow-up
                </span>
            ),
            children: <LeadFollowup leadId={leadId} />,
        }
    ];

    const isLoading = isLoadingLead || isLoadingStages;

    return (
        <div className="project-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome /> Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/crm/lead">
                            <FiUser /> Leads
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {localLeadData?.leadTitle || 'Lead Details'}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-left">
                    <Title level={2}>Lead Details</Title>
                    <Text type="secondary" className="subtitle">
                        Manage lead details and activities
                    </Text>
                    {localLeadData?.is_converted && (
                        <Tag color="success" style={{ marginLeft: '8px', fontSize: '14px' }}>
                            Converted to Deal
                        </Tag>
                    )}
                </div>
                <div className="header-right">
                    <Space>
                        <Button
                            type="primary"
                            icon={<FiArrowLeft />}
                            onClick={() => navigate('/dashboard/crm/lead')}
                            style={{
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                border: 'none',
                                height: '44px',
                                padding: '0 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '10px',
                                fontWeight: '500'
                            }}
                        >
                            Back to Leads
                        </Button>
                        {!localLeadData?.is_converted && (
                            <Button
                                type="primary"
                                onClick={handleConvertToDeal}
                                style={{
                                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                    border: 'none',
                                    height: '44px',
                                    padding: '0 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    borderRadius: '10px',
                                    fontWeight: '500'
                                }}
                            >
                                Convert to Deal
                            </Button>
                        )}
                    </Space>
                </div>
            </div>

            <div className="page-contentt">
                <div className="content-main">
                    <Card loading={isLoading || isUpdatingLead}>
                        <Tabs
                            defaultActiveKey="overview"
                            items={items}
                            className="project-tabs"
                            type="card"
                            size="large"
                            animated={{ inkBar: true, tabPane: true }}
                        />
                    </Card>
                </div>
            </div>

            <CreateDeal
                open={isCreateDealModalOpen}
                onCancel={() => setIsCreateDealModalOpen(false)}
                leadData={formattedLeadData}
                pipelines={pipelines}
            />
        </div>
    );
};

export default LeadOverview;
