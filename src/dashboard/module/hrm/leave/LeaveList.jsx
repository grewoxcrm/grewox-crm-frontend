import React, { useState, useMemo } from "react";
import { Table, Button, Tag, Dropdown, Typography, Modal, message, Input, Space } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiCalendar,
} from "react-icons/fi";
import dayjs from "dayjs";
import { 
  useGetLeaveQuery,
  useDeleteLeaveMutation,
  useUpdateLeaveMutation,
  useApproveLeaveMutation,
} from "./services/LeaveApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";
import EditLeave from "./Editleave";

const { Text } = Typography;

const LeaveList = ({ onEdit, onView, searchText = "", filters = {} }) => {
  const { data: leavedata = [], isLoading } = useGetLeaveQuery();
  const { data: employeesData } = useGetEmployeesQuery();
  const leaves = leavedata.data || [];
  const employees = employeesData?.data || [];
  const [deleteLeave] = useDeleteLeaveMutation();
  const [updateLeave] = useUpdateLeaveMutation();
  const [approveLeave] = useApproveLeaveMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [processingLeaveId, setProcessingLeaveId] = useState(null);
  const [processedLeaves, setProcessedLeaves] = useState(new Set());

  // Create a map of employee IDs to employee names
  const employeeMap = useMemo(() => {
    return employees.reduce((acc, employee) => {
      acc[employee.id] = `${employee.firstName} ${employee.lastName}`;
      return acc;
    }, {});
  }, [employees]);

  const leaveTypes = [
    { id: 'annual', name: 'Annual' },
    { id: 'sick', name: 'Sick' },
    { id: 'casual', name: 'Casual' },
    { id: 'other', name: 'Other' },
  ];

  const statuses = [
    { id: 'approved', name: 'Approved' },
    { id: 'pending', name: 'Pending' },
    { id: 'rejected', name: 'Rejected' },
  ];

  const filteredLeaves = React.useMemo(() => {
    return leaves?.filter((leave) => {
      const searchLower = searchText.toLowerCase();
      const employeeName = employeeMap[leave.employeeId]?.toLowerCase() || "";
      const leaveType = leave?.leaveType?.toLowerCase() || "";
      const status = leave?.status?.toLowerCase() || "";
      const reason = leave?.reason?.toLowerCase() || "";

      const matchesSearch = !searchText ||
        employeeName.includes(searchLower) ||
        leaveType.includes(searchLower) ||
        status.includes(searchLower) ||
        reason.includes(searchLower);

      const matchesDateRange = !filters.dateRange?.length ||
        (dayjs(leave?.startDate).isAfter(filters.dateRange[0]) &&
          dayjs(leave?.endDate).isBefore(filters.dateRange[1]));

      return matchesSearch && matchesDateRange;
    });
  }, [leaves, searchText, employeeMap, filters]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Leave Request",
      content: "Are you sure you want to delete this leave request?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteLeave(id).unwrap();
          message.success("Leave request deleted successfully");
        } catch (error) {
          message.error(
            error?.data?.message || "Failed to delete leave request"
          );
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedLeave(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedLeave(null);
  };

  const handleLeaveAction = async (id, status, employeeId) => {
    setProcessingLeaveId(id);
    try {
      await approveLeave({
        id,
        data: {
          status,
          employeeId,
          remarks: status === "approved" ? "Leave approved." : "Leave rejected.",
        },
      }).unwrap();
      
      setProcessedLeaves((prev) => new Set([...prev, id]));
      message.success(
        `Leave ${status === "approved" ? "approved" : "rejected"} successfully`
      );
    } catch (error) {
      message.error(error?.data?.message || `Failed to ${status} leave`);
    } finally {
      setProcessingLeaveId(null);
    }
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Employee Name",
      dataIndex: "employeeId",
      key: "employeeId",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search employee name"
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
        record.employeeId.toLowerCase().includes(value.toLowerCase()) ||
        record.company_name?.toLowerCase().includes(value.toLowerCase()),
      render: (employeeId) => (
        <Text style={{ color: "#262626" }}>
          {employeeMap[employeeId] || "Unknown Employee"}
        </Text>
      ),
    },
    {
      title: "Leave Type",
      dataIndex: "leaveType",
      key: "leaveType",
      filters: leaveTypes.map(leaveType => ({
        text: leaveType.name,
        value: leaveType.id
      })),
      onFilter: (value, record) => record.leaveType === value,
      render: (leaveType) => (
        <Tag
          color="blue"
          style={{ borderRadius: "4px", padding: "2px 8px", fontSize: "13px" }}
        >
          {leaveType}
        </Tag>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (startDate) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiCalendar style={{ color: "#1890ff", fontSize: "16px" }} />
          <Text>{dayjs(startDate).format("DD-MM-YYYY")}</Text>
        </div>
      ),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
      render: (endDate) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiCalendar style={{ color: "#1890ff", fontSize: "16px" }} />
          <Text>{dayjs(endDate).format("DD-MM-YYYY")}</Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
        key: "status",
        filters: statuses.map(status => ({
            text: status.name,
            value: status.id
          })),
          onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          style={{ 
            textTransform: "uppercase",
            fontWeight: 500,
            padding: "4px 12px",
            borderRadius: "16px",
            fontSize: "12px"
          }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      sorter: (a, b) => (a?.reason || "").localeCompare(b?.reason || ""),
      render: (reason) => (
        <Text style={{ color: "#595959", fontSize: "13px" }}>{reason}</Text>
      ),
    },
    {
      title: "Approval Actions",
      key: "approvalActions",
      width: 200,
      render: (_, record) => {
        const isProcessing = processingLeaveId === record.id;
        const isStatusFinal = record.status?.toLowerCase() === "approved" || record.status?.toLowerCase() === "rejected";
        const isProcessed = processedLeaves.has(record.id);
        const isDisabled = isProcessing || isStatusFinal || isProcessed;

        return (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              type="primary"
              size="small"
              onClick={() =>
                handleLeaveAction(record.id, "approved", record.employeeId)
              }
              disabled={isDisabled}
              loading={isProcessing}
              style={{ 
                backgroundColor: "#4096ff", 
                borderColor: "#4096ff",
                borderRadius: "6px",
                fontWeight: 500
              }}
            >
              Accept
            </Button>
            <Button
              danger
              size="small"
              onClick={() =>
                handleLeaveAction(record.id, "rejected", record.employeeId)
              }
              disabled={isDisabled}
              loading={isProcessing}
              style={{
                borderRadius: "6px",
                fontWeight: 500
              }}
            >
              Reject
            </Button>
          </div>
        );
      },
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
          overlayClassName="leave-actions-dropdown"
        >
          <Button
            type="text"
            icon={
              <FiMoreVertical style={{ fontSize: "18px", color: "#8c8c8c" }} />
            }
            className="action-dropdown-button"
            onClick={(e) => e.preventDefault()}
            style={{
              padding: "4px",
              borderRadius: "4px",
              "&:hover": {
                background: "#f5f5f5",
              },
            }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
      <div className="leave-list">
      <Table
        columns={columns}
        dataSource={filteredLeaves}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1000 }}
        pagination={{
          total: filteredLeaves?.length || 0,
          pageSize: 10,
          showTotal: (total) => `Total ${total} leaves`,
          showSizeChanger: true,
          showQuickJumper: true,
          size: 'default',
          position: ['bottomRight']
        }}
        className="leave-table"
      />
      {selectedLeave && (
        <EditLeave
          open={editModalVisible}
          onCancel={handleEditModalClose}
          initialValues={selectedLeave}
        />
      )}
    </div>
  );
};

export default LeaveList;
