import React, { useState } from "react";
import { Table, Button, Tag, Dropdown, Typography, Modal, message, Space, Input, DatePicker } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDownload,
  FiPlus,
  FiSearch,
  FiSend
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetInvoicesQuery,
  useDeleteInvoiceMutation,
  useUpdateInvoiceMutation,
} from "./services/invoiceApi";
import EditInvoice from "./EditInvoice";
import ViewInvoice from './ViewInvoice';
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useGetCustomersQuery } from "../customer/services/custApi";
import { useGetContactsQuery } from "../../crm/contact/services/contactApi";
import { useGetCompanyAccountsQuery } from "../../crm/companyacoount/services/companyAccountApi";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const InvoiceList = ({ searchText = "",invoices, isLoading, filters = {} }) => {
 

  // const { data: invoicesdata = [], isLoading } = useGetInvoicesQuery(id);
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [updateInvoice] = useUpdateInvoiceMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // const invoices = invoicesdata?.data || [];
  const { data: customersData } = useGetCustomersQuery();
  const { data: contactsData } = useGetContactsQuery();
  const { data: companyAccountsData } = useGetCompanyAccountsQuery();

  const statuses = [
    { id: 'paid', name: 'Paid' },
    { id: 'unpaid', name: 'Unpaid' },
    { id: 'partial', name: 'Partial' },
   
  ];
  

  // Filter invoices based on search text and date range
  const filteredInvoices = React.useMemo(() => {
    return invoices?.filter((invoice) => {
      const searchLower = searchText.toLowerCase();
      const invoiceNumber = invoice?.salesInvoiceNumber?.toLowerCase() || "";
      const customerName = invoice?.customerName?.toLowerCase() || "";
      const total = invoice?.total?.toString().toLowerCase() || "";
      const status = invoice?.payment_status?.toLowerCase() || "";

      const matchesSearch = !searchText ||
        invoiceNumber.includes(searchLower) ||
        customerName.includes(searchLower) ||
        total.includes(searchLower) ||
        status.includes(searchLower);

      const matchesDateRange = !filters.dateRange?.length ||
        (dayjs(invoice?.issueDate).isAfter(filters.dateRange[0]) &&
          dayjs(invoice?.dueDate).isBefore(filters.dateRange[1]));

      return matchesSearch && matchesDateRange;
    });
  }, [invoices, searchText, filters]);

  const getStatusTag = (status) => {
    const statusColors = {
      draft: "#d97706",
      pending: "#2563eb",
      paid: "#059669",
      unpaid: "#dc2626",
      partially_paid: "#7c3aed"
    };

    const statusBgColors = {
      draft: "#fef3c7",
      pending: "#dbeafe",
      paid: "#d1fae5",
      unpaid: "#fee2e2",
      partially_paid: "#ede9fe"
    };

    return (
      <Tag
        className={`status-tag ${status}`}
        style={{
          color: statusColors[status],
          backgroundColor: statusBgColors[status],
          border: "none",
          textTransform: "capitalize",
          borderRadius: "6px",
          padding: "4px 8px",
        }}
      >
        {status}
      </Tag>
    );
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Invoice",
      content: "Are you sure you want to delete this invoice?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteInvoice(id).unwrap();
          message.success("Invoice deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete invoice");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedInvoice(record);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (formData) => {
    try {
      await updateInvoice({
        id: selectedInvoice.id,
        data: formData,
      }).unwrap();
      setEditModalVisible(false);
      setSelectedInvoice(null);
    } catch (error) {
      message.error(error?.data?.message || "Failed to update invoice");
    }
  };

  const handleView = (record) => {
    // Ensure we have valid data
    if (record) {
      let items = [];
      try {
        // Parse items if it's a string
        if (typeof record.items === 'string') {
          items = JSON.parse(record.items);
        } else if (Array.isArray(record.items)) {
          items = record.items;
        }

        // Format items to ensure consistent structure
        items = items.map(item => ({
          item_name: item.item_name || item.name || item.description,
          quantity: Number(item.quantity) || 0,
          unit_price: Number(item.unit_price || item.rate) || 0,
          description: item.description || item.item_name || item.name,
        }));

      } catch (error) {
        console.error('Error parsing invoice items:', error);
        items = [];
      }

      // Format the invoice data
      const formattedInvoice = {
        ...record,
        items,
        subtotal: Number(record.subtotal) || 0,
        tax: Number(record.tax) || 0,
        discount: Number(record.discount) || 0,
        total: Number(record.total) || 0,
        issueDate: record.issueDate || new Date(),
        dueDate: record.dueDate || new Date(),
      };

      setSelectedInvoice(formattedInvoice);
      setIsViewModalOpen(true);
    }
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye style={{ fontSize: '14px' }} />,
        label: "View Invoice",
        onClick: () => handleView(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 style={{ fontSize: '14px' }} />,
        label: "Edit Invoice",
        onClick: () => handleEdit(record),
      },
      {
        key:"send_invoice",
        icon:<FiSend style={{ fontSize: '14px' }} />,
        label: "Send Invoice to Customer",
        onClick: () => handleSendInvoice(record),
      },
      // {
      //   key: "download",
      //   icon: <FiDownload />,
      //   label: "Download Invoice",
      //   onClick: () => {
      //     setSelectedInvoice(record);
      //     setIsViewModalOpen(true);
      //   },
      // },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete Invoice",
        onClick: () => handleDelete(record.id),
        danger: true,
      },
    ],
  });

  const getCustomerName = (customerId, category) => {
    if (!customerId) return "N/A";

    switch (category) {
      case 'customer':
        const customer = customersData?.data?.find(c => c.id === customerId);
        return customer?.name || "N/A";
      
      case 'contact':
        const contact = contactsData?.data?.find(c => c.id === customerId);
        return contact?.name || 
          `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim() ||
          contact?.contact_name ||
          "N/A";
      
      case 'company_account':
        const company = companyAccountsData?.data?.find(c => c.id === customerId);
        return company?.company_name ||
          company?.name ||
          company?.account_name ||
          "N/A";
      
      default:
        return "N/A";
    }
  };

  const columns = [
    {
      title: "Invoice Number",
      dataIndex: "salesInvoiceNumber",
      key: "salesInvoiceNumber",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search invoice number"
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
      onFilter: (value, record) => {
        const invoiceNumber = record?.salesInvoiceNumber?.toLowerCase() || '';
        const customerName = record?.customerName?.toLowerCase() || '';
        return invoiceNumber.includes(value.toLowerCase()) || 
               customerName.includes(value.toLowerCase());
      },
      render: (text, record) => (
        <Text strong style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => handleView(record)}>
          {text}
        </Text>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (customerId, record) => (
        <Text>
          {getCustomerName(customerId, record.category)}
        </Text>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search customer"
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
      onFilter: (value, record) => {
        const customerName = getCustomerName(record?.customer, record?.category)?.toLowerCase() || '';
        return customerName.includes(value.toLowerCase());
      },
    },
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
      sorter: (a, b) => new Date(a.issueDate) - new Date(b.issueDate),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
      sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (amount, record) => {
        // Get currency details from the record
        const currencyDetails = currenciesData?.find(curr => curr.id === record.currency);
        const currencyIcon = currencyDetails?.currencyIcon || '₹';
        
        return (
          <Text strong>
            {currencyIcon}
            {Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </Text>
        );
      },
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "Pending Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => {
        // Get currency details from the record
        const currencyDetails = currenciesData?.find(curr => curr.id === record.currency);
        const currencyIcon = currencyDetails?.currencyIcon || '₹';
        
        return (
          <Text strong>
            {currencyIcon}
            {Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </Text>
        );
      },
      sorter: (a, b) => a.total - b.total,
    },

    {
      title: "Status",
      dataIndex: "payment_status",
      key: "payment_status",
      filters: statuses.map(status => ({
        text: status.name,
        value: status.id
      })),
      onFilter: (value, record) => record.payment_status === value,
      render: (status) => getStatusTag(status)
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
          overlayClassName="invoice-actions-dropdown"
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
    <>
      <div className="invoice-list">
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} invoices`,
          }}
          className="invoice-table"
          loading={isLoading}
        />
      </div>

      <EditInvoice
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedInvoice(null);
        }}
        initialValues={selectedInvoice}
      />

      <ViewInvoice
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </>
  );
};

export default InvoiceList;
