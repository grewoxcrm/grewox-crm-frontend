import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Input,
  Space,
  Tooltip,
  Typography,
  Modal,
  message,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import EditContact from "./EditContact";
import CreateContact from "./CreateContact";

const { Text } = Typography;

const ContactList = ({ onEdit, onView, searchText = "", contactsResponse, isLoading, companyAccountsResponse, isCompanyAccountsLoading, loggedInUser, onDelete }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const navigate = useNavigate();

  // Safely handle contacts data
  const contacts = React.useMemo(() => {
    if (!contactsResponse) return [];
    if (Array.isArray(contactsResponse)) return contactsResponse;
    if (contactsResponse?.data && Array.isArray(contactsResponse.data)) {
      return contactsResponse.data;
    }
    return [];
  }, [contactsResponse]);

  // Safely handle company accounts data
  const companyAccounts = React.useMemo(() => {
    if (!companyAccountsResponse) return [];
    if (Array.isArray(companyAccountsResponse)) return companyAccountsResponse;
    if (companyAccountsResponse?.data && Array.isArray(companyAccountsResponse.data)) {
      return companyAccountsResponse.data;
    }
    return [];
  }, [companyAccountsResponse]);

  // Create a map of company IDs to company names
  const companyMap = React.useMemo(() => {
    return companyAccounts.reduce((acc, company) => {
      acc[company.id] = company.company_name;
      return acc;
    }, {});
  }, [companyAccounts]);

  // Enhance contacts with company names
  const enhancedContacts = React.useMemo(() => {
    return contacts.map(contact => ({
      ...contact,
      company_display_name: companyMap[contact.company_name] || contact.company_name
    }));
  }, [contacts, companyMap]);

  const handleView = (record) => {
    navigate(`/dashboard/crm/contact/${record.id}`);
  };

  const filteredContacts = React.useMemo(() => {
    if (!enhancedContacts || !Array.isArray(enhancedContacts)) {
      return [];
    }
    return enhancedContacts.filter((contact) => {
      const searchLower = searchText.toLowerCase();
      const firstName = contact?.first_name?.toLowerCase() || "";
      const lastName = contact?.last_name?.toLowerCase() || "";
      const email = contact?.email?.toLowerCase() || "";
      const phone = contact?.phone?.toLowerCase() || "";
      const company = contact?.company_display_name?.toLowerCase() || "";
      const status = contact?.status?.toLowerCase() || "";

      return (
        !searchText ||
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        company.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [enhancedContacts, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Contact',
      content: 'Are you sure you want to delete this contact?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: '20px',
      },
      onOk: async () => {
        try {
          await deleteContact(id).unwrap();
          message.success('Contact deleted successfully');
        } catch (error) {
          console.error("Delete Error:", error);
          message.error(error?.data?.message || 'Failed to delete contact');
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedContact(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedContact(null);
  };

  const handleCreateModalClose = () => {
    setCreateModalVisible(false);
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => handleView(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => handleEdit(record),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => handleDelete(record.id),
        danger: true,
      },
    ],
  });

  const columns = [
    {
      title: "Name",
      key: "first_name",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search contact name"
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
        record.first_name.toLowerCase().includes(value.toLowerCase()) ||
        record.last_name.toLowerCase().includes(value.toLowerCase()),
      render: (_, record) => (
        <Text style={{ fontWeight: 500, cursor: 'pointer', color: '#1890ff' }} onClick={() => handleView(record)}>
          {`${record.first_name} ${record.last_name}`}
        </Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      sorter: (a, b) => a.phone.localeCompare(b.phone),
    },
    {
      title: "Company",
      dataIndex: "company_display_name",
      key: "company_display_name",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search company name"
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
        record.company_display_name.toLowerCase().includes(value.toLowerCase()) ||
        record.company_name?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Contact Owner",
      dataIndex: "contact_owner",
        key: "contact_owner",
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search account owner"
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
        record.contact_owner.toLowerCase().includes(value.toLowerCase()),


      render: (ownerId) => {
        if (ownerId === loggedInUser?.id) {
          return <Text>{loggedInUser?.username}</Text>;
        }
        return <Text>{ownerId}</Text>;
      }
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Action",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={getDropdownItems(record)}
            trigger={["click"]}
            placement="bottomRight"
            overlayClassName="contact-actions-dropdown"
          >
            <Button
              type="text"
              icon={
                <FiMoreVertical style={{ fontSize: "18px", color: "#8c8c8c" }} />
              }
              className="action-dropdown-button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              style={{
                padding: "4px",
                borderRadius: "4px",
                "&:hover": {
                  background: "#f5f5f5",
                },
              }}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        className="contact-list"
        style={{
          background: "#ffffff",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredContacts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
            style: {
              margin: "16px 24px",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            },
          }}
          className="contact-table"
          style={{
            "& .ant-table-thead > tr > th": {
              background: "#fafafa",
              fontWeight: 600,
              color: "#262626",
            },
            "& .ant-table-tbody > tr:hover > td": {
              background: "#f5f5f5",
            },
          }}
          onRow={(record) => ({
            onClick: () => handleView(record),
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      <EditContact
        open={editModalVisible}
        onCancel={handleEditModalClose}
        contactData={selectedContact}
      />

      <CreateContact
        open={createModalVisible}
        onCancel={handleCreateModalClose}
      />
    </>
  );
};

export default ContactList;
