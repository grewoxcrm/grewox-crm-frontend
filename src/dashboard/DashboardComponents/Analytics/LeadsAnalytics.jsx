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
import { useGetSourcesQuery } from '../../module/crm/crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery } from '../../module/crm/crmsystem/leadstage/services/leadStageApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import { useGetPipelinesQuery } from '../../module/crm/crmsystem/pipeline/services/pipelineApi';

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
        leadCount: {
            main: '#1890ff',
            light: '#40a9ff',
            gradient: 'url(#colorLeads)',
            hover: '#096dd9'
        },
        leadValue: {
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
        gap: '24px',
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
        minWidth: '60px',
        '@media (max-width: 576px)': {
            fontSize: '12px',
            minWidth: '50px'
        }
    },
    select: {
        width: '160px',
        fontSize: '13px',
        '@media (max-width: 576px)': {
            width: '100%',
            maxWidth: '200px'
        }
    }
};

const LeadsAnalytics = ({ leads }) => {
    const [timeFilter, setTimeFilter] = useState(TIME_FILTERS.WEEK.value);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const { data: stagesData } = useGetLeadStagesQuery();
    const { data: pipelinesData, isLoading: isPipelinesLoading } = useGetPipelinesQuery();

    const sources = sourcesData?.data || [];
    const stages = stagesData || [];
    const pipelines = pipelinesData || [];

    console.log(pipelines);

    // Set initial pipeline when data is loaded
    React.useEffect(() => {
        if (pipelines?.length > 0 && !selectedPipeline) {
            setSelectedPipeline(pipelines[0].id);
        }
    }, [pipelines, selectedPipeline]);

    // Filter leads based on selected pipeline and time period
    const filteredLeads = useMemo(() => {
        if (!leads || !selectedPipeline) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return leads.filter(lead => {
            // Pipeline filter
            if (lead.pipeline !== selectedPipeline) {
                return false;
            }

            // Time filter
            const leadDate = new Date(lead.createdAt);
            switch (timeFilter) {
                case TIME_FILTERS.TODAY.value:
                    return leadDate >= today;
                case TIME_FILTERS.WEEK.value:
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return leadDate >= weekAgo;
                case TIME_FILTERS.MONTH.value:
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return leadDate >= monthAgo;
                case TIME_FILTERS.YEAR.value:
                    const yearAgo = new Date(today);
                    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                    return leadDate >= yearAgo;
                default:
                    return true;
            }
        });
    }, [leads, timeFilter, selectedPipeline]);

    // Process pipeline progression and stage analysis based on selected pipeline
    const filteredStages = useMemo(() => {
        if (!stages || !selectedPipeline) return [];
        return stages.filter(stage =>
            stage.pipeline === selectedPipeline &&
            stage.stageType === "lead"
        );
    }, [stages, selectedPipeline]);

    // Process pipeline progression
    const pipelineData = useMemo(() => {
        return filteredStages.map(stage => {
            const stageLeads = filteredLeads.filter(lead => lead.leadStage === stage.id) || [];
            return {
                name: stage.stageName,
                count: stageLeads.length,
                value: stageLeads.reduce((sum, lead) => sum + (parseFloat(lead.leadValue) || 0), 0)
            };
        });
    }, [filteredLeads, filteredStages]);

    // Process stage distribution
    const stageChartData = useMemo(() => {
        const stageData = filteredLeads.reduce((acc, lead) => {
            const stage = filteredStages.find(s => s.id === lead.leadStage)?.stageName || 'Unknown';
            const value = parseFloat(lead.leadValue) || 0;
            if (!acc[stage]) acc[stage] = { count: 0, value: 0 };
            acc[stage].count++;
            acc[stage].value += value;
            return acc;
        }, {});

        return Object.entries(stageData || {}).map(([name, data]) => ({
            name,
            count: data.count,
            value: data.value
        }));
    }, [filteredLeads, filteredStages]);

    // Weekly performance data
    const weeklyData = useMemo(() => {
        const weekData = filteredLeads.reduce((acc, lead) => {
            const date = new Date(lead.createdAt);
            const weekDay = date.toLocaleDateString('en-US', { weekday: 'short' });
            if (!acc[weekDay]) acc[weekDay] = { total: 0, value: 0 };
            acc[weekDay].total++;
            acc[weekDay].value += parseFloat(lead.leadValue) || 0;
            return acc;
        }, {});

        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
            name: day,
            leads: weekData[day]?.total || 0,
            value: weekData[day]?.value || 0
        }));
    }, [filteredLeads]);

    // Format currency with rupee symbol and shortened numbers
    const formatCurrency = (value) => {
        if (!value) return '₹0';
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
        return `₹${value}`;
    };

    // Format numbers to be shorter
    const formatNumber = (value) => {
        if (value >= 1000) {
            return `${Math.round(value / 1000)}k`;
        }
        return Math.round(value);
    };

    // Calculate metrics
    const totalValue = filteredLeads.reduce((sum, lead) => sum + (parseFloat(lead.leadValue) || 0), 0) || 0;
    const totalLeads = filteredLeads.length || 0;
    const convertedLeads = filteredLeads.filter(lead => lead.is_converted)?.length || 0;
    const conversionRate = totalLeads ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    // Process source distribution
    const sourceData = filteredLeads.reduce((acc, lead) => {
        const source = sources.find(s => s.id === lead.source)?.name || 'Unknown';
        const value = parseFloat(lead.leadValue) || 0;
        if (!acc[source]) acc[source] = { count: 0, value: 0 };
        acc[source].count++;
        acc[source].value += value;
        return acc;
    }, {});

    const sourceChartData = Object.entries(sourceData || {}).map(([name, data]) => ({
        name,
        count: data.count,
        value: data.value
    }));

    // Process interest level distribution
    const interestData = filteredLeads.reduce((acc, lead) => {
        const level = lead.interest_level || 'Unknown';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {});

    const interestChartData = Object.entries(interestData).map(([level, count]) => ({
        name: level.charAt(0).toUpperCase() + level.slice(1),
        value: count
    }));

    // Styles
    const statStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '16px 24px',
        background: 'linear-gradient(145deg, #ffffff, #f6f8ff)',
        borderRadius: '12px',
        gap: '4px'
    };

    const statTitleStyle = {
        fontSize: '14px',
        color: '#666',
        margin: 0,
        fontWeight: 'bold'
    };

    const statValueStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const statRowStyle = {
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        marginBottom: '24px'
    };

    const chartCardStyle = {
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(24, 144, 255, 0.1)',
        background: 'linear-gradient(145deg, #ffffff, #f0f7ff)',
        border: 'none',
        padding: '24px',
        width: '80%',
        margin: '0 auto'
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
                                typeof entry.value === 'number'
                                    ? formatNumber(entry.value)
                                    : entry.value
                            }
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            {/* Filter Controls */}
            <div style={filterControlsStyles.container}>
                {/* Pipeline Filter */}
                <div style={filterControlsStyles.filterGroup}>
                    <Typography.Text style={filterControlsStyles.label}>
                        Pipeline
                    </Typography.Text>
                    <Select
                        value={selectedPipeline}
                        onChange={value => setSelectedPipeline(value)}
                        style={filterControlsStyles.select}
                        options={pipelines?.map(pipeline => ({
                            value: pipeline.id,
                            label: pipeline.pipeline_name
                        })) || []}
                        loading={isPipelinesLoading}
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

            {/* Add CSS styles for filter select */}
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
                <Col xs={24} sm={12} lg={6}>
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
                                    fontWeight: 'bold',
                                    marginBottom: '4px',
                                    opacity: 0.9
                                }}>
                                    Total Value
                                </div>
                                <div style={{
                                    color: '#595959',
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {formatCurrency(totalValue)}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{
                        background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
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
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    marginBottom: '4px',
                                    opacity: 0.9
                                }}>
                                    Total Leads
                                </div>
                                <div style={{
                                    color: '#595959',
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {formatNumber(totalLeads)}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{
                        background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
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
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    marginBottom: '4px',
                                    opacity: 0.9
                                }}>
                                    Converted
                                </div>
                                <div style={{
                                    color: '#595959',
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {formatNumber(convertedLeads)}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{
                        background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
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
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    marginBottom: '4px',
                                    opacity: 0.9
                                }}>
                                    Conversion Rate
                                </div>
                                <div style={{
                                    color: '#595959',
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {conversionRate}%
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Weekly Performance Chart */}
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                        bodyStyle={{ 
                            padding: window.innerWidth < 576 ? '16px' : 
                                    window.innerWidth < 992 ? '20px' : '24px'
                        }}
                    >
                        <Title level={5} style={{
                            ...chartTitleStyle,
                            fontSize: window.innerWidth < 576 ? '16px' : 
                                    window.innerWidth < 992 ? '18px' : '20px',
                            marginBottom: window.innerWidth < 576 ? '16px' : '20px',
                            textAlign: window.innerWidth < 576 ? 'center' : 'left'
                        }}>
                            Weekly Performance
                        </Title>
                        <ResponsiveContainer width="100%" height={window.innerWidth < 576 ? 250 : 300}>
                            <AreaChart data={weeklyData}
                                margin={{ 
                                    top: window.innerWidth < 576 ? 5 : 10, 
                                    right: window.innerWidth < 576 ? 10 : 30, 
                                    left: window.innerWidth < 576 ? 0 : 0, 
                                    bottom: window.innerWidth < 576 ? 0 : 0 
                                }}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.chart.leadCount.main} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={COLORS.chart.leadCount.light} stopOpacity={0.2} />
                                    </linearGradient>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.chart.leadValue.main} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={COLORS.chart.leadValue.light} stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#1890ff"
                                    tick={{ 
                                        fill: '#1890ff', 
                                        fontSize: window.innerWidth < 576 ? 10 : 12, 
                                        fontWeight: 500,
                                        angle: window.innerWidth < 576 ? -45 : 0
                                    }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={formatNumber}
                                    allowDecimals={false}
                                    domain={[0, dataMax => Math.ceil(dataMax)]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ 
                                        fontSize: window.innerWidth < 576 ? 10 : 11, 
                                        fill: COLORS.secondary.main 
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={formatCurrency}
                                    tick={{ 
                                        fill: '#595959', 
                                        fontSize: window.innerWidth < 576 ? 10 : 12, 
                                        fontWeight: 500 
                                    }}
                                />
                                <Tooltip 
                                    content={<CustomTooltip />}
                                    wrapperStyle={{
                                        fontSize: window.innerWidth < 576 ? '12px' : '14px'
                                    }}
                                />
                                <Legend
                                    formatter={(value, entry) => (
                                        <span style={{
                                            color: entry.color === COLORS.chart.leadCount.main ? '#1890ff' : '#595959',
                                            fontWeight: 'bold',
                                            fontSize: window.innerWidth < 576 ? '12px' : '14px'
                                        }}>
                                            {value}
                                        </span>
                                    )}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="leads"
                                    name="Lead Count"
                                    stroke={COLORS.chart.leadCount.main}
                                    strokeWidth={window.innerWidth < 576 ? 1.5 : 2}
                                    fillOpacity={1}
                                    fill={COLORS.chart.leadCount.gradient}
                                    dot={{
                                        r: window.innerWidth < 576 ? 3 : 4,
                                        strokeWidth: window.innerWidth < 576 ? 1.5 : 2,
                                        stroke: COLORS.chart.leadCount.main,
                                        fill: '#fff'
                                    }}
                                    activeDot={{
                                        r: window.innerWidth < 576 ? 5 : 6,
                                        strokeWidth: window.innerWidth < 576 ? 1.5 : 2,
                                        stroke: '#fff',
                                        fill: COLORS.chart.leadCount.hover
                                    }}
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="value"
                                    name="Lead Value"
                                    stroke={COLORS.chart.leadValue.main}
                                    strokeWidth={window.innerWidth < 576 ? 1.5 : 2}
                                    fillOpacity={1}
                                    fill={COLORS.chart.leadValue.gradient}
                                    dot={{
                                        r: window.innerWidth < 576 ? 3 : 4,
                                        strokeWidth: window.innerWidth < 576 ? 1.5 : 2,
                                        stroke: COLORS.chart.leadValue.main,
                                        fill: '#fff'
                                    }}
                                    activeDot={{
                                        r: window.innerWidth < 576 ? 5 : 6,
                                        strokeWidth: window.innerWidth < 576 ? 1.5 : 2,
                                        stroke: '#fff',
                                        fill: COLORS.chart.leadValue.hover
                                    }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Source Distribution */}
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                        bodyStyle={{ 
                            padding: window.innerWidth < 576 ? '16px' : 
                                    window.innerWidth < 992 ? '20px' : '24px'
                        }}
                    >
                        <Title level={5} style={{
                            ...chartTitleStyle,
                            fontSize: window.innerWidth < 576 ? '16px' : 
                                    window.innerWidth < 992 ? '18px' : '20px',
                            marginBottom: window.innerWidth < 576 ? '16px' : '20px',
                            textAlign: window.innerWidth < 576 ? 'center' : 'left'
                        }}>
                            Source Distribution
                        </Title>
                        <ResponsiveContainer width="100%" height={window.innerWidth < 576 ? 250 : 300}>
                            <BarChart data={sourceChartData} layout="vertical"
                                margin={{ 
                                    top: window.innerWidth < 576 ? 5 : 10, 
                                    right: window.innerWidth < 576 ? 10 : 30, 
                                    left: window.innerWidth < 576 ? 0 : 0, 
                                    bottom: window.innerWidth < 576 ? 0 : 0 
                                }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    type="number"
                                    tickFormatter={formatNumber}
                                    tick={{ 
                                        fill: '#1890ff', 
                                        fontSize: window.innerWidth < 576 ? 10 : 12, 
                                        fontWeight: 500 
                                    }}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ 
                                        fill: '#1890ff', 
                                        fontSize: window.innerWidth < 576 ? 10 : 12, 
                                        fontWeight: 500 
                                    }}
                                />
                                <Tooltip 
                                    content={<CustomTooltip />}
                                    wrapperStyle={{
                                        fontSize: window.innerWidth < 576 ? '12px' : '14px'
                                    }}
                                />
                                <Legend
                                    formatter={(value, entry) => (
                                        <span style={{
                                            color: entry.color === COLORS.chart.leadCount.main ? '#1890ff' : '#595959',
                                            fontWeight: 500,
                                            fontSize: window.innerWidth < 576 ? '12px' : '14px'
                                        }}>
                                            {value}
                                        </span>
                                    )}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Lead Count"
                                    fill={COLORS.chart.leadCount.main}
                                    radius={[4, 4, 4, 4]}
                                />
                                <Bar
                                    dataKey="value"
                                    name="Lead Value"
                                    fill={COLORS.chart.leadValue.main}
                                    radius={[4, 4, 4, 4]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Interest Level Distribution */}
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                        bodyStyle={{ 
                            padding: window.innerWidth < 576 ? '16px' : 
                                    window.innerWidth < 992 ? '20px' : '24px'
                        }}
                    >
                        <Title level={5} style={{
                            ...chartTitleStyle,
                            fontSize: window.innerWidth < 576 ? '16px' : 
                                    window.innerWidth < 992 ? '18px' : '20px',
                            marginBottom: window.innerWidth < 576 ? '16px' : '20px',
                            textAlign: window.innerWidth < 576 ? 'center' : 'left'
                        }}>
                            Interest Level Distribution
                        </Title>
                        <ResponsiveContainer width="100%" height={window.innerWidth < 576 ? 250 : 300}>
                            <PieChart>
                                <Pie
                                    data={interestChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={window.innerWidth < 576 ? 50 : 70}
                                    outerRadius={window.innerWidth < 576 ? 70 : 90}
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={8}
                                    dataKey="value"
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = outerRadius + (window.innerWidth < 576 ? 20 : 30);
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                        return (
                                            <text
                                                x={x}
                                                y={y}
                                                fill={COLORS.chart.leadCount.main}
                                                textAnchor={x > cx ? 'start' : 'end'}
                                                dominantBaseline="central"
                                                style={{
                                                    fontSize: window.innerWidth < 576 ? '12px' : '15px',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.2px'
                                                }}
                                            >
                                                {`${name} ${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                    {interestChartData.map((entry, index) => (
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
                                            fontSize: window.innerWidth < 576 ? '12px' : '14px',
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
                <Col span={24}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                        bodyStyle={{ 
                            padding: window.innerWidth < 576 ? '16px' : 
                                    window.innerWidth < 992 ? '20px' : '24px'
                        }}
                    >
                        <Title level={5} style={{
                            ...chartTitleStyle,
                            fontSize: window.innerWidth < 576 ? '16px' : 
                                    window.innerWidth < 992 ? '18px' : '20px',
                            marginBottom: window.innerWidth < 576 ? '16px' : '20px',
                            textAlign: window.innerWidth < 576 ? 'center' : 'left'
                        }}>
                            Pipeline Progress
                        </Title>
                        <ResponsiveContainer width="100%" height={window.innerWidth < 576 ? 300 : 400}>
                            <LineChart
                                data={pipelineData}
                                margin={{
                                    top: window.innerWidth < 576 ? 10 : 20,
                                    right: window.innerWidth < 576 ? 10 : 50,
                                    left: window.innerWidth < 576 ? 10 : 30,
                                    bottom: window.innerWidth < 576 ? 40 : 60
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    height={window.innerWidth < 576 ? 60 : 80}
                                    tick={{
                                        fontSize: window.innerWidth < 576 ? 12 : 
                                                window.innerWidth < 992 ? 14 : 16,
                                        fontWeight: window.innerWidth < 576 ? 600 : 700,
                                        fill: '#262626',
                                        angle: -45,
                                        textAnchor: 'end'
                                    }}
                                    tickMargin={window.innerWidth < 576 ? 10 : 20}
                                />
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    tickFormatter={formatNumber}
                                    allowDecimals={false}
                                    interval={0}
                                    tick={{
                                        fontSize: window.innerWidth < 576 ? 12 : 
                                                window.innerWidth < 992 ? 13 : 14,
                                        fill: '#262626',
                                        fontWeight: window.innerWidth < 576 ? 500 : 600
                                    }}
                                    tickMargin={window.innerWidth < 576 ? 8 : 12}
                                    width={window.innerWidth < 576 ? 50 : 80}
                                    label={{
                                        value: 'Lead Count',
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: -5,
                                        style: {
                                            fontSize: window.innerWidth < 576 ? 12 : 14,
                                            fontWeight: window.innerWidth < 576 ? 500 : 600,
                                            fill: '#262626'
                                        }
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={formatNumber}
                                    tick={{
                                        fontSize: window.innerWidth < 576 ? 12 : 
                                                window.innerWidth < 992 ? 13 : 14,
                                        fill: '#262626',
                                        fontWeight: window.innerWidth < 576 ? 500 : 600
                                    }}
                                    tickMargin={window.innerWidth < 576 ? 8 : 12}
                                    width={window.innerWidth < 576 ? 50 : 80}
                                    label={{
                                        value: 'Lead Value',
                                        angle: 90,
                                        position: 'insideRight',
                                        offset: 5,
                                        style: {
                                            fontSize: window.innerWidth < 576 ? 12 : 14,
                                            fontWeight: window.innerWidth < 576 ? 500 : 600,
                                            fill: '#262626'
                                        }
                                    }}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ strokeDasharray: '3 3' }}
                                    wrapperStyle={{
                                        fontSize: window.innerWidth < 576 ? '12px' : 
                                                window.innerWidth < 992 ? '13px' : '14px'
                                    }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={window.innerWidth < 576 ? 30 : 36}
                                    formatter={(value, entry) => (
                                        <span style={{
                                            color: entry.color === COLORS.chart.leadCount.main ? '#1890ff' : '#595959',
                                            fontWeight: window.innerWidth < 576 ? 500 : 600,
                                            fontSize: window.innerWidth < 576 ? '12px' : '14px'
                                        }}>
                                            {value}
                                        </span>
                                    )}
                                    wrapperStyle={{
                                        paddingBottom: window.innerWidth < 576 ? '12px' : '16px'
                                    }}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="count"
                                    name="Lead Count"
                                    stroke={COLORS.chart.leadCount.main}
                                    strokeWidth={window.innerWidth < 576 ? 1.5 : 2}
                                    dot={{
                                        r: window.innerWidth < 576 ? 3 : 4,
                                        fill: COLORS.chart.leadCount.main,
                                        stroke: '#fff',
                                        strokeWidth: window.innerWidth < 576 ? 1.5 : 2
                                    }}
                                    activeDot={{
                                        r: window.innerWidth < 576 ? 5 : 6,
                                        fill: COLORS.chart.leadCount.hover,
                                        stroke: '#fff',
                                        strokeWidth: window.innerWidth < 576 ? 1.5 : 2
                                    }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="value"
                                    name="Lead Value"
                                    stroke={COLORS.chart.leadValue.main}
                                    strokeWidth={window.innerWidth < 576 ? 1.5 : 2}
                                    dot={{
                                        r: window.innerWidth < 576 ? 3 : 4,
                                        fill: COLORS.chart.leadValue.main,
                                        stroke: '#fff',
                                        strokeWidth: window.innerWidth < 576 ? 1.5 : 2
                                    }}
                                    activeDot={{
                                        r: window.innerWidth < 576 ? 5 : 6,
                                        fill: COLORS.chart.leadValue.hover,
                                        stroke: '#fff',
                                        strokeWidth: window.innerWidth < 576 ? 1.5 : 2
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Stage Analysis */}
                <Col span={24}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <Title level={5} style={chartTitleStyle}>
                            Stage Analysis
                        </Title>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={stageChartData}
                                margin={{ top: 20, right: 50, left: 30, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    height={80}
                                    tick={{
                                        fontSize: 16,
                                        fontWeight: 700,
                                        fill: '#262626'
                                    }}
                                    tickMargin={20}
                                />
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    tickFormatter={formatNumber}
                                    allowDecimals={false}
                                    interval={0}
                                    tick={{
                                        fontSize: 14,
                                        fill: '#262626',
                                        fontWeight: 600
                                    }}
                                    tickMargin={12}
                                    width={80}
                                    label={{
                                        value: 'Lead Count',
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: -5,
                                        style: {
                                            fill: '#262626',
                                            fontWeight: 600,
                                            fontSize: 14
                                        }
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={formatNumber}
                                    tick={{
                                        fontSize: 14,
                                        fill: '#262626',
                                        fontWeight: 600
                                    }}
                                    tickMargin={12}
                                    width={80}
                                    label={{
                                        value: 'Lead Value',
                                        angle: 90,
                                        position: 'insideRight',
                                        offset: 5,
                                        style: {
                                            fill: '#262626',
                                            fontWeight: 600,
                                            fontSize: 14
                                        }
                                    }}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                />
                                <Legend
                                    formatter={(value, entry) => (
                                        <span style={{
                                            color: entry.color === COLORS.chart.leadCount.main ? '#1890ff' : '#595959',
                                            fontWeight: 600,
                                            fontSize: '14px'
                                        }}>
                                            {value}
                                        </span>
                                    )}
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="count"
                                    name="Lead Count"
                                    fill={COLORS.chart.leadCount.main}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="value"
                                    name="Lead Value"
                                    fill={COLORS.chart.leadValue.main}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default LeadsAnalytics; 