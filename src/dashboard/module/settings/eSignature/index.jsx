import React, { useState, useEffect } from 'react';
import {
    Card, Typography, Button, Row, Col,
    Breadcrumb, message, Spin, Modal
} from 'antd';
import {
    FiHome, FiPlusCircle
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ESignatureList from './eSignatureList';
import AddSignature from './AddSignature';
import './eSignature.scss';
import {
    useGetAllSignaturesQuery,
    useDeleteSignatureMutation
} from './services/esignatureApi';

const { Title, Text } = Typography;

const ESignature = () => {
    // Local state management
    const [signatures, setSignatures] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedSignature, setSelectedSignature] = useState(null);

    // API hooks
    const { data: signatureData, isLoading, isError, refetch } = useGetAllSignaturesQuery();
    const [deleteSignature, { isLoading: isDeleting }] = useDeleteSignatureMutation();

    useEffect(() => {
        // Update local state when API data changes
        if (signatureData?.data) {
            setSignatures(signatureData.data);
        } else if (signatureData) {
            setSignatures(signatureData);
        } else {
            // Fallback to localStorage
            const savedSignatures = localStorage.getItem('signatures');
            if (savedSignatures) {
                setSignatures(JSON.parse(savedSignatures));
            }
        }
    }, [signatureData]);

    const handleOpenModal = (mode = 'add', signature = null) => {
        setSelectedSignature(signature);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedSignature(null);
    };

    const handleDeleteSignature = async (id) => {
        Modal.confirm({
            title: 'Delete Signature',
            content: 'Are you sure you want to delete this signature? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            maskClosable: false,
            className: 'delete-signature-modal',
            onOk: async () => {
                try {
                    const response = await deleteSignature(id).unwrap();
                    if (response) {
                        message.success('Signature deleted successfully');
                        refetch(); // Refresh the signatures list
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    message.error(error?.data?.message || 'Failed to delete signature');
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
                <p>Loading signatures...</p>
            </div>
        );
    }

    if (isError) {
        message.error('Failed to load signatures. Using local storage as fallback.');
    }

    return (
        <div className="esignature-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Settings</Breadcrumb.Item>
                    <Breadcrumb.Item>E-Signatures</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <div className="header-actions">
                            <div className="page-title">
                                <Title level={2}>E-Signatures</Title>
                                <Text type="secondary">Create and manage your electronic signatures</Text>
                            </div>
                            <div className="action-buttons">
                                <Button
                                    type="primary"
                                    icon={<FiPlusCircle size={16} />}
                                    onClick={() => handleOpenModal()}
                                    className="add-button"
                                >
                                    Create New Signature
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="signature-list-card">
                <ESignatureList
                    signatures={signatures}
                    onEdit={(signature) => handleOpenModal('edit', signature)}
                    onDelete={handleDeleteSignature}
                    loading={isLoading || isDeleting}
                />
            </Card>

            <AddSignature
                visible={isModalVisible}
                onCancel={handleCloseModal}
                isEditing={!!selectedSignature}
                initialValues={selectedSignature}
                onSuccess={refetch}
            />
        </div>
    );
};

export default ESignature;
