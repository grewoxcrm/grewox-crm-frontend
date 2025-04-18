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
import { useGetContactsQuery, useUpdateContactMutation } from '../services/contactApi';
// import ContactOverview from './ContactOverview';

const { Title, Text } = Typography;

const ContactDetails = () => {
    const { contactId } = useParams();
    const navigate = useNavigate();
    const { data: contactsResponse, isLoading } = useGetContactsQuery();
    const [updateContact] = useUpdateContactMutation();

    const contacts = Array.isArray(contactsResponse?.data)
        ? contactsResponse.data
        : Array.isArray(contactsResponse)
            ? contactsResponse
            : [];

    const contact = contacts.find(contact => contact.id === contactId);

    if (!contact) return <div>Contact not found</div>;

    return (
        <div className="overview-content">
            <Card className="info-card contact-card">
                <div className="profile-header">
                    <div className="profile-main">
                        <div className="company-avatar">
                            {contact?.first_name ? contact.first_name[0].toUpperCase() : 'C'}
                        </div>
                        <div className="profile-info">
                            <h2 className="company-name">{contact?.first_name || 'Contact Name'}</h2>
                            <div className="contact-name">
                                <FiUser className="icon" />
                                {contact?.account_owner}
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
                            <a href={`mailto:${contact?.email}`} className="stat-value">
                                {contact?.email || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiPhone />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Phone Number</div>
                            <a href={`tel:${contact?.phone}`} className="stat-value">
                                {contact?.phone || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiMapPin />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Location</div>
                            <div className="stat-value">{contact?.address || '-'}</div>
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
                                {contact?.company_revenue || '-'}
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
                                {contact?.company_type || '-'}
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
                                {contact?.createdAt ? dayjs(contact.createdAt).format('MMM DD, YYYY') : '-'}
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
                                {contact?.number_of_employees || '0'}
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
                                        {contact?.company_industry || '-'}
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
                                    <div className="detail-value">{contact?.company_category || '-'}</div>
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
                                        {contact?.ownership || '-'}
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
                                    <div className="detail-value">{contact?.fax || '-'}</div>
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

export default ContactDetails;
