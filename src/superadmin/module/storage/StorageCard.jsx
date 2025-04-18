import React, { useState } from 'react';
import { Typography, Modal, Dropdown, Empty, Image } from 'antd';
import {
    FolderFilled,
    InfoCircleOutlined,
    FileImageOutlined,
    FilePdfOutlined,
    FileOutlined,
    EyeOutlined,
    DownloadOutlined,
    CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './Storage.scss';

const { Text } = Typography;

const StorageCard = ({ data = [], searchText = '', loading = false }) => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState(null);
    const [propertiesVisible, setPropertiesVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const filteredData = data?.filter(item =>
        item.clientName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.username?.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

    const handleProperties = (item, e) => {
        e.stopPropagation();
        setSelectedItem(item);
        setPropertiesVisible(true);
    };

    const handlePreview = (url, name) => {
        setPreviewImage(url);
        setPreviewTitle(name);
        setPreviewVisible(true);
    };

    const handleDownload = (url, filename, e) => {
        e.stopPropagation();
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const isImageFile = (filename = '') => {
        const ext = filename.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
    };

    const getFileIcon = (fileName = '') => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (isImageFile(fileName)) {
            return <FileImageOutlined className="file-icon image" />;
        }
        if (ext === 'pdf') {
            return <FilePdfOutlined className="file-icon pdf" />;
        }
        return <FileOutlined className="file-icon" />;
    };

    const getContextMenu = (item) => ({
        items: [
            {
                key: 'properties',
                label: 'Properties',
                icon: <InfoCircleOutlined />,
                onClick: (e) => handleProperties(item, e)
            },
            ...(item.url ? [
                {
                    key: 'preview',
                    label: 'Preview',
                    icon: <EyeOutlined />,
                    onClick: (e) => handlePreview(item.url, item.name)
                },
                {
                    key: 'download',
                    label: 'Download',
                    icon: <DownloadOutlined />,
                    onClick: (e) => handleDownload(item.url, item.name, e)
                }
            ] : [])
        ]
    });

    const renderFiles = (files = []) => {
        if (!Array.isArray(files) || files.length === 0) {
            return (
                <div className="empty-state">
                    <Empty description="No files found" />
                </div>
            );
        }

        return (
            <div className="folders-grid">
                {files.map((file, index) => (
                    <Dropdown menu={getContextMenu(file)} trigger={['contextMenu']} key={index}>
                        <div
                            className="folder-item"
                            onClick={(e) => isImageFile(file.name) ? handlePreview(file.url, file.name) : handleDownload(file.url, file.name, e)}
                        >
                            {isImageFile(file.name) ? (
                                <div className="image-preview">
                                    <Image
                                        src={file.url}
                                        alt={file.name}
                                        preview={false}
                                    />
                                </div>
                            ) : (
                                getFileIcon(file.name)
                            )}
                            <Text className="folder-name">
                                {file.name}
                            </Text>
                            <Text className="folder-info">
                                {file.size}
                            </Text>
                        </div>
                    </Dropdown>
                ))}
            </div>
        );
    };

    const renderFolders = (items = []) => {
        if (!Array.isArray(items) || items.length === 0) {
            return (
                <div className="empty-state">
                    <Empty description="No folders found" />
                </div>
            );
        }

        return (
            <div className="folders-grid">
                {items.map((item, index) => (
                    <Dropdown menu={getContextMenu(item)} trigger={['contextMenu']} key={index}>
                        <div
                            className="folder-item"
                            onClick={() => selectedClient ? setSelectedFileType(item) : setSelectedClient(item)}
                        >
                            <FolderFilled className="folder-icon" />
                            <Text className="folder-name">
                                {selectedClient ? item.type : item.username}
                            </Text>
                            <Text className="folder-info">
                                {item.totalFiles || item.count || 0} files
                            </Text>
                        </div>
                    </Dropdown>
                ))}
            </div>
        );
    };

    const currentContent = selectedFileType
        ? selectedFileType.files
        : selectedClient
            ? selectedClient.fileTypes
            : filteredData;

    return (
        <div className="storage-explorer">
            {selectedClient && (
                <div className="back-link" onClick={() => {
                    if (selectedFileType) {
                        setSelectedFileType(null);
                    } else {
                        setSelectedClient(null);
                    }
                }}>
                    ← Back to {selectedFileType ? selectedClient.username : 'Clients'}
                </div>
            )}
            {selectedFileType ? renderFiles(currentContent) : renderFolders(currentContent)}

            <Modal
                title="Properties"
                open={propertiesVisible}
                footer={null}
                onCancel={() => setPropertiesVisible(false)}
            >
                {selectedItem && (
                    <div className="properties-content">
                        <div className="property-item">
                            <Text type="secondary">Name:</Text>
                            <Text>{selectedItem.username || selectedItem.name}</Text>
                        </div>
                        <div className="property-item">
                            <Text type="secondary">Files:</Text>
                            <Text>{selectedItem.totalFiles || selectedItem.count || '0'}</Text>
                        </div>
                        <div className="property-item">
                            <Text type="secondary">Size:</Text>
                            <Text>{selectedItem.totalSize || selectedItem.size || '0 MB'}</Text>
                        </div>
                        <div className="property-item">
                            <Text type="secondary">Path:</Text>
                            <Text>{selectedItem.s3Path}</Text>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                open={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                className="image-preview-modal"
                width={800}
                centered
                destroyOnClose
            >
                <div className="preview-container">
                    <Image
                        src={previewImage}
                        alt={previewTitle}
                        preview={false}
                        style={{
                            width: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default StorageCard; 