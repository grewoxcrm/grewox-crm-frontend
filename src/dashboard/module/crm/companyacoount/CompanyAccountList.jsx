import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Tooltip,
  Typography,
  Modal,
  Input,
  Space,
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
import EditCompanyAccount from "./EditCompanyAccount";
import CreateCompanyAccount from "./CreateCompanyAccount";


const { Text } = Typography;

const CompanyAccountList = ({ onEdit, onDelete, onView, searchText = "", companyAccountsResponse, isLoading, isCompanyAccountsLoading, loggedInUser }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const navigate = useNavigate();
  
  // RTK Query hooks


  // Extract the actual company accounts array from the response
  const companyAccounts = Array.isArray(companyAccountsResponse.data) 
    ? companyAccountsResponse.data 
    : Array.isArray(companyAccountsResponse) 
      ? companyAccountsResponse 
      : [];




  const handleView = (record) => {
    navigate(`/dashboard/crm/company-account/${record.id}`);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedCompany(null);
  };

  const handleCreateModalClose = () => {
    setCreateModalVisible(false);
  };

  // Filter companies based on search text
  const filteredCompanies = React.useMemo(() => {
    if (!Array.isArray(companyAccounts)) {
      return [];
    }
    return companyAccounts.filter((company) => {
      const searchLower = searchText.toLowerCase();
      const name = company?.company_name?.toLowerCase() || "";
      const owner = company?.account_owner?.toLowerCase() || "";
      const phone = company?.phone_number?.toLowerCase() || "";
      const status = company?.status?.toLowerCase() || "";

      return (
        !searchText ||
        name.includes(searchLower) ||
        owner.includes(searchLower) ||
        phone.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [companyAccounts, searchText]);

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => {
          handleView(record);
        },
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => {
          setSelectedCompany(record);
          setEditModalVisible(true);
        },
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => {
          onDelete(record.id);
        },
        danger: true,
      },
    ],
  });

  const columns = [
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
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
        record.company_name.toLowerCase().includes(value.toLowerCase()),
      render: (name, record) => (
        <Text 
        style={{ fontWeight: 500, cursor: 'pointer', color: '#1890ff' }}
        onClick={() => handleView(record)}
        >
          {name}
        </Text>
      ),
      // sorter: (a, b) => a.company_name.localeCompare(b.company_name),
    },
    {
      title: "Account Owner",
      dataIndex: "account_owner",
      key: "account_owner",
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
        record.account_owner.toLowerCase().includes(value.toLowerCase()),
      render: (ownerId) => {
        if (ownerId === loggedInUser?.id) {
          return <Text>{loggedInUser?.username}</Text>;
        }
        return <Text>{ownerId}</Text>;
      }
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
      sorter: (a, b) => a.phone_number.localeCompare(b.phone_number),
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
            overlayClassName="company-actions-dropdown"
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
        className="company-list"
        style={{
          background: "#ffffff",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredCompanies}
          rowKey="id"
          loading={isLoading}
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
          className="company-table"
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

      <EditCompanyAccount
        open={editModalVisible}
        onCancel={handleEditModalClose}
        companyData={selectedCompany}
      />

      <CreateCompanyAccount 
        open={createModalVisible}
        onCancel={handleCreateModalClose}
      />
    </>
  );
};

export default CompanyAccountList;
