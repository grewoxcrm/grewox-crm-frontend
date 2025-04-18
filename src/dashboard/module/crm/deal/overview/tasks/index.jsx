import React, { useState, useEffect } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Breadcrumb
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
import './tasks.scss';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { useGetAllTasksQuery } from '../../../task/services/taskApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';
import { useGetUsersQuery } from '../../../../../../dashboard/module/user-management/users/services/userApi';
import { useDeleteTaskMutation } from '../../../task/services/taskApi';
const { Title, Text } = Typography;

const DealTasks = (deal) => {
    
    const dealdata = deal.deal;


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
    const id = deal.deal.id;
    const [deleteTask] = useDeleteTaskMutation();
    // Fetch tasks using RTK Query
    const { data: tasks = [], isLoading: tasksLoading, refetch } = useGetAllTasksQuery(id);
    const tasksData = tasks?.data || [];
    // Fetch users for assignee selection
    const { data: usersData = [], isLoading: usersLoading } = useGetUsersQuery();
    const users = usersData?.data || [];

    const handleCreate = () => {
        setSelectedTask(null);
        setIsCreateModalOpen(true);
    };

    const handleEdit = (record) => {
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
                    await refetch();
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete task');
                }
            },
        });
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = tasks.map(task => ({
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
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                            placeholder="Search tasks..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                            className="search-input"
                            style={{ width: 300 }}
                        />
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
                deal={dealdata}
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

export default DealTasks;








// import React, { useState } from 'react';
// import { Card, Table, Button, Tag, Modal, Form, Input, Select, DatePicker, Avatar, Tooltip } from 'antd';
// import { FiPlus, FiCheckSquare, FiCalendar, FiClock, FiUser, FiFlag } from 'react-icons/fi';
// import './tasks.scss';

// const DealTasks = ({ deal }) => {
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [form] = Form.useForm();

//     // Dummy data for demonstration
//     const tasks = [
//         {
//             id: 1,
//             title: 'Design System Implementation',
//             description: 'Implement the new design system components',
//             assignee: {
//                 name: 'John Doe',
//                 avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
//             },
//             dueDate: '2024-04-01',
//             priority: 'high',
//             status: 'in-progress',
//             milestone: 'Design Phase'
//         },
//         {
//             id: 2,
//             title: 'API Integration',
//             description: 'Integrate backend APIs with frontend',
//             assignee: {
//                 name: 'Jane Smith',
//                 avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
//             },
//             dueDate: '2024-04-15',
//             priority: 'medium',
//             status: 'pending',
//             milestone: 'Development Phase'
//         },
//         {
//             id: 3,
//             title: 'User Testing',
//             description: 'Conduct user testing sessions',
//             assignee: {
//                 name: 'Mike Johnson',
//                 avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
//             },
//             dueDate: '2024-04-30',
//             priority: 'low',
//             status: 'completed',
//             milestone: 'Testing Phase'
//         }
//     ];

//     const getPriorityColor = (priority) => {
//         switch (priority) {
//             case 'high':
//                 return '#f5222d';
//             case 'medium':
//                 return '#faad14';
//             case 'low':
//                 return '#52c41a';
//             default:
//                 return '#1890ff';
//         }
//     };

//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'completed':
//                 return 'success';
//             case 'in-progress':
//                 return 'processing';
//             case 'pending':
//                 return 'warning';
//             default:
//                 return 'default';
//         }
//     };

//     const columns = [
//         {
//             title: 'Task',
//             dataIndex: 'title',
//             key: 'title',
//             render: (text, record) => (
//                 <div className="task-info">
//                     <div className="task-title">
//                         <h4>{text}</h4>
//                         <p>{record.description}</p>
//                     </div>
//                     <Tag color={getPriorityColor(record.priority)} className="priority-tag">
//                         {record.priority.toUpperCase()}
//                     </Tag>
//                 </div>
//             ),
//         },
//         {
//             title: 'Assignee',
//             dataIndex: 'assignee',
//             key: 'assignee',
//             render: (assignee) => (
//                 <div className="assignee-info">
//                     <Avatar src={assignee.avatar} size={32} />
//                     <span>{assignee.name}</span>
//                 </div>
//             ),
//         },
//         {
//             title: 'Due Date',
//             dataIndex: 'dueDate',
//             key: 'dueDate',
//             render: (date) => (
//                 <div className="due-date">
//                     <FiCalendar />
//                     <span>{new Date(date).toLocaleDateString()}</span>
//                 </div>
//             ),
//         },
//         {
//             title: 'Milestone',
//             dataIndex: 'milestone',
//             key: 'milestone',
//             render: (milestone) => (
//                 <div className="milestone-info">
//                     <FiFlag />
//                     <span>{milestone}</span>
//                 </div>
//             ),
//         },
//         {
//             title: 'Status',
//             dataIndex: 'status',
//             key: 'status',
//             render: (status) => (
//                 <Tag color={getStatusColor(status)}>
//                     {status.charAt(0).toUpperCase() + status.slice(1)}
//                 </Tag>
//             ),
//         }
//     ];

//     const handleAddTask = () => {
//         setIsModalVisible(true);
//     };

//     const handleModalOk = () => {
//         form.validateFields().then(values => {
//             setIsModalVisible(false);
//             form.resetFields();
//         });
//     };

//     return (
//         <div className="project-tasks">
//             <Card
//                 title="Project Tasks"
//                 extra={
//                     <Button
//                         type="primary"
//                         icon={<FiPlus />}
//                         onClick={handleAddTask}
//                     >
//                         Add Task
//                     </Button>
//                 }
//             >
//                 <Table
//                     columns={columns}
//                     dataSource={tasks}
//                     rowKey="id"
//                     pagination={{
//                         pageSize: 10,
//                         total: tasks.length,
//                         showTotal: (total) => `Total ${total} tasks`
//                     }}
//                 />
//             </Card>

//             <Modal
//                 title="Add New Task"
//                 open={isModalVisible}
//                 onOk={handleModalOk}
//                 onCancel={() => setIsModalVisible(false)}
//                 okText="Add Task"
//             >
//                 <Form
//                     form={form}
//                     layout="vertical"
//                 >
//                     <Form.Item
//                         name="title"
//                         label="Title"
//                         rules={[{ required: true, message: 'Please enter task title' }]}
//                     >
//                         <Input prefix={<FiCheckSquare />} placeholder="Enter task title" />
//                     </Form.Item>

//                     <Form.Item
//                         name="description"
//                         label="Description"
//                         rules={[{ required: true, message: 'Please enter description' }]}
//                     >
//                         <Input.TextArea
//                             placeholder="Enter task description"
//                             rows={4}
//                         />
//                     </Form.Item>

//                     <Form.Item
//                         name="assignee"
//                         label="Assignee"
//                         rules={[{ required: true, message: 'Please select assignee' }]}
//                     >
//                         <Select placeholder="Select assignee">
//                             <Select.Option value="john">John Doe</Select.Option>
//                             <Select.Option value="jane">Jane Smith</Select.Option>
//                             <Select.Option value="mike">Mike Johnson</Select.Option>
//                         </Select>
//                     </Form.Item>

//                     <Form.Item
//                         name="dueDate"
//                         label="Due Date"
//                         rules={[{ required: true, message: 'Please select due date' }]}
//                     >
//                         <DatePicker
//                             style={{ width: '100%' }}
//                             format="YYYY-MM-DD"
//                         />
//                     </Form.Item>

//                     <Form.Item
//                         name="priority"
//                         label="Priority"
//                         rules={[{ required: true, message: 'Please select priority' }]}
//                     >
//                         <Select placeholder="Select priority">
//                             <Select.Option value="high">High</Select.Option>
//                             <Select.Option value="medium">Medium</Select.Option>
//                             <Select.Option value="low">Low</Select.Option>
//                         </Select>
//                     </Form.Item>

//                     <Form.Item
//                         name="milestone"
//                         label="Milestone"
//                         rules={[{ required: true, message: 'Please select milestone' }]}
//                     >
//                         <Select placeholder="Select milestone">
//                             <Select.Option value="design">Design Phase</Select.Option>
//                             <Select.Option value="development">Development Phase</Select.Option>
//                             <Select.Option value="testing">Testing Phase</Select.Option>
//                         </Select>
//                     </Form.Item>

//                     <Form.Item
//                         name="status"
//                         label="Status"
//                         rules={[{ required: true, message: 'Please select status' }]}
//                     >
//                         <Select placeholder="Select status">
//                             <Select.Option value="pending">Pending</Select.Option>
//                             <Select.Option value="in-progress">In Progress</Select.Option>
//                             <Select.Option value="completed">Completed</Select.Option>
//                         </Select>
//                     </Form.Item>
//                 </Form>
//             </Modal>
//         </div>
//     );
// };

// export default DealTasks; 