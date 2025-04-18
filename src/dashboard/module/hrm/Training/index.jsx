import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table, Space
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome
} from 'react-icons/fi';
import './training.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateTraining from './CreateTraining';
import TrainingList from './TrainingList';
import ViewTraining from './ViewTraining';
import { Link } from 'react-router-dom';
import { useDeleteTrainingMutation } from './services/trainingApi';

const { Title, Text } = Typography;

const Training = () => {
    const [trainings, setTrainings] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewTrainingVisible, setIsViewTrainingVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredTrainings, setFilteredTrainings] = useState([]);
    const searchInputRef = useRef(null);

    // RTK Query hooks
    const [deleteTraining] = useDeleteTrainingMutation();

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            const mockData = [
                {
                    id: 1,
                    title: "React Training",
                    type: "Technical",
                    trainer: "John Doe",
                    start_date: "2024-03-21",
                    end_date: "2024-03-25",
                    status: "active",
                    created_at: new Date().toISOString()
                }
            ];
            setTrainings(mockData);
        } catch (error) {
            message.error("Failed to fetch trainings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = [...trainings];
        if (searchText) {
            result = result.filter(training =>
                (training.category?.toLowerCase().includes(searchText.toLowerCase()) || false) ||
                (training.links && JSON.parse(training.links).url.toLowerCase().includes(searchText.toLowerCase()))
            );
        }
        setFilteredTrainings(result);
    }, [trainings, searchText]);

    const handleAddTraining = () => {
        setSelectedTraining(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditTraining = (training) => {
        setSelectedTraining(training);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleDeleteConfirm = (training) => {
        setSelectedTraining(training);
        setIsDeleteModalVisible(true);
    };

    const handleViewTraining = (training) => {
        setSelectedTraining(training);
        setIsViewTrainingVisible(true);
    };

    const handleDeleteTraining = async () => {
        try {
            await deleteTraining(selectedTraining.id).unwrap();
            const updatedTrainings = trainings.filter(t => t.id !== selectedTraining.id);
            setTrainings(updatedTrainings);
            message.success('Training deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error(error?.data?.message || 'Failed to delete training');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedTrainings = trainings.map(t =>
                    t.id === selectedTraining.id ? { ...t, ...formData } : t
                );
                setTrainings(updatedTrainings);
                message.success('Training updated successfully');
            } else {
                const newTraining = {
                    id: Date.now(),
                    
                    ...formData,
                    created_at: new Date().toISOString(),
                    status: 'active'
                };
                setTrainings([...trainings, newTraining]);
                message.success('Training created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = trainings.map(training => ({
                'Title': training.title,
                'Type': training.type,
                'Trainer': training.trainer,
                'Start Date': moment(training.start_date).format('YYYY-MM-DD'),
                'End Date': moment(training.end_date).format('YYYY-MM-DD'),
                'Status': training.status,
                'Created Date': moment(training.created_at).format('YYYY-MM-DD'),
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'trainings_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'trainings_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'trainings_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Trainings');
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
        <div className="training-page">
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
                    <Breadcrumb.Item>Training</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Trainings</Title>
                    <Text type="secondary">Manage all trainings in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="search-input">
                        <Input
                            placeholder="Search by training title..."
                            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
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
                            onClick={handleAddTraining}
                            className="add-button"
                        >
                            Add Training
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="training-table-card">
                <TrainingList
                    trainings={filteredTrainings}
                    loading={loading}
                    onEdit={handleEditTraining}
                    onDelete={handleDeleteConfirm}
                    onView={handleViewTraining}
                    searchText={searchText}
                />
            </Card>

            <CreateTraining
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedTraining}
                loading={loading}
            />

            <ViewTraining
                open={isViewTrainingVisible}
                onCancel={() => setIsViewTrainingVisible(false)}
                training={selectedTraining}
            />

            <Modal
                title="Delete Training"
                open={isDeleteModalVisible}
                onOk={handleDeleteTraining}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete <strong>{selectedTraining?.title}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Training;
