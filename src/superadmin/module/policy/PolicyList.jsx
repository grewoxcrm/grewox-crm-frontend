import React from "react";
import { Table, Space, Button, Tag, Tooltip, Modal, message, Dropdown, Input } from "antd";
import { FiEye, FiEdit2, FiTrash2, FiMoreVertical } from "react-icons/fi";
import moment from "moment";

const PolicyList = ({
  loading,
  policies = [],
  onEditPolicy,
  onDeletePolicy,
  onDelete,
  onView,
  pagination,
}) => {

    // const handleDelete = (id) => {
    //     Modal.confirm({
    //         title: 'Delete Policy',
    //         content: 'Are you sure you want to delete this policy?',
    //         okText: 'Yes',
    //         okType: 'danger', 
    //         bodyStyle: { padding: '20px' },
    //         cancelText: 'No',
    //         onOk: async () => {
    //             try {
    //                 await deletePolicy(id).unwrap();
    //                 message.success('Policy deleted successfully'); 
    //             } catch (error) {
    //                 message.error(error?.data?.message || 'Failed to delete policy');
    //             }
    //         },
    //     });
    // };


    const getDropdownItems = (record) => ({
      items: [
          {
              key: 'view',
              icon: <FiEye />,
              label: 'View Details',
              onClick: () => onView(record),
          },
          {
              key: 'edit',
              icon: <FiEdit2 />,
              label: 'Edit Policy',
              onClick: () => onEditPolicy(record),
          },
          {
              key: 'delete',
              icon: <FiTrash2 />,
              label: 'Delete Policy',
              danger: true,
              onClick: () => onDelete(record),
          }
      ]
  });
  const columns = [
   
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search policy title"
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
        record.title.toLowerCase().includes(value.toLowerCase()),
      render: (text) => text || "N/A",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => (a.description || "").localeCompare(b.description || ""),
      ellipsis: true,
      render: (text) => text || "N/A",
    },
    
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? moment(date).format("DD-MM-YYYY") : "N/A"),
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
          <Dropdown
              menu={getDropdownItems(record)}
              trigger={['click']}
              placement="bottomRight"
              overlayClassName="plan-actions-dropdown"
          >
              <Button
                  type="text"
                  icon={<FiMoreVertical />}
                  className="action-dropdown-button"
                  onClick={(e) => e.preventDefault()}
              />
          </Dropdown>
      ),
      width: '80px',
      fixed: 'right'
  },
  ];

  return (
    <Table
      columns={columns}
      dataSource={policies}
      rowKey="id"
      pagination={pagination}
      loading={loading}
      locale={{
        emptyText: "No policies found",
      }}
    />
  );
};

export default PolicyList;
