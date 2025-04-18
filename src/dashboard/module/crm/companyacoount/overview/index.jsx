import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Space } from 'antd';
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
    FiCheck,
    FiX,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetCompanyAccountsQuery, useUpdateCompanyAccountMutation } from '../services/companyAccountApi';

const { Title, Text } = Typography;

const CompanyDetails = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const { data: companyAccountsResponse, isLoading } = useGetCompanyAccountsQuery();
    const [updateCompanyAccount] = useUpdateCompanyAccountMutation();

    const companies = Array.isArray(companyAccountsResponse?.data)
        ? companyAccountsResponse.data
        : Array.isArray(companyAccountsResponse)
            ? companyAccountsResponse
            : [];

    const company = companies.find(company => company.id === accountId);


    if (!company) return <div>Company not found</div>;

  return (
        <div className="overview-content">
            <Card className="info-card contact-card">
                <div className="profile-header">
                    <div className="profile-main">
                        <div className="company-avatar">
                            {company?.company_name ? company.company_name[0].toUpperCase() : 'C'}
                        </div>
                        <div className="profile-info">
                            <h2 className="company-name">{company?.company_name || 'Company Name'}</h2>
                            <div className="contact-name">
                                <FiUser className="icon" />
                                {company?.account_owner}
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
                            <a href={`mailto:${company?.email}`} className="stat-value">
                                {company?.email || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiPhone />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Phone Number</div>
                            <a href={`tel:${company?.phone_number}`} className="stat-value">
                                {company?.phone_number || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiMapPin />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Location</div>
                            <div className="stat-value">{company?.billing_city || '-'}</div>
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
                            <div className="metric-label">Revenue</div>
                            <div className="metric-value">
                                {company?.company_revenue || '-'}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card status-card">
                        <div className="metric-icon">
                            <FiTarget />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Company Type</div>
                            <div className="metric-value">
                                {company?.company_type || '-'}
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
                                {company?.createdAt ? dayjs(company.createdAt).format('MMM DD, YYYY') : '-'}
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
                            <div className="metric-label">Employees</div>
                            <div className="metric-value">
                                {company?.number_of_employees || '0'}
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
                                    <div className="detail-label">Industry</div>
                                    <div className="detail-value">
                                        {company?.company_industry || '-'}
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
                                    <div className="detail-value">{company?.company_category || '-'}</div>
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
                                    <div className="detail-label">Ownership</div>
                                    <div className="detail-value">
                                        {company?.ownership || '-'}
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
                                    <div className="detail-label">Fax</div>
                                    <div className="detail-value">{company?.fax || '-'}</div>
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

export default CompanyDetails;
