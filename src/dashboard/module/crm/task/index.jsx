import React, { useState, useEffect } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Breadcrumb, DatePicker, Space
} from 'antd';
import {
    FiPlus, FiSearch,
    FiDownload, FiHome,
    FiChevronDown
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import TaskList from './TaskList';
import CreateTask from './CreateTask';
import EditTask from './EditTask';
import './task.scss';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { useGetAllTasksQuery } from './services/taskApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useGetUsersQuery } from '../../../module/user-management/users/services/userApi';
import { useDeleteTaskMutation } from './services/taskApi';
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Task = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        dateRange: [],
        status: undefined,
        priority: undefined
    });
    const [loading, setLoading] = useState(false);
    const user = useSelector(selectCurrentUser);
    const id = user?.client_id;
    const [deleteTask] = useDeleteTaskMutation();
    // Fetch tasks using RTK Query
    const { data: tasks = [], isLoading: tasksLoading, refetch } = useGetAllTasksQuery(id);
    const tasksData = tasks?.data || [];
    console.log("Raw tasksData:", JSON.stringify(tasksData, null, 2));

    // Log any tasks without taskName
    useEffect(() => {
        if (tasksData.length > 0) {
            tasksData.forEach(task => {
                if (!task.taskName) {
                    console.warn('Task missing taskName in index:', task);
                }
            });
        }
    }, [tasksData]);

    // Fetch users for assignee selection
    const { data: usersData = [], isLoading: usersLoading } = useGetUsersQuery();
    const users = usersData?.data || [];

    const handleCreate = () => {
        setSelectedTask(null);
        setIsCreateModalOpen(true);
    };

    const handleEdit = (record) => {
        console.log('Selected Task for Edit:', record);
        setSelectedTask(record);
        setIsEditModalOpen(true);
    };

    const handleModalSubmit = async (values) => {
        try {
            await refetch(); // Refetch tasks after successful creation
            setIsCreateModalOpen(false);
            setSelectedTask(null);
        } catch (error) {
            console.error('Error handling submission:', error);
        }
    };

    const handleView = (record) => {
        console.log('View task:', record);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Task',
            content: 'Are you sure you want to delete this task?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: {
                padding: '20px',
            },
            onOk: async () => {
                try {
                    await deleteTask(record.id).unwrap();
                    message.success('Task deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete task');
                }
            },
        });
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = tasksData.map(task => ({
                'Task Name': task.taskName,
                'Category': task.category,
                'Status': task.status,
                'Priority': task.priority,
                'Assigned To': task.assignedTo,
                'Start Date': moment(task.startDate).format('YYYY-MM-DD'),
                'Due Date': moment(task.dueDate).format('YYYY-MM-DD'),
                'Created Date': moment(task.created_at).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'tasks_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'tasks_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'tasks_export');
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data, filename) => {
        const csvContent = [
            Object.keys(data[0]).join(','),
            ...data.map(item => Object.values(item).map(value =>
                `"${value?.toString().replace(/"/g, '""')}"`
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const exportToExcel = (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 }
        });
        doc.save(`${filename}.pdf`);
    };

    const exportMenu = (
        <Menu>
            <Menu.Item
                key="csv"
                icon={<FiDownload />}
                onClick={() => handleExport('csv')}
            >
                Export as CSV
            </Menu.Item>
            <Menu.Item
                key="excel"
                icon={<FiDownload />}
                onClick={() => handleExport('excel')}
            >
                Export as Excel
            </Menu.Item>
            <Menu.Item
                key="pdf"
                icon={<FiDownload />}
                onClick={() => handleExport('pdf')}
            >
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    const handleDateRangeChange = (dates) => {
        setFilters(prev => ({
            ...prev,
            dateRange: dates ? [dates[0].startOf('day'), dates[1].endOf('day')] : []
        }));
    };

    return (
        <div className="task-page">
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
                    <Breadcrumb.Item>Tasks</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Tasks</Title>
                    <Text type="secondary">Manage all tasks in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="search-filter-group">
                        <Space>
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                                placeholder="Search tasks..."
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                                value={searchText}
                                className="search-input"
                                style={{ 
                                    width: '300px', 
                                    borderRadius: '20px',
                                    height: '38px'
                                }}
                            />
                            <RangePicker
                                onChange={handleDateRangeChange}
                                value={filters.dateRange}
                                allowClear
                                style={{ width: 300, height: 40 }}
                                placeholder={['Start Date', 'End Date']}
                            />
                        </Space>
                    </div>
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button
                                className="export-button"
                                icon={<FiDownload size={16} />}
                                loading={loading}
                            >
                                Export
                                <FiChevronDown size={16} />
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleCreate}
                            className="add-button"
                        >
                            Add Task
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="task-table-card">
                <TaskList
                    loading={tasksLoading}
                    tasks={tasksData}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    searchText={searchText}
                    filters={filters}
                    users={users}
                />
            </Card>

            <CreateTask
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSubmit={handleModalSubmit}
                relatedId={id}
                users={users}
            />

            <EditTask
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedTask(null);
                }}
                onSubmit={handleModalSubmit}
                initialValues={selectedTask}
                relatedId={id}
                users={users}
            />
        </div>
    );
};

export default Task;
