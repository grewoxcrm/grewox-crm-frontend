import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Progress } from 'antd';
import { FiHardDrive, FiDownload, FiTrash2 } from 'react-icons/fi';

const StorageDetails = () => {
    const [storageData, setStorageData] = useState({
        totalSpace: 1000, // GB
        usedSpace: 450,   // GB
        files: [
            {
                id: 1,
                name: 'backup_2023.zip',
                size: '2.3 GB',
                type: 'archive',
                uploadDate: '2023-12-01'
            },
            // Add more sample files as needed
        ]
    });

    const columns = [
        {
            title: 'File Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <Space>
                    <FiHardDrive />
                    {text}
                </Space>
            )
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color="blue">{type}</Tag>
            )
        },
        {
            title: 'Upload Date',
            dataIndex: 'uploadDate',
            key: 'uploadDate',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<FiDownload />}
                        onClick={() => handleDownload(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<FiTrash2 />}
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            )
        }
    ];

    const handleDownload = (file) => {
        console.log('Downloading:', file.name);
    };

    const handleDelete = (file) => {
        console.log('Deleting:', file.name);
    };

    const usagePercentage = (storageData.usedSpace / storageData.totalSpace) * 100;

    return (
        <div className="storage-details">
            <Card title="Storage Overview" className="mb-4">
                <div className="storage-stats">
                    <Progress
                        type="circle"
                        percent={Math.round(usagePercentage)}
                        format={(percent) => `${percent}% Used`}
                    />
                    <div className="storage-info">
                        <p>Total Space: {storageData.totalSpace} GB</p>
                        <p>Used Space: {storageData.usedSpace} GB</p>
                        <p>Available Space: {storageData.totalSpace - storageData.usedSpace} GB</p>
                    </div>
                </div>
            </Card>

            <Card title="Storage Files">
                <Table
                    columns={columns}
                    dataSource={storageData.files}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default StorageDetails;