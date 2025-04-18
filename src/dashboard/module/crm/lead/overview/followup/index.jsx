import React, { useState } from 'react';
import { Card, Button, Tabs, Dropdown, Typography } from 'antd';
import { FiPlus, FiCheckSquare, FiUsers, FiPhoneCall, FiCalendar, FiClock } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';
import './followup.scss';
import { useGetUsersQuery } from '../../../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../../../hrm/role/services/roleApi';
import CreateMeeting from './metting/CreatefollowupMeeting';
import CreatefollowupTask from './task/CreatefollowupTask';
import CreateCall from './call/CreatefollowupCall';
import CreateLog from './call/CreatefollowupLog';
import FollowupTaskList from './task';
import FollowupMeetingList from './metting';
import { useParams } from 'react-router-dom';
import FollowupCallList from './call';
const { Title, Text } = Typography;


const LeadFollowup = ({ leadId }) => {
    const leadIdParam = useParams();
    const id = leadId || leadIdParam.leadId;
    const [activeTab, setActiveTab] = useState('task');
    const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
    const [isMeetingModalVisible, setIsMeetingModalVisible] = useState(false);
    const [isCallModalVisible, setIsCallModalVisible] = useState(false);
    const [isLogModalVisible, setIsLogModalVisible] = useState(false);

    const currentUser = useSelector(selectCurrentUser);
    const { data: usersResponse } = useGetUsersQuery();
    const { data: rolesData } = useGetRolesQuery();

    // Get subclient role ID to filter it out
    const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

    // Filter users to get team members (excluding subclients)
    const users = usersResponse?.data?.filter(user =>
        user?.created_by === currentUser?.username &&
        user?.role_id !== subclientRoleId
    ) || [];

    const handleMenuClick = (e) => {
        switch(e.key) {
            case 'task':
                setIsTaskModalVisible(true);
                break;
            case 'meeting':
                setIsMeetingModalVisible(true);
                break;
            case 'schedule-call':
                setIsCallModalVisible(true);
                break;
            case 'log-call':
                setIsLogModalVisible(true);
                break;
            default:
                break;
        }
    };

    const items = [
        {
            key: 'task',
            label: 'Task',
            icon: <FiCheckSquare />
        },
        {
            key: 'meeting',
            label: 'Meeting',
            icon: <FiUsers />
        },
        {
            key: 'call',
            label: 'Call',
            icon: <FiPhoneCall />,
            children: [
                {
                    key: 'schedule-call',
                    label: 'Schedule Call',
                    icon: <FiCalendar />
                },
                {
                    key: 'log-call',
                    label: 'Log Call',
                    icon: <FiClock />
                }
            ]
        }
    ];

    const tabItems = [
        {
            key: 'task',
            label: (
                <span>
                    <FiCheckSquare /> Tasks
                </span>
            ),
            children: <FollowupTaskList leadId={id} users={users} />
        },
        {
            key: 'meeting',
            label: (
                <span>
                    <FiUsers /> Meetings
                </span>
            ),
            children: <FollowupMeetingList leadId={id} users={users} />
        },
        {
            key: 'call',
            label: (
                <span>
                    <FiPhoneCall /> Calls
                </span>
            ),
            children: <FollowupCallList leadId={id} users={users} />
        }
    ];

    return (
        <div className="invoice-page">
        {/* <div className="page-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/dashboard">
                <FiHome style={{ marginRight: "4px" }} />
                Home
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/dashboard/sales">Sales</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Invoices</Breadcrumb.Item>
          </Breadcrumb>
        </div> */}
  
        <div className="page-header">
          <div className="header-left">
            <h2>Follow-Ups</h2>
            <Text className="subtitle">Manage your followups</Text>
          </div>
  
          <div className="header-right">
            {/* <Input
              prefix={<FiSearch style={{ color: "#9CA3AF" }} />}
              placeholder="Search invoices..."
              className="search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            /> */}
            {/* <Dropdown menu={exportMenu} trigger={["click"]}>
              <Button>
                <FiDownload /> Export <FiChevronDown />
                    </Button>
            </Dropdown> */}
            <Dropdown 
                            menu={{ items, onClick: handleMenuClick }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <Button type="primary" icon={<FiPlus />}>
                                Create New
                            </Button>
                        </Dropdown>
                    </div>
                </div>


             {/* <div className="create-button" style={{ marginLeft: '1350px', marginBottom: '20px' }}>
                        <Dropdown 
                            menu={{ items, onClick: handleMenuClick }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <Button type="primary" icon={<FiPlus />}>
                                Create New
                            </Button>
                        </Dropdown>
                    </div> */}
            <Card>
                <div className="header-section">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={tabItems}
                        className="followup-tabs"
                    />
                   
                    </div>

            </Card>

            {/* Modals */}
            <CreatefollowupTask
                open={isTaskModalVisible}
                onCancel={() => setIsTaskModalVisible(false)}
                leadId={id}
            />
            <CreateMeeting
                open={isMeetingModalVisible}
                onCancel={() => setIsMeetingModalVisible(false)}
                leadId={id}
            />
            <CreateCall
                open={isCallModalVisible}
                onCancel={() => setIsCallModalVisible(false)}
                leadId={id}
            />
            <CreateLog
                open={isLogModalVisible}
                onCancel={() => setIsLogModalVisible(false)}
                leadId={id}
            />
        </div>
    );
};

export default LeadFollowup;
