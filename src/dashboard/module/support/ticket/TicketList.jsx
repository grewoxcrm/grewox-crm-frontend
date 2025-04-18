import React, { useCallback } from 'react';
import { Table, Tag, Dropdown, Button, message } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import moment from 'moment';
import { useUpdateTicketMutation } from './services/ticketApi';
import { useGetEmployeesQuery } from '../../hrm/Employee/services/employeeApi';

const TicketList = ({ tickets, onEdit, onDelete, onView, loading }) => {
    const [updateTicket] = useUpdateTicketMutation();
    
    // Fetch employees data to display their names
    const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployeesQuery();
    const priorityes = [
        { id: 'low', name: 'Low' },
        { id: 'medium', name: 'Medium' },
        { id: 'high', name: 'High' },
        { id: 'urgent', name: 'Urgent' }
      ];
    const statuses = [
        { id: 'open', name: 'Open' },
        { id: 'in_progress', name: 'In Progress' },
        { id: 'resolved', name: 'Resolved' },
        { id: 'closed', name: 'Closed' }
      ];
    // Process employees data for easier lookup
    const employeesMap = React.useMemo(() => {
        if (!employeesData) return {};
        
        const employeesList = Array.isArray(employeesData) 
            ? employeesData 
            : employeesData.data || [];
            
        const map = {};
        employeesList.forEach(employee => {
            map[employee.id] = {
                name: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
                email: employee.email
            };
        });
        return map;
    }, [employeesData]);
    
    // Function to get employee name from ID
    const getEmployeeName = useCallback((employeeId) => {
        if (!employeeId) return 'N/A';
        
        if (isLoadingEmployees) return 'Loading...';
        
        const employee = employeesMap[employeeId];
        if (!employee) return `Unknown (ID: ${employeeId})`;
        
        return employee.name || employee.email || `Employee ${employeeId}`;
    }, [employeesMap, isLoadingEmployees]);

    // Function to get menu items for each row
    const getActionItems = (record) => [
        {
            key: 'edit',
            icon: <FiEdit2 style={{ fontSize: '16px' }} />,
            label: 'Edit',
            onClick: () => onEdit?.(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 style={{ fontSize: '16px', color: '#ff4d4f' }} />,
            label: 'Delete',
            danger: true,
            onClick: () => onDelete?.(record)
        }
    ];

    const columns = [
        {
            title: 'Subject',
            dataIndex: 'ticketSubject',
            key: 'ticketSubject',
            sorter: (a, b) => a.ticketSubject.localeCompare(b.ticketSubject)
        },
        {
            title: 'Requester',
            dataIndex: 'requestor',
            key: 'requestor',
            render: (requestorId) => getEmployeeName(requestorId),
            sorter: (a, b) => {
                const nameA = getEmployeeName(a.requestor);
                const nameB = getEmployeeName(b.requestor);
                return nameA.localeCompare(nameB);
            }
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true, // Add ellipsis for long descriptions
            sorter: (a, b) => (a.description || '').localeCompare(b.description || '')
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            filters: priorityes.map(priority => ({
                text: priority.name,
                value: priority.id
              })),
              onFilter: (value, record) => record.priority === value,
            render: (priority) => {
                let color;
                switch (priority?.toLowerCase()) {
                    case 'low': color = 'green'; break;
                    case 'medium': color = 'blue'; break;
                    case 'high': color = 'orange'; break;
                    case 'urgent': color = 'red'; break;
                    default: color = 'default';
                }
                return (
                    <Tag color={color} style={{ textTransform: 'capitalize' }}>
                        {priority || 'N/A'}
                    </Tag>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: statuses.map(status => ({
                text: status.name,
                value: status.id
              })),
              onFilter: (value, record) => record.status === value,
            render: (status) => {
                let color;
                switch (status?.toLowerCase()) {
                    case 'open': color = 'blue'; break;
                    case 'in_progress': color = 'gold'; break;
                    case 'resolved': color = 'green'; break;
                    case 'closed': color = 'gray'; break;
                    default: color = 'default';
                }
                return (
                    <Tag color={color} style={{ textTransform: 'capitalize' }}>
                        {status?.replace(/_/g, ' ') || 'N/A'}
                    </Tag>
                );
            }
        },
        {
            title: 'Agent',
            dataIndex: 'agent',
            key: 'agent',
            sorter: (a, b) => a.agent.localeCompare(b.agent),
            render: (agent) => agent || 'N/A'
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'N/A',
            sorter: (a, b) => moment(a.createdAt || 0).unix() - moment(b.createdAt || 0).unix(),
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{ items: getActionItems(record) }}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayStyle={{ minWidth: '150px' }}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical style={{ fontSize: '18px' }} />}
                        style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f2f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    />
                </Dropdown>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={tickets}
            rowKey="id"
            scroll={{ x: 1300 }}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} tickets`
            }}
            style={{ background: '#ffffff', borderRadius: '8px' }}
        />
    );
};

export default TicketList;
