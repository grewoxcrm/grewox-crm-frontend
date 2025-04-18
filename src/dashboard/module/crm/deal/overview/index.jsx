import React, { useMemo, useState } from 'react';
import { Card, Row, Col, Typography, Tag, Space, message } from 'antd';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiDollarSign,
    FiTarget,
    FiCalendar,
    FiUsers,
    FiActivity,
    FiFolder,
    FiClock,
    FiBriefcase
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetAllCurrenciesQuery } from '../../../../module/settings/services/settingsApi';
import { useGetDealStagesQuery } from '../../crmsystem/dealstage/services/dealStageApi';
import { useGetPipelinesQuery } from '../../crmsystem/pipeline/services/pipelineApi';
import { useUpdateDealMutation } from '../services/dealApi';
import { useSelector } from 'react-redux';
import { selectDealStageOrder } from '../services/DealStageSlice';
import { selectCurrentUser } from '../../../../../auth/services/authSlice';
import { useGetSourcesQuery, useGetCategoriesQuery } from '../../crmsystem/souce/services/SourceApi';
import './overview.scss';

const { Title, Text } = Typography;

const DealStageProgress = ({ stages = [], currentStageId, onStageClick, isWon, isLoading }) => {
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
        <div className="deal-stage-progress-container">
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

const DealOverview = ({ deal: initialDeal, currentStatus, onStageUpdate }) => {
    const [localDeal, setLocalDeal] = useState(initialDeal);
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: currencies = [] } = useGetAllCurrenciesQuery();
    const { data: dealStages = [] } = useGetDealStagesQuery();
    const { data: pipelines = [] } = useGetPipelinesQuery();
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
    const savedStageOrder = useSelector(selectDealStageOrder);
    const [updateDeal, { isLoading: isUpdating }] = useUpdateDealMutation();

    const sources = sourcesData?.data || [];
    const categories = categoriesData?.data || [];

    // Update localDeal when initialDeal changes
    React.useEffect(() => {
        setLocalDeal(initialDeal);
    }, [initialDeal]);

    if (!localDeal) return <div>Deal not found</div>;

    // Filter and sort stages using same logic as LeadOverview
    const filteredStages = useMemo(() => {
        if (!localDeal?.pipeline || !dealStages) return [];
        const stagesArray = Array.isArray(dealStages) ? dealStages : [];

        const filteredStages = stagesArray.filter(stage =>
            stage.pipeline === localDeal.pipeline && stage.stageType === 'deal'
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
    }, [localDeal?.pipeline, dealStages, savedStageOrder]);

    const handleStageChange = async (stageId) => {
        // Optimistically update the local state
        const updatedDeal = { ...localDeal, stage: stageId };
        setLocalDeal(updatedDeal);

        try {
            await updateDeal({
                id: localDeal.id,
                stage: stageId,
                // Preserve other important fields
                dealTitle: localDeal.dealTitle,
                pipeline: localDeal.pipeline,
                value: localDeal.value,
                currency: localDeal.currency,
                status: localDeal.status,
                is_won: localDeal.is_won
            }).unwrap();

            message.success('Deal stage updated successfully');
            if (onStageUpdate) {
                onStageUpdate(stageId);
            }
        } catch (error) {
            // Revert the optimistic update on error
            setLocalDeal(initialDeal);
            message.error(error?.data?.message || 'Failed to update deal stage');
        }
    };

    const formatCurrency = (value, currencyId) => {
        const currencyDetails = currencies.find(c => c.id === currencyId);
        if (!currencyDetails) return `${value}`;

        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value).replace(/^/, currencyDetails.currencyIcon + ' ');
    };

    const getStageNameById = (stageId) => {
        const stage = filteredStages.find(stage => stage.id === stageId);
        return stage ? stage.stageName : '-';
    };

    const getPipelineName = (pipelineId) => {
        const pipeline = pipelines.find(p => p.id === pipelineId);
        return pipeline ? pipeline.pipeline_name : '-';
    };

    const getStatusStyle = (status) => {
        // First check is_won flag
        if (localDeal?.is_won === true) {
            return {
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                color: '#52c41a',
                icon: <FiTarget className="status-icon" />,
                text: 'Won'
            };
        } else if (localDeal?.is_won === false) {
            return {
                background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                color: '#ff4d4f',
                icon: <FiTarget className="status-icon" />,
                text: 'Lost'
            };
        }

        // Default to pending if is_won is null
        return {
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            color: '#1890ff',
            icon: <FiTarget className="status-icon" />,
            text: 'Pending'
        };
    };

    const statusStyle = getStatusStyle(currentStatus || localDeal?.status);

    const getSourceName = (sourceId) => {
        if (!sourceId) return '-';
        const source = sources.find(s => s.id === sourceId);
        return source?.name || source?.sourceName || '-';
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return '-';
        const category = categories.find(c => c.id === categoryId);
        return category?.name || category?.categoryName || '-';
    };

    return (
        <div className="overview-content">
            <div className="stage-progress-card">
                <DealStageProgress
                    stages={filteredStages}
                    currentStageId={localDeal?.stage}
                    onStageClick={handleStageChange}
                    isWon={localDeal?.is_won}
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
                            <h2 className="company-name">{localDeal?.dealTitle || 'Deal Title'}</h2>
                            <div className="contact-name">
                                <FiBriefcase className="icon" />
                                {localDeal?.company_name || '-'} {localDeal?.firstName && localDeal?.lastName ? `(${localDeal?.firstName} ${localDeal?.lastName})` : ""}
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
                            <a href={`mailto:${localDeal?.email}`} className="stat-value">
                                {localDeal?.email || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiPhone />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Phone Number</div>
                            <a href={`tel:${localDeal?.phone}`} className="stat-value">
                                {localDeal?.phone || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiMapPin />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Location</div>
                            <div className="stat-value">{localDeal?.address || '-'}</div>
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
                            <div className="metric-label">Deal Value</div>
                            <div className="metric-value">
                                {localDeal?.value ? formatCurrency(localDeal.value, localDeal.currency) : '-'}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className={`metric-card status-card ${currentStatus || localDeal?.status}`}>
                        <div
                            className="metric-icon"
                            style={{
                                background: statusStyle.background
                            }}
                        >
                            {statusStyle.icon}
                        </div>
                        <div className="metric-content">
                            <div className="metric-label" style={{ color: statusStyle.color }}>Status</div>
                            <div
                                className="metric-value"
                                style={{ color: statusStyle.color }}
                            >
                                {statusStyle.text}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card created-date-card">
                        <div className="metric-icon">
                            <FiCalendar />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Created</div>
                            <div className="metric-value">
                                {localDeal?.createdAt ? dayjs(localDeal.createdAt).format('MMM DD, YYYY') : '-'}
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
                            <div className="metric-label">Deal Members</div>
                            <div className="metric-value">
                                {localDeal?.deal_members ? JSON.parse(localDeal.deal_members).deal_members.length : '0'}
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
                                    <FiActivity />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Source</div>
                                    <div className="detail-value">
                                        {getSourceName(localDeal?.source)}
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
                                    <FiFolder />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Category</div>
                                    <div className="detail-value">
                                        {getCategoryName(localDeal?.category)}
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
                                    <FiClock />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Expected Close Date</div>
                                    <div className="detail-value">
                                        {localDeal?.expectedCloseDate ? dayjs(localDeal.expectedCloseDate).format('MMM DD, YYYY') : '-'}
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
                                    <FiTarget />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Priority</div>
                                    <div className="detail-value">{localDeal?.priority || '-'}</div>
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

export default DealOverview;