import React from 'react';
import { Card, Row, Col, Statistic, Progress, Timeline } from 'antd';
import { FiDollarSign, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import './overview.scss';

const ProjectOverview = ({ project }) => {
    return (
        <div className="project-overview">
            <Row gutter={[24, 24]}>
                {/* Statistics Cards */}
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="stat-card">
                        <Statistic
                            title="Total Budget"
                            value={project?.budget || 0}
                            prefix={<FiDollarSign className="stat-icon" />}
                            formatter={(value) => `$${value.toLocaleString()}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="stat-card">
                        <Statistic
                            title="Team Members"
                            value={project?.project_members?.length || 0}
                            prefix={<FiUsers className="stat-icon" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="stat-card">
                        <Statistic
                            title="Hours Spent"
                            value={project?.estimatedhours || 0}
                            prefix={<FiClock className="stat-icon" />}
                            suffix="hrs"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="stat-card">
                        <Statistic
                            title="Tasks Completed"
                            value={75}
                            prefix={<FiCheckCircle className="stat-icon" />}
                            suffix="%"
                        />
                    </Card>
                </Col>

                {/* Progress Section */}
                <Col xs={24} lg={16}>
                    <Card title="Project Progress" bordered={false}>
                        <div className="progress-section">
                            <div className="progress-item">
                                <div className="progress-header">
                                    <span>Overall Progress</span>
                                    <span>75%</span>
                                </div>
                                <Progress percent={75} status="active" />
                            </div>
                            <div className="progress-item">
                                <div className="progress-header">
                                    <span>Budget Utilized</span>
                                    <span>60%</span>
                                </div>
                                <Progress percent={60} status="active" />
                            </div>
                            <div className="progress-item">
                                <div className="progress-header">
                                    <span>Timeline Progress</span>
                                    <span>80%</span>
                                </div>
                                <Progress percent={80} status="active" />
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Timeline Section */}
                <Col xs={24} lg={8}>
                    <Card title="Recent Activities" bordered={false}>
                        <Timeline
                            items={[
                                {
                                    color: 'green',
                                    children: 'Task completed: Design Review',
                                },
                                {
                                    color: 'blue',
                                    children: 'New team member added',
                                },
                                {
                                    color: 'red',
                                    children: 'Budget updated',
                                },
                                {
                                    color: 'gray',
                                    children: 'Project milestone reached',
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProjectOverview; 