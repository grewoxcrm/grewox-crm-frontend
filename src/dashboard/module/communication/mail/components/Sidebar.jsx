import React, { useState } from 'react';
import { Layout, Menu, Button, Badge } from 'antd';
import { FiEdit, FiInbox, FiStar, FiAlertCircle, FiSend, FiClock, FiTrash2, FiSettings } from 'react-icons/fi';
import EmailSettingsModal from './EmailSettingsModal';

const { Sider } = Layout;

const Sidebar = ({ 
  selectedMenu, 
  setSelectedMenu, 
  unreadCount, 
  starredCount,
  importantCount,
  scheduledCount,
  trashCount,
  setComposeVisible 
}) => {
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <Sider width={280} className="mail-sider">
      <div className="mail-filters">
        <Button
          type="primary"
          icon={<FiEdit />}
          size="large"
          block
          onClick={() => setComposeVisible(true)}
          className="compose-button"
        >
          Compose
        </Button>

        <Menu
          selectedKeys={[selectedMenu]}
          onClick={({ key }) => setSelectedMenu(key)}
          items={[
            {
              key: 'inbox',
              icon: <FiInbox />,
              label: 'Inbox',
              suffix: unreadCount > 0 && <Badge count={unreadCount} style={{ backgroundColor: '#1890ff' }} />
            },
            {
              key: 'starred',
              icon: <FiStar />,
              label: 'Starred',
              suffix: starredCount > 0 && <Badge count={starredCount} />
            },
            {
              key: 'important',
              icon: <FiAlertCircle />,
              label: 'Important',
              suffix: importantCount > 0 && <Badge count={importantCount} />
            },
            {
              key: 'sent',
              icon: <FiSend />,
              label: 'Sent'
            },
            {
              key: 'scheduled',
              icon: <FiClock />,
              label: 'Scheduled',
              suffix: scheduledCount > 0 && <Badge count={scheduledCount} />
            },
            {
              key: 'trash',
              icon: <FiTrash2 />,
              label: 'Trash',
              suffix: trashCount > 0 && <Badge count={trashCount} />
            },
            {
              type: 'divider'
            },
            // {
            //   key: 'settings',
            //   icon: <FiSettings />,
            //   label: 'Email Settings',
            //   onClick: () => setSettingsVisible(true)
            // }
          ]}
        />
      </div>

      <EmailSettingsModal
        visible={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
      />
    </Sider>
  );
};

export default Sidebar;