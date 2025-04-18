import React, { useState } from 'react';
import {
    Typography,
    Button,
    Modal,
    message,
    Input,
    Row,
    Col,
    Breadcrumb,
    Card,
    Table,
    Tag,
    Dropdown,
    Menu,
    DatePicker,
    Select
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiSearch,
    FiHome,
    FiMoreVertical,
    FiEdit,
    FiTrash2,
    FiUsers,
    FiFile,
    FiChevronDown,
    FiGrid,
    FiList
} from 'react-icons/fi';
import './project.scss';
import { useGetAllProjectsQuery, useCreateProjectMutation } from './services/projectApi';
import CreateProjectModal from './CreateProjectModal';
import ProjectCard from './ProjectCard';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Project = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const { data: projects, isLoading } = useGetAllProjectsQuery();
    const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();

    const handleCreate = () => {
        setSelectedProject(null);
        setIsModalOpen(true);
    };

    const handleEdit = (project) => {
        setSelectedProject(project);
        // Handle edit
    };

    const handleDelete = (project) => {
        Modal.confirm({
            title: 'Delete Project',
            content: 'Are you sure you want to delete this project?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                // Handle delete action
            },
        });
    };

    const handleView = (project) => {
        setSelectedProject(project);
    };

    const handleCreateSubmit = async (values) => {
        try {
            await createProject(values).unwrap();
            message.success('Project created successfully');
            setIsModalOpen(false);
        } catch (error) {
            message.error(error.message || 'Failed to create project');
        }
    };

    const columns = [
        {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
            render: (budget) => `$${budget}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={
                    status === 'completed' ? 'green' :
                        status === 'in-progress' ? 'blue' :
                            'orange'
                }>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Dropdown overlay={
                    <Menu>
                        <Menu.Item key="edit" icon={<FiEdit />}>Edit</Menu.Item>
                        <Menu.Item key="delete" icon={<FiTrash2 />}>Delete</Menu.Item>
                        <Menu.Item key="members" icon={<FiUsers />}>Members</Menu.Item>
                        <Menu.Item key="files" icon={<FiFile />}>Files</Menu.Item>
                    </Menu>
                }>
                    <Button type="text" icon={<FiMoreVertical />} />
                </Dropdown>
            ),
        },
    ];

    const exportMenu = (
        <Menu>
            <Menu.Item key="csv">Export as CSV</Menu.Item>
            <Menu.Item key="excel">Export as Excel</Menu.Item>
            <Menu.Item key="pdf">Export as PDF</Menu.Item>
        </Menu>
    );

    // Filter projects based on search, category and status
    const filterProjects = () => {
        if (!projects?.data) return [];

        return projects.data.filter(project => {
            const matchesSearch = project.project_name.toLowerCase().includes(searchText.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
            const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    };

    // Get unique categories from projects
    const getCategories = () => {
        if (!projects?.data) return [];
        const categories = [...new Set(projects.data.map(project => project.category))];
        return categories.filter(Boolean); // Remove null/undefined values
    };

    // Get unique statuses from projects
    const getStatuses = () => {
        if (!projects?.data) return [];
        const statuses = [...new Set(projects.data.map(project => project.status))];
        return statuses.filter(Boolean); // Remove null/undefined values
    };

    return (
        <div className="project-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>CRM</Breadcrumb.Item>
                    <Breadcrumb.Item>Projects</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-left">
                    <Title level={2}>Projects</Title>
                    <p className="subtitle">Manage all projects in the system</p>
                </div>
                <div className="header-right">
                    <div className="search-filter-group">
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                            placeholder="Search projects..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                            style={{ width: 200 }}
                        />

                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            onChange={(value) => setSelectedCategory(value)}
                            className="category-select"
                        >
                            <Option value="all">All Categories</Option>
                            <Option value="web">Web Development</Option>
                            <Option value="mobile">Mobile App</Option>
                            <Option value="design">Design</Option>
                        </Select>

                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            onChange={(value) => setSelectedStatus(value)}
                            className="status-select"
                        >
                            <Option value="all">All Status</Option>
                            {getStatuses().map(status => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                    </div>
                    <Dropdown overlay={exportMenu} trigger={['click']}>
                        <Button>
                            <FiDownload /> Export <FiChevronDown />
                        </Button>
                    </Dropdown>
                    <Button type="primary" icon={<FiPlus />} onClick={handleCreate}>
                        Add Project
                    </Button>
                </div>
            </div>

            <Card className="project-content">
                <ProjectCard
                    projects={filterProjects()}
                    loading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    searchText={searchText}
                />
            </Card>

            <CreateProjectModal
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleCreateSubmit}
                loading={isCreating}
            />
        </div>
    );
};

export default Project; 