import React, { useState } from 'react';
import { Calendar, Badge, Typography, Breadcrumb, Card, List, message, Button, Popconfirm, Empty, Modal } from 'antd';
import { FiHome, FiCalendar, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './interviews.scss';
import CreateInterview from './CreateInterview';
import { useDeleteInterviewMutation, useGetAllInterviewsQuery } from './services/interviewApi';
import { useGetAllJobApplicationsQuery } from '../job applications/services/jobApplicationApi';

const { Title, Text } = Typography;

const Interviews = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { data: interviews, isLoading } = useGetAllInterviewsQuery();
    const { data: jobApplications } = useGetAllJobApplicationsQuery();
    const [deleteInterview] = useDeleteInterviewMutation();

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleDelete = (interviewId) => {
        Modal.confirm({
            title: 'Delete Interview',
            content: 'Are you sure you want to delete this interview?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: {
                padding: '20px',
            },
            onOk: async () => {
                try {
                    await deleteInterview(interviewId).unwrap();
                    message.success('Interview deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete interview');
                }
            },
        });
    };

    const handleCreateInterview = async (values) => {
        const newInterview = {
            id: interviews?.length ? interviews.length + 1 : 1,
            ...values,
            date: selectedDate.format('YYYY-MM-DD')
        };
        // Here you would call the API to create the interview
        setIsModalVisible(false);
        message.success('Interview scheduled successfully');
    };

    // Helper function to get candidate name
    const getCandidateName = (candidateId) => {
        const application = jobApplications?.data?.find(app => app.id === candidateId);
        return application?.name || 'Unknown Candidate';
    };

    const dateCellRender = (date) => {
        if (!interviews?.data) return null;

        // Filter interviews for the current date
        const dayInterviews = interviews.data.filter(
            interview => dayjs(interview.startOn).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );

        return dayInterviews.length > 0 ? (
            <div className="interview-cell">
                {dayInterviews.map(interview => (
                    <div key={interview.id} className="interview-item">
                        <div className="interview-details">
                            <div className="interview-info">
                                <span className="interview-candidate">
                                    {getCandidateName(interview.candidate)}
                                </span>
                                <span className="interview-type">
                                    {/* {interview.interviewType} */}
                                </span>
                            </div>
                            <div className="interview-time">
                                <span className="time">
                                    {interview.startTime?.slice(0, 5)}
                                </span>
                                {/* <span className="mode">
                                    {interview.status || 'Online'}
                                </span> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : null;
    };

    return (
        <div className="interviews-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/job">Job</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Interviews</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Interviews</Title>
                    <Text type="secondary">Manage upcoming interviews</Text>
                </div>
            </div>

            <div className="interviews-content">
                <Card className="upcoming-interviews" loading={isLoading}>
                    <div className="section-header">
                        <Title level={4}>
                            <FiCalendar style={{ marginRight: '8px' }} />
                            Upcoming Interviews
                        </Title>
                    </div>
                    <div className="interview-cards">
                        {!interviews?.data?.length ? (
                            <Empty 
                                description="No interviews scheduled" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            />
                        ) : (
                            interviews.data.map(interview => (
                                <div key={interview.id} className="interview-card">
                                    <div className="card-content">
                                        <div className="candidate-info">
                                            <div className="candidate-name">
                                                {getCandidateName(interview.candidate)}
                                            </div>
                                            <div className="interview-datetime">
                                                <div className="date">
                                                    {dayjs(interview.startOn).format('MMM DD, YYYY')}
                                                </div>
                                                <div className="time">
                                                    {interview.startTime?.slice(0, 5)}
                                                </div>
                                                <div className="type">
                                                    {interview.interviewType}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            className="delete-button"
                                            type="text"
                                            danger
                                            icon={<FiTrash2 size={16} />}
                                            onClick={() => handleDelete(interview.id)}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <Card className="calendar-card" loading={isLoading}>
                    <Calendar
                        dateCellRender={dateCellRender}
                        onSelect={handleDateSelect}
                    />
                </Card>
            </div>

            {/* <Button
                type="primary"
                icon={<FiPlus />}
                onClick={() => setIsModalVisible(true)}
                className="schedule-button"
            >
                Schedule Interview
            </Button> */}

            <CreateInterview
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleCreateInterview}
                selectedDate={selectedDate}
            />
        </div>
    );
};

export default Interviews;
