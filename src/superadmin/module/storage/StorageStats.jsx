import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
    TeamOutlined,
    CloudUploadOutlined,
    FileOutlined,
    HddOutlined
} from '@ant-design/icons';

const StorageStats = ({ data = [] }) => {
    const totalClients = data?.length || 0;
    const totalFiles = data?.reduce((acc, client) => acc + (client.totalFiles || 0), 0) || 0;
    const totalStorage = data?.reduce((acc, client) => {
        const size = parseFloat(client.totalSize) || 0;
        return acc + size;
    }, 0).toFixed(2) || 0;
    const activeClients = data?.filter(client => (client.totalFiles || 0) > 0).length || 0;

    const stats = [
        {
            title: 'Total Clients',
            value: totalClients,
            icon: <TeamOutlined className="team-icon" />,
            color: '#1890ff'
        },
        {
            title: 'Active Clients',
            value: activeClients,
            icon: <CloudUploadOutlined className="active-icon" />,
            color: '#52c41a'
        },
        {
            title: 'Total Files',
            value: totalFiles,
            icon: <FileOutlined className="files-icon" />,
            color: '#faad14'
        },
        {
            title: 'Total Storage',
            value: totalStorage,
            suffix: 'MB',
            icon: <HddOutlined className="storage-icon" />,
            color: '#f5222d'
        }
    ];

    return (
        <Row gutter={[16, 16]} className="storage-stats">
            {stats.map((stat, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                    <Card>
                        <Statistic
                            title={stat.title}
                            value={stat.value}
                            suffix={stat.suffix}
                            prefix={stat.icon}
                            valueStyle={{ color: stat.color }}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default StorageStats;