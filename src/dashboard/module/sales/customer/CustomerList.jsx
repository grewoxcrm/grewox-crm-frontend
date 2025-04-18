import React from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Tooltip,
  Typography,
  Modal,
  message,
  Input,
  Space,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetCustomersQuery,
  useDeleteCustomerMutation,
} from "./services/custApi";

const { Text } = Typography;

const CustomerList = ({
  onEdit,
  onDelete,
  onView,
  onCustomerClick,
  onCustomerRevenueClick, 
  custdata,
  searchText = "",
  //   customers = [],
}) => {
  // const { data: custdata, isLoading, error } = useGetCustomersQuery();
  const customers = custdata?.data;
  const [deleteCustomer] = useDeleteCustomerMutation();
  const filteredCustomers = React.useMemo(() => {
    return customers?.filter((customer) => {
      const searchLower = searchText.toLowerCase();
      const name = customer?.name?.toLowerCase() || "";
      const email = customer?.email?.toLowerCase() || "";
      const company = customer?.company?.toLowerCase() || "";
      const phone = customer?.phone?.toLowerCase() || "";

      return (
        !searchText ||
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        company.includes(searchLower) ||
        phone.includes(searchLower)
      );
    });
  }, [customers, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Customer",
      content: "Are you sure you want to delete this customer?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteCustomer(id).unwrap();
          message.success("Customer deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete customer");
        }
      },
    });
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onView?.(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => onEdit?.(record),
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
      title: "Customer Name",
      dataIndex: "name",
      key: "name",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search customer name"
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
        record.name.toLowerCase().includes(value.toLowerCase()) ||
        record.company?.toLowerCase().includes(value.toLowerCase()),
    
      render: (text, record) => (
        <Text
          strong
          style={{ cursor: "pointer" }}
          // onClick={() => onView?.(record)}
        >
          {text}
        </Text>
      ),
    },
   
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => (a?.email || "").localeCompare(b?.email || ""),
      render: (email) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiMail style={{ color: "#1890ff" }} />
          <a href={`mailto:${email}`}>{email}</a>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      sorter: (a, b) => (a?.contact || "").localeCompare(b?.contact || ""),
      render: (contact) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiPhone style={{ color: "#1890ff" }} />
          <a href={`tel:${contact}`}>{contact}</a>
        </div>
      ),
    },
    
    {
      title: "tax_number ",
      dataIndex: "tax_number",
      key: "tax_number",
      sorter: (a, b) =>
        (a?.tax_number || "").localeCompare(b?.tax_number || ""),
    },
    {
      title: "Action",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="customer-actions-dropdown"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-dropdown-button"
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="customer-list">
      <Table
        columns={columns}
        dataSource={filteredCustomers}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        onRow={(record) => ({
          onClick: () => onCustomerRevenueClick(record),
          style: { cursor: 'pointer' }
        })}
        className="customer-table"
      />
    </div>
  );
};

export default CustomerList;
