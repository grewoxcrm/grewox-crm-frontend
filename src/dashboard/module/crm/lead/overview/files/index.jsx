import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, message, Modal, Upload, Empty, Divider } from 'antd';
import { FiPlus, FiTrash2, FiX, FiUpload, FiDownload, FiFile, FiFileText, FiImage } from 'react-icons/fi';
import { useGetLeadQuery, useUploadLeadFilesMutation, useDeleteLeadFileMutation } from '../../services/LeadApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';
import './files.scss';

const { Text, Title } = Typography;
const { Dragger } = Upload;
const { confirm } = Modal;

const LeadFiles = ({ leadId }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]);

    const user = useSelector(selectCurrentUser);
    const { data: leadData } = useGetLeadQuery(leadId);
    const [uploadLeadFiles] = useUploadLeadFilesMutation();
    const [deleteLeadFile] = useDeleteLeadFileMutation();

    useEffect(() => {
        if (leadData?.data?.files) {
            try {
                const parsedFiles = JSON.parse(leadData.data.files);
                setFiles(Array.isArray(parsedFiles) ? parsedFiles : [parsedFiles]);
            } catch (error) {
                console.error('Error parsing files:', error);
                setFiles([]);
            }
        }
    }, [leadData]);

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <FiImage className="file-icon image" />;
        if (['pdf'].includes(ext)) return <FiFile className="file-icon pdf" />;
        return <FiFileText className="file-icon doc" />;
    };

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning('Please select files to upload');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            fileList.forEach((file) => {
                formData.append('lead_files', file.originFileObj || file);
            });

            await uploadLeadFiles({
                id: leadId,
                data: formData
            }).unwrap();

            setIsModalVisible(false);
            message.success('Files uploaded successfully');
            setFileList([]);
        } catch (error) {
            console.error('Upload error:', error);
            message.error(error?.data?.message || 'Failed to upload files');
        }

        setUploading(false);
    };

    const handleDelete = (filename) => {
        confirm({
            title: 'Delete File',
            content: `Are you sure you want to delete "${filename}"?`,
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteLeadFile({
                        id: leadId,
                        filename
                    }).unwrap();
                    message.success('File deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete file');
                }
            },
        });
    };

    const uploadProps = {
        onRemove: file => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: file => {
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('File must be smaller than 10MB!');
                return Upload.LIST_IGNORE;
            }
            setFileList(prev => [...prev, file]);
            return false;
        },
        fileList,
        maxCount: 5,
        multiple: true,
        accept: '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx'
    };

    return (
        <div className="lead-files-container">
            <div className="files-header">
                <div className="title-section">
                    <Title level={4} className="section-title">Files</Title>
                    <Text className="file-count">{files.length} files uploaded</Text>
                </div>
                <Button
                    type="primary"
                    icon={<FiPlus />}
                    onClick={() => setIsModalVisible(true)}
                    className="add-files-btn"
                >
                    Upload New File
                </Button>
            </div>

            <div className="files-grid">
                {files.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div className="empty-state">
                                <Title level={5}>No Files Yet</Title>
                                <Text>Upload files by clicking the Upload New File button</Text>
                            </div>
                        }
                    />
                ) : (
                    files.map((file, index) => {
                        const fileExt = file.filename.split('.').pop().toLowerCase();
                        return (
                            <div key={index} className={`file-item ${fileExt}`}>
                                <div className="file-preview">
                                    <div className="file-type-label">.{fileExt}</div>
                                    <div className="file-icon">
                                        {getFileIcon(file.filename)}
                                    </div>
                                </div>
                                <div className="file-content">
                                    <div className="file-info">
                                        <Text className="file-name" ellipsis>{file.filename}</Text>
                                        <Text className="file-date">Added {new Date(file.createdAt || Date.now()).toLocaleDateString()}</Text>
                                    </div>
                                    <div className="file-actions">
                                        <Button
                                            type="link"
                                            icon={<FiDownload />}
                                            onClick={() => window.open(file.url, '_blank')}
                                            className="action-btn download"
                                        />
                                        <Button
                                            type="link"
                                            icon={<FiTrash2 />}
                                            onClick={() => handleDelete(file.filename)}
                                            className="action-btn delete"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <Modal
                title={null}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={520}
                destroyOnClose={true}
                centered
                closeIcon={null}
                className="pro-modal custom-modal"
                style={{
                    "--antd-arrow-background-color": "#ffffff",
                }}
                styles={{
                    body: {
                        padding: 0,
                        borderRadius: "8px",
                        overflow: "hidden",
                    },
                }}
            >
                <div
                    className="modal-header"
                    style={{
                        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        padding: "24px",
                        color: "#ffffff",
                        position: "relative",
                    }}
                >
                    <Button
                        type="text"
                        onClick={() => {
                            setIsModalVisible(false);
                        }}
                        style={{
                            position: "absolute",
                            top: "16px",
                            right: "16px",
                            color: "#ffffff",
                            width: "32px",
                            height: "32px",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                        }}
                    >
                        <FiX style={{ fontSize: "20px" }} />
                    </Button>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background: "rgba(255, 255, 255, 0.2)",
                                backdropFilter: "blur(8px)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <FiUpload style={{ fontSize: "24px", color: "#ffffff" }} />
                        </div>
                        <div>
                            <h2
                                style={{
                                    margin: "0",
                                    fontSize: "24px",
                                    fontWeight: "600",
                                    color: "#ffffff",
                                }}
                            >
                                Upload Files
                            </h2>
                            <Text
                                style={{
                                    fontSize: "14px",
                                    color: "rgba(255, 255, 255, 0.85)",
                                }}
                            >
                                Drag and drop files or click to browse
                            </Text>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "24px" }}>
                    <Dragger {...uploadProps} className="custom-upload">
                        <div className="upload-content">
                            <div className="upload-icon">
                                <FiUpload />
                            </div>
                            <Title level={5}>Drop files here or click to upload</Title>
                            <Text>Support for single or bulk upload. Maximum file size 10MB.</Text>
                        </div>
                    </Dragger>

                    <Divider style={{ margin: "24px 0" }} />

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                        }}
                    >
                        <Button
                            size="large"
                            onClick={() => setIsModalVisible(false)}
                            style={{
                                padding: "8px 24px",
                                height: "44px",
                                borderRadius: "10px",
                                border: "1px solid #e6e8eb",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="large"
                            type="primary"
                            onClick={handleUpload}
                            disabled={fileList.length === 0}
                            loading={uploading}
                            style={{
                                padding: "8px 32px",
                                height: "44px",
                                borderRadius: "10px",
                                fontWeight: "500",
                                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {uploading ? "Uploading" : "Upload"} Files
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LeadFiles; 