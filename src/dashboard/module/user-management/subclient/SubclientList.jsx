import React from 'react';
import { Table, Button, Tag, Dropdown, Menu, Avatar, Input, Space } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiUserCheck, FiLock, FiShield, FiUser, FiBriefcase, FiUsers, FiEye } from 'react-icons/fi';
import moment from 'moment';

const SubclientList = ({ subclients, loading, onEdit, onDelete, onView }) => {
    const getRoleColor = (role) => {
        const roleColors = {
            'super-admin': {
                color: '#531CAD',
                bg: '#F9F0FF',
                border: '#D3ADF7'
            },
            'client': {
                color: '#08979C',
                bg: '#E6FFFB',
                border: '#87E8DE'
            },
            'sub-client': {
                color: '#389E0D',
                bg: '#F6FFED',
                border: '#B7EB8F'
            },
            'employee': {
                color: '#D46B08',
                bg: '#FFF7E6',
                border: '#FFD591'
            },
            'default': {
                color: '#595959',
                bg: '#FAFAFA',
                border: '#D9D9D9'
            }
        };
        return roleColors[role?.toLowerCase()] || roleColors.default;
    };

    const getInitials = (username) => {
        return username
            ? username.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
            : 'U';
    };

    const getActionMenu = (record) => (
        <Menu className="action-menu">
            <Menu.Item
                key="edit"
                icon={<FiEdit2 />}
                onClick={() => onEdit(record)}
            >
                Edit Subclient
            </Menu.Item>
            <Menu.Item
                key="delete"
                icon={<FiTrash2 />}
                danger
                onClick={() => onDelete(record)}
            >
                Delete Subclient
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profilePic',
            key: 'profilePic',
            width: 80,
            sorter: (a, b) => (a.profilePic || '').localeCompare(b.profilePic || ''),
            render: (profilePic, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        size={40}
                        src={profilePic}
                        icon={!profilePic && <FiUser />}
                        style={{
                            backgroundColor: !profilePic ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {!profilePic && getInitials(record.username)}
                    </Avatar>
                </div>
            ),
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search username"
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                  />
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => confirm()}
                      size="small"
                      style={{ width: 90 }}
                    >
                      Filter
                    </Button>
                    <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                      Reset
                    </Button>
                  </Space>
                </div>
              ),
              onFilter: (value, record) =>
                record.username.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),   
            render: (text) => (
                <div style={{
                    fontWeight: 500,
                    color: '#262626',
                    fontSize: '14px'
                }}>
                    {text}
                </div>
            ),
            width: '200px'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
            render: (text) => (
                <span style={{ color: '#595959', fontSize: '14px' }}>
                    {text || 'N/A'}
                </span>
            ),
            width: '30%',
        },
        {
            title: 'Role',
            dataIndex: 'role_name',
            key: 'role_name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search role"
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                  />
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => confirm()}
                      size="small"
                      style={{ width: 90 }}
                    >
                      Filter
                    </Button>
                    <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                      Reset
                    </Button>
                  </Space>
                </div>
              ),
              onFilter: (value, record) =>
                record.role_name.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            width: '20%',
            render: (role) => {
                const roleStyle = getRoleColor(role);
                return (
                    <div className="role-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            className="role-indicator"
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: roleStyle.color,
                                boxShadow: `0 0 8px ${roleStyle.color}`,
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                    '0%': {
                                        transform: 'scale(1)',
                                        opacity: 1
                                    },
                                    '50%': {
                                        transform: 'scale(1.2)',
                                        opacity: 0.8
                                    },
                                    '100%': {
                                        transform: 'scale(1)',
                                        opacity: 1
                                    }
                                }
                            }}
                        />
                        <Tag
                            style={{
                                textTransform: 'capitalize',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                fontSize: '14px',
                                margin: 0,
                                background: roleStyle.bg,
                                border: `1px solid ${roleStyle.border}`,
                                color: roleStyle.color,
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {role?.toLowerCase() === 'super-admin' && <FiShield size={12} />}
                            {role?.toLowerCase() === 'admin' && <FiUser size={12} />}
                            {role?.toLowerCase() === 'client' && <FiBriefcase size={12} />}
                            {role?.toLowerCase() === 'employee' && <FiUsers size={12} />}
                            {role || 'N/A'}
                        </Tag>
                    </div>
                );
            },
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => (
                <div className="date-cell">
                    <span className="date">
                        {moment(date).format('MMM DD, YYYY')}
                    </span>
                    <span className="time">
                        {moment(date).format('h:mm A')}
                    </span>
                </div>
            ),
            sorter: (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix(),
            width: '180px'
        },
        {
            title: 'Updated At',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (date) => (
                <div className="date-cell">
                    {date ? (
                        <>
                            <span className="date">
                                {moment(date).format('MMM DD, YYYY')}
                            </span>
                            <span className="time">
                                {moment(date).format('h:mm A')}
                            </span>
                        </>
                    ) : (
                        <span className="no-date">-</span>
                    )}
                </div>
            ),
            sorter: (a, b) => {
                if (!a.updated_at) return -1;
                if (!b.updated_at) return 1;
                return moment(a.updated_at).unix() - moment(b.updated_at).unix();
            },
            width: '180px'
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '60px',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    overlay={getActionMenu(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="subclient-actions-dropdown"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical size={16} />}
                        className="action-button"
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <Table
            dataSource={subclients}
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: false,
                showTotal: (total) => `Total ${total} items`,
            }}
        />
    );
};

export default SubclientList;
