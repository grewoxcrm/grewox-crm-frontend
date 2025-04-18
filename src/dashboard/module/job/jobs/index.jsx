import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table, DatePicker
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome, FiCalendar
} from 'react-icons/fi';
import './job.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateJob from './CreateJob';
import JobList from './JobList';
import { Link } from 'react-router-dom';
import { useGetAllJobsQuery, useDeleteJobMutation } from './services/jobApi';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { RangePicker } = DatePicker;

const Job = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [exportLoading, setExportLoading] = useState(false);
    const searchInputRef = useRef(null);

    const { data: jobsData, isLoading, error } = useGetAllJobsQuery();
    const [deleteJob] = useDeleteJobMutation();

    const filteredJobs = React.useMemo(() => {
        if (!jobsData?.data) return [];
        
        const searchTerm = searchText.toLowerCase().trim();
        
        return jobsData.data.filter(job => {
            const matchesSearch = !searchTerm || 
                job.title?.toLowerCase().includes(searchTerm);
            
            const matchesDateRange = !dateRange?.length || (
                moment(job.startDate).isSameOrAfter(dateRange[0], 'day') &&
                moment(job.endDate).isSameOrBefore(dateRange[1], 'day')
            );
            
            return matchesSearch && matchesDateRange;
        });
    }, [jobsData, searchText, dateRange]);

    const handleAddJob = () => {
        setSelectedJob(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditJob = (job) => {
        setSelectedJob(job);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleViewJob = (job) => {
        setSelectedJob(job);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Confirmation',
            content: 'Are you sure you want to delete this job?',
            okType: 'danger',
            bodyStyle: { padding: '20px' },
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteJob(record.id).unwrap();
                    message.success('Job deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete job');
                }
            },
        });
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedJobs = jobsData.data.map(j =>
                    j.id === selectedJob.id ? { ...j, ...formData } : j
                );
                // Assuming jobsData.data is updated in the API
                // You might want to refetch the data after update
                message.success('Job updated successfully');
            } else {
                const newJob = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                };
                // Assuming jobsData.data is updated in the API
                // You might want to refetch the data after creation
                message.success('Job created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
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

    const handleExport = async (type) => {
        try {
            setExportLoading(true);
            const data = jobsData?.data?.map(job => ({
                'Title': job.title || 'N/A',
                'Department': job.category || 'N/A',
                'Location': job.location || 'N/A',
                'Experience': job.workExperience || 'N/A',
                'Salary': `${job.currency || ''} ${job.expectedSalary || 'N/A'}`,
                'Status': job.status || 'N/A',
                'Created Date': moment(job.created_at).format('YYYY-MM-DD')
            })) || [];

            if (data.length === 0) {
                message.warning('No data available to export');
                return;
            }

            const timestamp = moment().format('YYYY-MM-DD_HH-mm');
            const filename = `jobs_export_${timestamp}`;

            switch (type) {
                case 'csv':
                    exportToCSV(data, filename);
                    break;
                case 'excel':
                    exportToExcel(data, filename);
                    break;
                case 'pdf':
                    exportToPDF(data, filename);
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
        } finally {
            setExportLoading(false);
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
        XLSX.utils.book_append_sheet(wb, ws, 'Jobs');
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

    return (
        <div className="job-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/hrm">HRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Job</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Jobs</Title>
                    <Text type="secondary">Manage all jobs in the organization</Text>
                </div>
                <div className="header-actions">
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                            placeholder="Search jobs..."
                            allowClear
                            onChange={(e) => handleSearch(e.target.value)}
                            value={searchText}
                            ref={searchInputRef}
                            className="search-input"
                            style={{ width: '300px' }}
                        />
                        <RangePicker
                            suffixIcon={<FiCalendar style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                            onChange={(dates) => setDateRange(dates)}
                            value={dateRange}
                            allowClear
                            style={{ width: '300px', height: '40px' }}
                            placeholder={['Start Date', 'End Date']}
                        />
                    </div>
                    <div className="action-buttons">
                        <Dropdown 
                            overlay={exportMenu} 
                            trigger={['click']}
                            disabled={isLoading || exportLoading}
                        >
                            <Button 
                                className="export-button"
                                loading={exportLoading}
                            >
                                {!exportLoading && <FiDownload size={16} />}
                                <span>Export</span>
                                <FiChevronDown size={14} />
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleAddJob}
                            className="add-button"
                        >
                            Add Job
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="job-table-card">
                <JobList
                    jobs={filteredJobs}
                    loading={isLoading}
                    onEdit={handleEditJob}
                    onDelete={handleDelete}
                    onView={handleViewJob}
                />
            </Card>

            <CreateJob
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedJob}
                loading={isLoading}
            />
        </div>
    );
};

export default Job;
