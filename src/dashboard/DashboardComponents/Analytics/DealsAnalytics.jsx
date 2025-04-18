import React, { useState, useMemo } from 'react';
import { Typography, Row, Col, Radio, Space, Card, Spin, Button, Select } from 'antd';
import {
    AreaChart, Area,
    PieChart, Pie, Cell,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
    Legend,
    LineChart, Line
} from 'recharts';
import { TeamOutlined, FundOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { FiTarget } from 'react-icons/fi';
import { useGetSourcesQuery } from '../../module/crm/crmsystem/souce/services/SourceApi';
import { useGetDealStagesQuery } from '../../module/crm/crmsystem/dealstage/services/dealStageApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';

const { Title } = Typography;

// Theme colors matching the module
const COLORS = {
    primary: {
        main: '#1890ff',
        light: '#40a9ff',
        dark: '#096dd9',
        gradient: 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)'
    },
    secondary: {
        main: '#595959',
        light: '#8c8c8c',
        dark: '#434343',
        gradient: 'linear-gradient(135deg, #8c8c8c 0%, #595959 100%)'
    },
    text: {
        primary: '#1890ff',
        secondary: '#595959',
        light: '#8c8c8c'
    },
    chart: {
        dealCount: {
            main: '#1890ff',
            light: '#40a9ff',
            gradient: 'url(#colorDeals)',
            hover: '#096dd9'
        },
        dealValue: {
            main: '#595959',
            light: '#8c8c8c',
            gradient: 'url(#colorValue)',
            hover: '#434343'
        },
        pie: ['#1890ff', '#595959', '#40a9ff', '#8c8c8c', '#096dd9', '#434343']
    },
    border: '#e6e8eb',
    background: '#f8fafc'
};

const TIME_FILTERS = {
    TODAY: { value: 'today', label: 'Today' },
    WEEK: { value: 'week', label: 'This Week' },
    MONTH: { value: 'month', label: 'This Month' },
    YEAR: { value: 'year', label: 'This Year' }
};

const chartTitleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1890ff',
    marginBottom: '24px'
};

const chartLabelStyle = {
    fontSize: '15px',
    fontWeight: '600',
    fill: '#1890ff'
};

// Add responsive styles for filter controls
const filterControlsStyles = {
    container: {
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '24px', // Increased gap between filter groups
        alignItems: 'center',
        flexWrap: 'wrap',
        '@media (max-width: 576px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '16px'
        }
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        // gap: '12px', // Increased gap between label and select
        '@media (max-width: 576px)': {
            width: '100%',
            justifyContent: 'space-between',
            gap: '16px'
        }
    },
    label: {
        fontSize: '13px',
        color: '#374151',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '60px', // Added fixed width for labels
        '@media (max-width: 576px)': {
            fontSize: '12px',
            minWidth: '50px'
        }
    },
    select: {
        width: '160px', // Increased width for better visibility
        fontSize: '13px',
        '@media (max-width: 576px)': {
            width: '100%',
            maxWidth: '200px'
        }
    }
};

const DealsAnalytics = ({ deals = [] }) => {
    const [timeFilter, setTimeFilter] = useState(TIME_FILTERS.WEEK.value);
    const [selectedPipeline, setSelectedPipeline] = useState("95QsEzSA7EGnxrlRqnDShFw");
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: sourcesData, isLoading: isSourcesLoading } = useGetSourcesQuery(loggedInUser?.id);
    const { data: stagesData, isLoading: isStagesLoading } = useGetDealStagesQuery();

    const sources = sourcesData?.data || [];

    // Filter stages by pipeline and type
    const stages = useMemo(() => {
        if (!stagesData) return [];
        return (stagesData || []).filter(stage =>
            stage?.stageType === 'deal' &&
            stage?.pipeline === selectedPipeline
        );
    }, [stagesData, selectedPipeline]);

    // Pipeline options
    const pipelines = [
        { id: "95QsEzSA7EGnxrlRqnDShFw", name: "Marketing" },
        { id: "cFaSfTBNfdMnnvSNxQmql0w", name: "Sales" }
    ];

    // Filter deals based on pipeline and time period
    const filteredDeals = useMemo(() => {
        if (!deals || !Array.isArray(deals)) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return deals.filter(deal => {
            if (!deal) return false;
            // First filter by pipeline
            if (deal.pipeline !== selectedPipeline) return false;

            // Then filter by time
            const dealDate = new Date(deal.createdAt);
            if (isNaN(dealDate.getTime())) return false; // Skip invalid dates

            switch (timeFilter) {
                case TIME_FILTERS.TODAY.value:
                    return dealDate >= today;
                case TIME_FILTERS.WEEK.value:
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return dealDate >= weekAgo;
                case TIME_FILTERS.MONTH.value:
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return dealDate >= monthAgo;
                case TIME_FILTERS.YEAR.value:
                    const yearAgo = new Date(today);
                    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                    return dealDate >= yearAgo;
                default:
                    return true;
            }
        });
    }, [deals, timeFilter, selectedPipeline]);

    // Weekly performance data with error handling
    const weeklyData = useMemo(() => {
        if (!filteredDeals || !Array.isArray(filteredDeals)) return [];

        const weekData = filteredDeals.reduce((acc, deal) => {
            if (!deal?.createdAt) return acc;
            const date = new Date(deal.createdAt);
            if (isNaN(date.getTime())) return acc;

            const weekDay = date.toLocaleDateString('en-US', { weekday: 'short' });
            if (!acc[weekDay]) acc[weekDay] = { total: 0, value: 0 };
            acc[weekDay].total++;
            acc[weekDay].value += parseFloat(deal.value) || 0;
            return acc;
        }, {});

        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
            name: day,
            deals: weekData[day]?.total || 0,
            value: weekData[day]?.value || 0
        }));
    }, [filteredDeals]);

    // Format currency with rupee symbol and shortened numbers
    const formatCurrency = (value) => {
        if (!value && value !== 0) return '₹0';
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
        return `₹${Math.round(value)}`;
    };

    // Format numbers to be shorter and always whole numbers
    const formatNumber = (value) => {
        if (!value && value !== 0) return '0';
        if (value >= 1000) return `${Math.round(value / 1000)}k`;
        return Math.round(value).toString();
    };

    // Format percentage with proper intervals
    const formatPercentage = (value) => {
        return `${Math.round(value * 100)}%`;
    };

    // Format axis ticks for counts
    const formatCountTick = (value) => {
        if (value === 0) return '0';
        if (value % 1 !== 0) return '';
        return value.toString();
    };

    // Format axis ticks for values with proper intervals
    const formatValueTick = (value) => {
        if (value === 0) return '0';
        if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value.toString();
    };

    // Calculate metrics
    const totalValue = filteredDeals.reduce((sum, deal) => sum + (parseFloat(deal.value) || 0), 0);
    const totalDeals = filteredDeals.length;
    const wonDeals = filteredDeals.filter(deal => deal.is_won)?.length || 0;
    const winRate = totalDeals ? ((wonDeals / totalDeals) * 100).toFixed(1) : 0;

    // Process source distribution with error handling
    const sourceChartData = useMemo(() => {
        if (!filteredDeals || !Array.isArray(filteredDeals)) return [];

        const sourceData = filteredDeals.reduce((acc, deal) => {
            if (!deal) return acc;
            const source = sources.find(s => s?.id === deal?.source)?.name || 'Unknown';
            const value = parseFloat(deal.value) || 0;
            if (!acc[source]) acc[source] = { count: 0, value: 0 };
            acc[source].count++;
            acc[source].value += value;
            return acc;
        }, {});

        return Object.entries(sourceData).map(([name, data]) => ({
            name,
            count: data.count || 0,
            value: data.value || 0
        }));
    }, [filteredDeals, sources]);

    // Process status distribution with error handling
    const statusChartData = useMemo(() => {
        if (!filteredDeals || !Array.isArray(filteredDeals)) return [];

        const statusData = filteredDeals.reduce((acc, deal) => {
            if (!deal) return acc;
            const status = deal.is_won ? 'Won' : 'Pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const data = Object.entries(statusData).map(([status, count]) => ({
            name: status,
            value: count || 0
        }));

        // Return empty array if no data to prevent undefined access
        return data.length > 0 ? data : [];
    }, [filteredDeals]);

    // Process pipeline data with stage names and handle undefined stages
    const pipelineData = useMemo(() => {
        if (!stages || stages.length === 0) return [];

        // First, organize all stages by pipeline
        const pipelineStages = stages.reduce((acc, stage) => {
            if (!stage || !stage.pipelineId) return acc;
            if (!acc[stage.pipelineId]) {
                acc[stage.pipelineId] = [];
            }
            acc[stage.pipelineId].push(stage);
            return acc;
        }, {});

        // Sort stages within each pipeline by order
        Object.values(pipelineStages).forEach(stageList => {
            stageList.sort((a, b) => (a.order || 0) - (b.order || 0));
        });

        // Create a map of all stages with initial values
        const allStagesMap = stages.reduce((acc, stage) => {
            if (!stage || !stage.id) return acc;
            acc[stage.id] = {
                name: stage.stageName || 'Unnamed Stage',
                count: 0,
                value: 0,
                order: stage.order || 0,
                pipelineId: stage.pipelineId
            };
            return acc;
        }, {});

        // Count deals in each stage
        if (filteredDeals && filteredDeals.length > 0) {
            filteredDeals.forEach(deal => {
                if (deal?.stage && allStagesMap[deal.stage]) {
                    allStagesMap[deal.stage].count++;
                    allStagesMap[deal.stage].value += parseFloat(deal.value) || 0;
                }
            });
        }

        // Convert to array and sort by pipeline and order
        return Object.entries(allStagesMap)
            .map(([id, data]) => ({
                id,
                name: data.name || 'Unnamed',
                fullName: data.name || 'Unnamed Stage',
                displayName: data.name ? data.name.toUpperCase() : 'UNNAMED STAGE',
                count: data.count || 0,
                value: data.value || 0,
                order: data.order || 0,
                pipelineId: data.pipelineId
            }))
            .sort((a, b) => {
                if (a.pipelineId === b.pipelineId) {
                    return (a.order || 0) - (b.order || 0);
                }
                return (a.pipelineId || '').localeCompare(b.pipelineId || '');
            });
    }, [stages, filteredDeals]);

    const chartCardStyle = {
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(24, 144, 255, 0.1)',
        background: 'linear-gradient(145deg, #ffffff, #f0f7ff)',
        border: 'none',
        padding: '24px'
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px 16px',
                    border: '1px solid #40a9ff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 25px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.3s ease',
                    color: '#1890ff'
                }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#333', fontSize: '14px' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{
                            margin: '4px 0',
                            color: entry.color,
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: entry.color,
                                display: 'inline-block'
                            }}></span>
                            {entry.name}: {
                                entry.dataKey === 'value' || entry.name === 'Deal Value'
                                    ? formatCurrency(entry.value)
                                    : typeof entry.value === 'number'
                                        ? entry.value.toLocaleString()
                                        : entry.value
                            }
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (isStagesLoading || isSourcesLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    // Add error handling for empty data
    if (!deals || !Array.isArray(deals) || deals.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '40px',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <Title level={4} style={{ color: '#666' }}>No deals data available</Title>
                <p style={{ color: '#999' }}>Please add some deals to see analytics</p>
            </div>
        );
    }

    return (
        <div>
            {/* Pipeline and Time Filter Controls */}
            <div style={filterControlsStyles.container}>
                {/* Pipeline Selection */}
                <div style={filterControlsStyles.filterGroup}>
                    <Typography.Text style={filterControlsStyles.label}>
                        Pipeline
                    </Typography.Text>
                    <Select
                        value={selectedPipeline}
                        onChange={setSelectedPipeline}
                        style={filterControlsStyles.select}
                        options={pipelines.map(pipeline => ({
                            value: pipeline.id,
                            label: (
                                <Space>
                                    <FiTarget style={{ fontSize: '13px' }} />
                                    {pipeline.name}
                                </Space>
                            )
                        }))}
                        dropdownStyle={{
                            padding: '4px',
                            borderRadius: '6px'
                        }}
                        popupMatchSelectWidth={false}
                        bordered={false}
                        className="filter-select"
                    />
                </div>

                {/* Time Filter */}
                <div style={filterControlsStyles.filterGroup}>
                    <Typography.Text style={filterControlsStyles.label}>
                        Period
                    </Typography.Text>
                    <Select
                        value={timeFilter}
                        onChange={value => setTimeFilter(value)}
                        style={filterControlsStyles.select}
                        options={[
                            { value: TIME_FILTERS.TODAY.value, label: TIME_FILTERS.TODAY.label },
                            { value: TIME_FILTERS.WEEK.value, label: TIME_FILTERS.WEEK.label },
                            { value: TIME_FILTERS.MONTH.value, label: TIME_FILTERS.MONTH.label },
                            { value: TIME_FILTERS.YEAR.value, label: TIME_FILTERS.YEAR.label }
                        ]}
                        dropdownStyle={{
                            padding: '4px',
                            borderRadius: '6px'
                        }}
                        popupMatchSelectWidth={false}
                        bordered={false}
                        className="filter-select"
                    />
                </div>
            </div>

            {/* Add this CSS style block at the top of your file */}
            <style>
                {`
                    .filter-select .ant-select-selector {
                        background-color: #f0f7ff !important;
                        border-radius: 6px !important;
                        border: 1px solid #91caff !important;
                        padding: 0 8px !important;
                        height: 32px !important;
                        box-shadow: none !important;
                    }
                    .filter-select .ant-select-selection-item {
                        line-height: 30px !important;
                        font-weight: 500 !important;
                        color: #1890ff !important;
                    }
                    .filter-select .ant-select-arrow {
                        color: #1890ff !important;
                    }
                    .filter-select:hover .ant-select-selector {
                        border-color: #40a9ff !important;
                    }
                    .filter-select.ant-select-focused .ant-select-selector {
                        border-color: #1890ff !important;
                        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
                    }
                    @media (max-width: 576px) {
                        .filter-select .ant-select-selector {
                            height: 36px !important;
                        }
                        .filter-select .ant-select-selection-item {
                            line-height: 34px !important;
                            font-size: 14px !important;
                        }
                    }
                `}
            </style>

            {/* Stats Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                <Col xs={24} md={12} lg={6}>
                    <Card bordered={false} style={{
                        background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(24, 144, 255, 0.15)'
                        }
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            padding: '4px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)',
                                borderRadius: '10px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <DollarOutlined style={{ color: '#ffffff', fontSize: '24px' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    color: '#1890ff',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    marginBottom: '4px',
                                    opacity: 0.9
                                }}>
                                    Total Value
                                </div>
                                <div style={{
                                    color: '#595959',
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {formatCurrency(totalValue)}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={6}>
                    <Card bordered={false} style={{
                        background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(24, 144, 255, 0.15)'
                        }
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            padding: '4px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)',
                                borderRadius: '10px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TeamOutlined style={{ color: '#ffffff', fontSize: '24px' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    color: '#1890ff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    marginBottom: '4px',
                                    opacity: 0.9
                                }}>
                                    Total Deals
                                </div>
                                <div style={{
                                    color: '#595959',
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {formatNumber(totalDeals)}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={6}>
                    <Card bordered={false} style={{
                        background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(24, 144, 255, 0.15)'
                        }
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            padding: '4px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)',
                                borderRadius: '10px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CheckCircleOutlined style={{ color: '#ffffff', fontSize: '24px' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    color: '#1890ff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    marginBottom: '4px',
                                    opacity: 0.9
                                }}>
                                    Won Deals
                                </div>
                                <div style={{
                                    color: '#595959',
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {formatNumber(wonDeals)}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={6}>
                    <Card bordered={false} style={{
                        background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(24, 144, 255, 0.15)'
                        }
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            padding: '4px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)',
                                borderRadius: '10px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FundOutlined style={{ color: '#ffffff', fontSize: '24px' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    color: '#1890ff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    marginBottom: '4px',
                                    opacity: 0.9
                                }}>
                                    Win Rate
                                </div>
                                <div style={{
                                    color: '#595959',
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {winRate}%
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Weekly Performance Chart */}
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div style={{
                        ...chartCardStyle,
                        padding: '16px',
                        '@media (min-width: 576px)': {
                            padding: '20px'
                        },
                        '@media (min-width: 768px)': {
                            padding: '24px'
                        }
                    }}>
                        <Title level={5} style={{
                            ...chartTitleStyle,
                            fontSize: '16px',
                            marginBottom: '16px',
                            '@media (min-width: 576px)': {
                                fontSize: '18px',
                                marginBottom: '20px'
                            },
                            '@media (min-width: 768px)': {
                                fontSize: '20px',
                                marginBottom: '24px'
                            }
                        }}>Weekly Performance</Title>
                        <div style={{
                            width: '100%',
                            height: '300px',
                            '@media (max-width: 576px)': {
                                height: '250px'
                            }
                        }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart 
                                    data={weeklyData}
                                    margin={{ 
                                        top: 10, 
                                        right: 30, 
                                        left: 0, 
                                        bottom: 0 
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.chart.dealCount.main} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={COLORS.chart.dealCount.light} stopOpacity={0.2} />
                                        </linearGradient>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.chart.dealValue.main} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={COLORS.chart.dealValue.light} stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke="#f0f0f0"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#1890ff"
                                        tick={{ 
                                            fill: '#1890ff', 
                                            fontSize: 12,
                                            fontWeight: 500,
                                            angle: -45,
                                            textAnchor: 'end'
                                        }}
                                        height={60}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="#1890ff"
                                        tickFormatter={formatCountTick}
                                        interval={0}
                                        allowDecimals={false}
                                        tick={{ 
                                            fill: '#1890ff', 
                                            fontSize: 12,
                                            fontWeight: 500
                                        }}
                                        width={40}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#595959"
                                        tickFormatter={formatValueTick}
                                        tick={{ 
                                            fill: '#595959', 
                                            fontSize: 12,
                                            fontWeight: 500
                                        }}
                                        width={60}
                                    />
                                    <Tooltip 
                                        content={<CustomTooltip />}
                                        wrapperStyle={{
                                            fontSize: '14px'
                                        }}
                                    />
                                    <Legend
                                        formatter={(value, entry) => (
                                            <span style={{
                                                color: entry.color === COLORS.chart.dealCount.main ? '#1890ff' : '#595959',
                                                fontWeight: 500,
                                                fontSize: '13px'
                                            }}>
                                                {value}
                                            </span>
                                        )}
                                        wrapperStyle={{
                                            paddingTop: '12px'
                                        }}
                                    />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="deals"
                                        name="Deal Count"
                                        stroke={COLORS.chart.dealCount.main}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill={COLORS.chart.dealCount.gradient}
                                        activeDot={{
                                            r: 6,
                                            strokeWidth: 2,
                                            stroke: '#fff',
                                            fill: COLORS.chart.dealCount.hover
                                        }}
                                    />
                                    <Area
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="value"
                                        name="Deal Value"
                                        stroke={COLORS.chart.dealValue.main}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill={COLORS.chart.dealValue.gradient}
                                        activeDot={{
                                            r: 6,
                                            strokeWidth: 2,
                                            stroke: '#fff',
                                            fill: COLORS.chart.dealValue.hover
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Col>

                {/* Source Distribution */}
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <div style={chartCardStyle}>
                        <Title level={5} style={chartTitleStyle}>Source Distribution</Title>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={sourceChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    type="number"
                                    tickFormatter={formatCountTick}
                                    allowDecimals={false}
                                    tick={{ fill: '#1890ff', fontSize: 12, fontWeight: 500 }}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fill: '#1890ff', fontSize: 12, fontWeight: 500 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    formatter={(value, entry) => (
                                        <span style={{
                                            color: entry.color === COLORS.chart.dealCount.main ? '#1890ff' : '#595959',
                                            fontWeight: 500
                                        }}>
                                            {value}
                                        </span>
                                    )}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Deal Count"
                                    fill={COLORS.chart.dealCount.main}
                                    radius={[4, 4, 4, 4]}
                                    activeBar={{ fill: COLORS.chart.dealCount.hover }}
                                />
                                <Bar
                                    dataKey="value"
                                    name="Deal Value"
                                    fill={COLORS.chart.dealValue.main}
                                    radius={[4, 4, 4, 4]}
                                    activeBar={{ fill: COLORS.chart.dealValue.hover }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>

                {/* Status Distribution */}
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <Title level={5} style={chartTitleStyle}>
                            Status Distribution
                        </Title>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={8}
                                    dataKey="value"
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = outerRadius + 30;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                        return (
                                            <text
                                                x={x}
                                                y={y}
                                                fill={COLORS.chart.dealCount.main}
                                                textAnchor={x > cx ? 'start' : 'end'}
                                                dominantBaseline="central"
                                                style={{
                                                    fontSize: '15px',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.2px'
                                                }}
                                            >
                                                {`${name} ${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                    {statusChartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS.chart.pie[index % COLORS.chart.pie.length]}
                                            stroke="#ffffff"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    layout="horizontal"
                                    formatter={(value, entry) => (
                                        <span style={{
                                            color: '#262626',
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }}>
                                            {value}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                        {/* Pipeline Progress */}
                        <Col xs={24} md={24} lg={24}>
                    <div style={{
                        ...chartCardStyle,
                        padding: '16px',
                        '@media (min-width: 576px)': {
                            padding: '20px'
                        },
                        '@media (min-width: 768px)': {
                            padding: '24px'
                        }
                    }}>
                        <Title level={5} style={{
                            ...chartTitleStyle,
                            fontSize: '18px',
                            '@media (max-width: 576px)': {
                                fontSize: '16px',
                                marginBottom: '16px',
                                textAlign: 'center'
                            },
                            '@media (min-width: 768px)': {
                                fontSize: '20px',
                                marginBottom: '24px'
                            },
                            '@media (min-width: 992px)': {
                                fontSize: '22px'
                            }
                        }}>Pipeline Progress</Title>
                                <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                        data={pipelineData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 60,
                                    '@media (max-width: 576px)': {
                                        top: 10,
                                        right: 10,
                                        left: 10,
                                        bottom: 40
                                    },
                                    '@media (min-width: 768px)': {
                                        right: 40,
                                        left: 30,
                                        bottom: 60
                                    }
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    height={80}
                                    tick={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        fill: '#262626',
                                        '@media (min-width: 576px)': {
                                            fontSize: '14px'
                                        },
                                        '@media (min-width: 992px)': {
                                            fontSize: '16px',
                                            fontWeight: 700
                                        }
                                    }}
                                    angle={-45}
                                    textAnchor="end"
                                    tickMargin={20}
                                />
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    tickFormatter={formatCountTick}
                                    allowDecimals={false}
                                    tick={{
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        fill: '#262626',
                                        '@media (min-width: 576px)': {
                                            fontSize: '13px'
                                        },
                                        '@media (min-width: 992px)': {
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }
                                    }}
                                    width={60}
                                    label={{
                                        value: 'Deal Count',
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: -5,
                                        style: {
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            fill: '#262626',
                                            '@media (min-width: 768px)': {
                                                fontSize: '14px'
                                            }
                                        }
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={formatValueTick}
                                    tick={{
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        fill: '#262626',
                                        '@media (min-width: 576px)': {
                                            fontSize: '13px'
                                        },
                                        '@media (min-width: 992px)': {
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }
                                    }}
                                    width={60}
                                    label={{
                                        value: 'Deal Value',
                                        angle: 90,
                                        position: 'insideRight',
                                        offset: 5,
                                        style: {
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            fill: '#262626',
                                            '@media (min-width: 768px)': {
                                                fontSize: '14px'
                                            }
                                        }
                                    }}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ strokeDasharray: '3 3' }}
                                    wrapperStyle={{
                                        fontSize: '12px',
                                        '@media (min-width: 576px)': {
                                            fontSize: '13px'
                                        },
                                        '@media (min-width: 768px)': {
                                            fontSize: '14px'
                                        }
                                    }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    wrapperStyle={{
                                        fontSize: '12px',
                                        '@media (min-width: 576px)': {
                                            fontSize: '13px'
                                        },
                                        '@media (min-width: 768px)': {
                                            fontSize: '14px'
                                        },
                                        paddingBottom: '16px'
                                    }}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="count"
                                    name="Deal Count"
                                    stroke={COLORS.chart.dealCount.main}
                                    strokeWidth={{
                                        xs: 1.5,
                                        sm: 1.75,
                                        md: 2
                                    }}
                                    dot={{
                                        r: {
                                            xs: 3,
                                            sm: 3.5,
                                            md: 4
                                        },
                                        fill: COLORS.chart.dealCount.main,
                                        stroke: '#fff',
                                        strokeWidth: 2
                                    }}
                                    activeDot={{
                                        r: {
                                            xs: 5,
                                            sm: 5.5,
                                            md: 6
                                        },
                                        fill: COLORS.chart.dealCount.hover,
                                        stroke: '#fff',
                                        strokeWidth: 2
                                    }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="value"
                                    name="Deal Value"
                                    stroke={COLORS.chart.dealValue.main}
                                    strokeWidth={{
                                        xs: 1.5,
                                        sm: 1.75,
                                        md: 2
                                    }}
                                    dot={{
                                        r: {
                                            xs: 3,
                                            sm: 3.5,
                                            md: 4
                                        },
                                        fill: COLORS.chart.dealValue.main,
                                        stroke: '#fff',
                                        strokeWidth: 2
                                    }}
                                    activeDot={{
                                        r: {
                                            xs: 5,
                                            sm: 5.5,
                                            md: 6
                                        },
                                        fill: COLORS.chart.dealValue.hover,
                                        stroke: '#fff',
                                        strokeWidth: 2
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Col>

                {/* Stage Analysis */}
                <Col xs={24} lg={24}>
                    <div style={{
                        ...chartCardStyle,
                        padding: '16px',
                        '@media (min-width: 576px)': {
                            padding: '20px'
                        },
                        '@media (min-width: 768px)': {
                            padding: '24px'
                        }
                    }}>
                        <Title level={5} style={{
                            ...chartTitleStyle,
                            fontSize: '18px',
                            '@media (max-width: 576px)': {
                                fontSize: '16px',
                                marginBottom: '16px',
                                textAlign: 'center'
                            },
                            '@media (min-width: 768px)': {
                                fontSize: '20px',
                                marginBottom: '24px'
                            },
                            '@media (min-width: 992px)': {
                                fontSize: '22px'
                            }
                        }}>Stage Analysis</Title>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={pipelineData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 60,
                                    '@media (max-width: 576px)': {
                                        top: 10,
                                        right: 10,
                                        left: 10,
                                        bottom: 40
                                    },
                                    '@media (min-width: 768px)': {
                                        right: 40,
                                        left: 30,
                                        bottom: 60
                                    }
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    height={80}
                                    tick={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        fill: '#262626',
                                        '@media (min-width: 576px)': {
                                            fontSize: '14px'
                                        },
                                        '@media (min-width: 992px)': {
                                            fontSize: '16px',
                                            fontWeight: 700
                                        }
                                    }}
                                    angle={-45}
                                    textAnchor="end"
                                    tickMargin={20}
                                />
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    tickFormatter={formatCountTick}
                                    allowDecimals={false}
                                    tick={{
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        fill: '#262626',
                                        '@media (min-width: 576px)': {
                                            fontSize: '13px'
                                        },
                                        '@media (min-width: 992px)': {
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }
                                    }}
                                    tickMargin={12}
                                    width={60}
                                    label={{
                                        value: 'Deal Count',
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: -5,
                                        style: {
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            fill: '#262626',
                                            '@media (min-width: 768px)': {
                                                fontSize: '14px'
                                            }
                                        }
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={formatValueTick}
                                    tick={{
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        fill: '#262626',
                                        '@media (min-width: 576px)': {
                                            fontSize: '13px'
                                        },
                                        '@media (min-width: 992px)': {
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }
                                    }}
                                    tickMargin={12}
                                    width={60}
                                    label={{
                                        value: 'Deal Value',
                                        angle: 90,
                                        position: 'insideRight',
                                        offset: 5,
                                        style: {
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            fill: '#262626',
                                            '@media (min-width: 768px)': {
                                                fontSize: '14px'
                                            }
                                        }
                                    }}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    wrapperStyle={{
                                        fontSize: '12px',
                                        '@media (min-width: 576px)': {
                                            fontSize: '13px'
                                        },
                                        '@media (min-width: 768px)': {
                                            fontSize: '14px'
                                        }
                                    }}
                                />
                                <Legend
                                    formatter={(value, entry) => (
                                        <span style={{
                                            color: entry.color === COLORS.chart.dealCount.main ? '#1890ff' : '#595959',
                                            fontWeight: 500,
                                            fontSize: '12px',
                                            '@media (min-width: 576px)': {
                                                fontSize: '13px'
                                            },
                                            '@media (min-width: 768px)': {
                                                fontSize: '14px'
                                            }
                                        }}>
                                            {value}
                                        </span>
                                    )}
                                    wrapperStyle={{
                                        paddingBottom: '16px',
                                        '@media (max-width: 576px)': {
                                            paddingBottom: '12px'
                                        }
                                    }}
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="count"
                                    name="Deal Count"
                                    fill={COLORS.chart.dealCount.main}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={{
                                        xs: 30,
                                        sm: 35,
                                        md: 40,
                                        lg: 45,
                                        xl: 50
                                    }}
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="value"
                                    name="Deal Value"
                                    fill={COLORS.chart.dealValue.main}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={{
                                        xs: 30,
                                        sm: 35,
                                        md: 40,
                                        lg: 45,
                                        xl: 50
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default DealsAnalytics;