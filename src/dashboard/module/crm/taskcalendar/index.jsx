import React, { useState, useEffect } from 'react';
import { Calendar, Typography, Breadcrumb, Card, message, Button, Empty, Popconfirm, Tag, Badge } from 'antd';
import { FiHome, FiCalendar, FiPlus, FiTrash2, FiTag, FiClock, FiMapPin, FiPhone } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './taskcalender.scss';
import CreateTaskCalendar from './CreateTaskCalender';
import { useGetAllTaskCalendarEventsQuery, useDeleteTaskCalendarEventMutation } from './services/taskCalender';

const { Title, Text } = Typography;

const defaultColor = '#1890ff';

const TaskCalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    
    const { data: calendarTasks, isLoading, isError } = useGetAllTaskCalendarEventsQuery();
    const [deleteTaskCalendarEvent, { isLoading: isDeleting }] = useDeleteTaskCalendarEventMutation();

    useEffect(() => {
        if (calendarTasks) {
            const tasksArray = Array.isArray(calendarTasks) 
                ? calendarTasks 
                : calendarTasks?.data || [];
            
            setTasks(tasksArray);
        }
    }, [calendarTasks]);

    useEffect(() => {
        updateUpcomingTasks();
    }, [tasks]);

    const updateUpcomingTasks = () => {
        if (!Array.isArray(tasks)) {
            setUpcomingTasks([]);
            return;
        }

        const today = dayjs();
        const upcoming = tasks
            .filter(task => dayjs(task.taskDate).isSameOrAfter(today, 'day'))
            .sort((a, b) => dayjs(a.taskDate).diff(dayjs(b.taskDate)))
            .slice(0, 5);
        setUpcomingTasks(upcoming);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleCreateTask = (values) => {
        const newTask = {
            taskName: values.title,
            taskDate: values.startDate,
            taskTime: values.start_time,
            taskDescription: values.description,
            client_id: values.client_id,
            created_by: values.created_by
        };
        
        setTasks(prevTasks => [...prevTasks, newTask]);
        message.success('Task created successfully');
        setIsModalVisible(false);
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTaskCalendarEvent(taskId).unwrap();
            message.success('Task deleted successfully');
        } catch (error) {
            console.error('Failed to delete task:', error);
            message.error('Failed to delete task');
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return '#ff4d4f';
            case 'medium': return '#faad14';
            case 'low': return '#52c41a';
            case 'normal': return '#1890ff';
            default: return '#1890ff';
        }
    };

    const getPriorityText = (priority) => {
        switch(priority) {
            case 'high': return 'High Priority';
            case 'medium': return 'Medium Priority';
            case 'low': return 'Low Priority';
            case 'normal': return 'Normal';
            default: return 'Normal';
        }
    };

    const getTaskTypeIcon = (type) => {
        switch(type) {
            case 'task': return <FiCalendar style={{ fontSize: '16px' }} />;
            case 'call': return <FiPhone style={{ fontSize: '16px' }} />;
            case 'meeting': return <FiClock style={{ fontSize: '16px' }} />;
            case 'reminder': return <FiTag style={{ fontSize: '16px' }} />;
            default: return <FiCalendar style={{ fontSize: '16px' }} />;
        }
    };

    const dateCellRender = (date) => {
        if (!Array.isArray(tasks)) {
            return null;
        }

        const dayTasks = tasks.filter(
            task => dayjs(task.taskDate).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );

        return dayTasks.length > 0 ? (
            <div className="task-cell">
                {dayTasks.map(task => (
                    <div key={task.id} className="task-item">
                        <div className="task-details">
                            <div className="task-info">
                                <span className="task-name">
                                    {task.taskName}
                                </span>
                                <span className="task-time">
                                    {task.taskTime}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : null;
    };

    if (isLoading) {
        return (
            <div className="task-calendar-page">
                <div className="page-breadcrumb">
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <Link to="/dashboard">
                                <FiHome style={{ marginRight: '4px' }} />
                                Home
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <Link to="/dashboard/crm">CRM</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Task Calendar</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="page-header">
                    <div className="page-title">
                        <Title level={2}>Task Calendar</Title>
                        <Text type="secondary">Loading task calendar data...</Text>
                    </div>
                </div>
                <Card style={{ textAlign: 'center', padding: '50px' }}>
                    Loading task calendar...
                </Card>
            </div>
        );
    }

    return (
        <div className="task-calendar-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/crm">CRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Task Calendar</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Task Calendar</Title>
                    <Text type="secondary">Manage your tasks and events</Text>
                </div>
            </div>

            <div className="task-calendar-content">
                <Card className="upcoming-tasks" loading={isLoading}>
                    <div className="section-header">
                        <Title level={4}>
                            <FiCalendar style={{ marginRight: '8px' }} />
                            Upcoming Tasks
                        </Title>
                    </div>
                    <div className="task-cards">
                        {!upcomingTasks.length ? (
                            <Empty 
                                description="No tasks scheduled" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            />
                        ) : (
                            upcomingTasks.map(task => (
                                <div key={task.id} className="task-card">
                                    <div className="card-content">
                                        <div className="task-info">
                                            <div className="task-name">
                                                {task.taskName}
                                            </div>
                                            <div className="task-datetime">
                                                <div className="date">
                                                    {dayjs(task.taskDate).format('MMM DD, YYYY')}
                                                </div>
                                                <div className="time">
                                                    {task.taskTime}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            className="delete-button"
                                            type="text"
                                            danger
                                            icon={<FiTrash2 size={16} />}
                                            onClick={() => handleDeleteTask(task.id)}
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

            <CreateTaskCalendar
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleCreateTask}
                selectedDate={selectedDate}
            />
        </div>
    );
};

export default TaskCalendarPage;
