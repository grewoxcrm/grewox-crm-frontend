import React, { useState } from "react";
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
  DatePicker
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetCreditNotesQuery,
  useDeleteCreditNoteMutation,
} from "./services/creditNoteApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import EditCreditNotes from "./EditCreditNotes";
import { useGetInvoicesQuery } from "../invoice/services/invoiceApi";

const { Text } = Typography;

const CreditNotesList = ({ onEdit, onView, searchText = "", data }) => {
  const { data: credtdata = [], isLoading } = useGetCreditNotesQuery();
  const creditNotes = credtdata.data;
  const [deleteCreditNote] = useDeleteCreditNoteMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState(null);
  const { data: currenciesData } = useGetAllCurrenciesQuery();

  const { data: invdata } = useGetInvoicesQuery();
  const invoices = invdata?.data;

console.log("invoices",invoices);

  


  const getCurrencyIcon = (currencyId) => {
    const currency = currenciesData?.find(curr => curr.id === currencyId);
    return currency?.currencyIcon || '₹';
  };

  const filteredCreditNotes = React.useMemo(() => {
    return creditNotes?.filter((creditNote) => {
      const searchLower = searchText.toLowerCase();
      const amount = creditNote?.amount?.toString().toLowerCase() || "";
      const category = creditNote?.category?.toLowerCase() || "";
      const description = creditNote?.description?.toLowerCase() || "";
      const status = creditNote?.status?.toLowerCase() || "";

      return (
        !searchText ||
        amount.includes(searchLower) ||
        category.includes(searchLower) ||
        description.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [creditNotes, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Credit Note",
      content: "Are you sure you want to delete this credit note?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteCreditNote(id).unwrap();
          message.success("Credit note deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete credit note");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedCreditNote(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedCreditNote(null);
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
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search invoice"
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
        record.invoice.toLowerCase().includes(value.toLowerCase()) ||
        record.company_name?.toLowerCase().includes(value.toLowerCase()),
      render: (invoice) => {
        const invoiceData = invoices?.find(inv => inv.id === invoice);
        return (
          <Text style={{  fontWeight: 500 }}>
            {invoiceData?.salesInvoiceNumber || "N/A"}
          </Text>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (amount, record) => {
        const currencyIcon = getCurrencyIcon(record.currency);
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#1890ff",
              // fontWeight: 500,
            }}
          >
            <Text strong>
              {currencyIcon}
              {typeof amount === "number"
                ? amount.toFixed(2)
                : Number(amount).toFixed(2) || "0.00"}
            </Text>
          </div>
        );
      },
    },
    
   
    
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      sorter: (a, b) =>
        (a?.description || "").localeCompare(b?.description || ""),
      render: (description) => (
        <Text
          style={{
            color: "#595959",
            fontSize: "13px",
          }}
        >
          {description}
        </Text>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format('DD-MM-YYYY'),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
              <DatePicker
                  value={selectedKeys[0] ? dayjs(selectedKeys[0]) : null}
                  onChange={(date) => {
                      const dateStr = date ? date.format('YYYY-MM-DD') : null;
                      setSelectedKeys(dateStr ? [dateStr] : []);
                  }}
                  style={{ marginBottom: 8, display: 'block' }}
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
                  <Button
                      onClick={() => clearFilters()}
                      size="small"
                      style={{ width: 90 }}
                  >
                      Reset
                  </Button>
              </Space>
          </div>
      ),
      onFilter: (value, record) => {
          if (!value || !record.date) return false;
          return dayjs(record.date).format('YYYY-MM-DD') === value;
      },
      filterIcon: filtered => (
          <FiCalendar style={{ color: filtered ? '#1890ff' : undefined }} />
      )
    },
    
  ];

  return (
    <div
      className="revenue-list"
      style={{
        background: "#ffffff",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Table
        columns={columns}
        dataSource={filteredCreditNotes}
        rowKey="id"
        // loading={isLoading}
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
        className="revenue-table"
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
      />
      {selectedCreditNote && (
        <EditCreditNotes
          open={editModalVisible}
          onCancel={handleEditModalClose}
          initialValues={selectedCreditNote}
        />
      )}
    </div>
  );
};

export default CreditNotesList;
