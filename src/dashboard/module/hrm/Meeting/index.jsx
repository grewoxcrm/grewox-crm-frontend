import React, { useState, useEffect, useRef } from 'react';
import {
    Typography,
    Button,
    Modal,
    message,
    Input,
    Dropdown,
    Menu,
    Breadcrumb,
} from 'antd';
import {
    FiPlus,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './meeting.scss';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateMeeting from './CreateMeeting';
import MeetingList from './MeetingList';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Meeting = () => {
    const [meetings, setMeetings] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const searchInputRef = useRef(null);
    const [departmentsData, setDepartmentsData] = useState(null);

    useEffect(() => {
        fetchMeetings();
        fetchDepartments();
    }, []);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            const mockData = [
                {
                    id: 1,
                    title: 'Team Sync',
                    type: 'team_meeting',
                    location: 'Conference Room 1',
                    date: '2025-01-01',
                    startTime: '10:00',
                    endTime: '11:00',
                    department: 'HR',
                    meetingLink: 'https://meet.google.com/abc123',
                    description: 'Weekly team sync meeting',
                    created_at: dayjs(),
                    created_by: 'Admin',
                    status: 'scheduled'
                }
            ];
            setMeetings(mockData);
        } catch (error) {
            message.error('Failed to fetch meetings');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            // TODO: Replace with actual API call to fetch departments
            const mockDepartments = [
                { id: 'HR', department_name: 'Human Resources' },
                { id: 'IT', department_name: 'Information Technology' },
                { id: 'Finance', department_name: 'Finance' },
            ];
            setDepartmentsData({ data: mockDepartments });
        } catch (error) {
            message.error('Failed to fetch departments');
        }
    };

    const handleAddMeeting = () => {
        setSelectedMeeting(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditMeeting = (meeting) => {
        // Convert date strings to dayjs objects before editing
        const formattedMeeting = {
            ...meeting,
            date: dayjs(meeting.date),
            startTime: dayjs(meeting.startTime, 'HH:mm'),
            endTime: meeting.endTime ? dayjs(meeting.endTime, 'HH:mm') : null
        };
        setSelectedMeeting(formattedMeeting);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleDeleteConfirm = (meeting) => {
        setSelectedMeeting(meeting);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteMeeting = async () => {
        try {
            setLoading(true);
            // TODO: Implement delete API call
            const updatedMeetings = meetings.filter(m => m.id !== selectedMeeting.id);
            setMeetings(updatedMeetings);
            message.success('Meeting deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete meeting');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            setLoading(true);
            const processedData = {
                ...formData,
                date: formData.date ? dayjs(formData.date) : null,
                startTime: formData.startTime ? dayjs(formData.startTime, 'HH:mm') : null,
                endTime: formData.endTime ? dayjs(formData.endTime, 'HH:mm') : null
            };

            if (isEditing) {
                // TODO: Implement update API call
                const updatedMeetings = meetings.map(m =>
                    m.id === selectedMeeting.id ? { ...m, ...processedData } : m
                );
                setMeetings(updatedMeetings);
                message.success('Meeting updated successfully');
            } else {
                // TODO: Implement create API call
                const newMeeting = {
                    id: Date.now(),
                    ...processedData,
                    created_at: dayjs(),
                    created_by: 'Admin',
                    status: 'scheduled'
                };
                setMeetings([...meetings, newMeeting]);
                message.success('Meeting created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = meetings?.map((meeting) => ({
                'Title': meeting.title || '-',
                'Department': departmentsData?.data?.find(d => d.id === meeting.department)?.department_name || '-',
                'Date': meeting.date ? dayjs(meeting.date).format('DD-MM-YYYY') : '-',
                'Start Time': meeting.startTime || '-',
                'End Time': meeting.endTime || '-',
                'Location': meeting.location || '-',
                'Status': meeting.status || '-',
                'Description': meeting.description || '-',
                'Created By': meeting.created_by || '-',
                'Created At': meeting.created_at ? dayjs(meeting.created_at).format('DD-MM-YYYY') : '-'
            })) || [];

            if (data.length === 0) {
                message.warning('No data available to export');
                return;
            }

            const fileName = `meetings_${dayjs().format('DD-MM-YYYY')}`;

            switch (type) {
                case 'csv':
                    const csvContent = [
                        Object.keys(data[0]).join(','),
                        ...data.map(item => 
                            Object.values(item)
                                .map(value => `"${value?.toString().replace(/"/g, '""')}"`)
                                .join(',')
                        )
                    ].join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `${fileName}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    message.success('Successfully exported as CSV');
                    break;

                case 'excel':
                    const ws = XLSX.utils.json_to_sheet(data);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Meetings');
                    XLSX.writeFile(wb, `${fileName}.xlsx`);
                    message.success('Successfully exported as Excel');
                    break;

                case 'pdf':
                    const doc = new jsPDF('l', 'pt', 'a4');
                    doc.autoTable({
                        head: [Object.keys(data[0])],
                        body: data.map(item => Object.values(item)),
                        margin: { top: 20 },
                        styles: { 
                            fontSize: 8,
                            cellPadding: 2
                        },
                        theme: 'grid'
                    });
                    doc.save(`${fileName}.pdf`);
                    message.success('Successfully exported as PDF');
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.error('Export error:', error);
            message.error('Failed to export data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="meeting-page">
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
                    <Breadcrumb.Item>Meetings</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Meetings</Title>
                    <Text type="secondary">Manage all meetings in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="search-input">
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                            placeholder="Search meetings..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 360 }}
                            allowClear
                        />
                    </div>
                    <div className="action-buttons">
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: 'csv',
                                        label: 'Export as CSV',
                                        icon: <FiDownload />,
                                        onClick: () => handleExport('csv')
                                    },
                                    {
                                        key: 'excel',
                                        label: 'Export as Excel',
                                        icon: <FiDownload />,
                                        onClick: () => handleExport('excel')
                                    },
                                    {
                                        key: 'pdf',
                                        label: 'Export as PDF',
                                        icon: <FiDownload />,
                                        onClick: () => handleExport('pdf')
                                    }
                                ]
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button className="export-button" loading={loading}>
                                <FiDownload /> Export <FiChevronDown />
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus />}
                            onClick={handleAddMeeting}
                            className="add-button"
                        >
                            Add Meeting
                        </Button>
                    </div>
                </div>
            </div>

            <div className="meeting-table-card">
                <MeetingList
                    searchText={searchText}
                    loading={loading}
                    onEdit={handleEditMeeting}
                    onDelete={handleDeleteConfirm}
                />
            </div>

            <CreateMeeting
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedMeeting}
                loading={loading}
            />

            <Modal
                title="Delete Meeting"
                open={isDeleteModalVisible}
                onOk={handleDeleteMeeting}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete this meeting?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Meeting;
