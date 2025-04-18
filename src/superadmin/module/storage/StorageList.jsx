import React from 'react';
import { Table, Space, Tag, Avatar } from 'antd';
import { FolderFilled } from '@ant-design/icons';
import './Storage.scss';

const StorageList = ({ data = [], searchText = '', loading = false }) => {
    const filteredData = data?.filter(item =>
        (item.clientName && item.clientName.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.username && item.username.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.s3Path && item.s3Path.toLowerCase().includes(searchText.toLowerCase()))
    ) || [];

    const columns = [
        {
            title: 'Profile',
            key: 'profile',
            width: '5%',
            render: () => (
                <Avatar
                    icon={<FolderFilled />}
                    className="folder-avatar"
                    style={{ backgroundColor: '#4096ff' }}
                />
            ),
        },
        {
            title: 'Client Name',
            key: 'clientName',
            width: '20%',
            render: (_, record) => (
                <span className="client-name">
                    {record.clientName !== "null null" ? record.clientName : record.username}
                </span>
            ),
        },
        {
            title: 'Files',
            key: 'files',
            width: '15%',
            render: (_, record) => (
                <Tag color={record.totalFiles > 0 ? 'blue' : 'default'}>
                    {record.totalFiles || 0} files
                </Tag>
            ),
        },
        {
            title: 'Storage Size',
            key: 'size',
            width: '15%',
            render: (_, record) => (
                <Tag color={record.totalFiles > 0 ? 'green' : 'default'}>
                    {record.totalSize || '0 MB'}
                </Tag>
            ),
        },
        {
            title: 'Storage Path',
            dataIndex: 's3Path',
            key: 's3Path',
            width: '45%',
            render: (text) => <code className="storage-path">{text}</code>,
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={(record) => record.clientId || record.s3Path}
            loading={loading}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`
            }}
            className="storage-table"
        />
    );
};

export default StorageList; 