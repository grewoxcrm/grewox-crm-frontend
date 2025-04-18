import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  message,
  Input,
  Dropdown,
  Menu,
  Breadcrumb,
  Row,
  Col,
  Tabs,
  DatePicker,
  Space,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import CreateLeave from "./CreateLeave";
import LeaveList from "./LeaveList";
import EditLeave from "./Editleave";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import { useGetLeaveQuery } from "./services/LeaveApi";
import "./leave.scss";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const Leave = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState("list"); // 'list' or 'grid'
  const [filters, setFilters] = useState({
    dateRange: [],
  });
  const { data: leaveData = [], isLoading } = useGetLeaveQuery();

  const handleCreate = () => {
    setSelectedLeave(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedLeave(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    console.log("View leave request:", record);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#faad14", fontSize: "22px" }}>⚠</span>
          Delete Leave Request
        </div>
      ),
      content: "Are you sure you want to delete this leave request?",
      okText: "Yes",
      cancelText: "No",
      centered: true,
      className: "custom-delete-modal",
      icon: null,
      maskClosable: true,
      okButtonProps: {
        danger: true,
        size: "middle",
      },
      cancelButtonProps: {
        size: "middle",
      },
      onOk: () => {
        message.success("Leave request deleted successfully");
      },
    });
  };

  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({
      ...prev,
      dateRange: dates ? [dates[0].startOf('day'), dates[1].endOf('day')] : []
    }));
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = leaveData?.data?.map((leave) => ({
        'Employee Name': leave.employeeName || '-',
        'Leave Type': leave.leaveType || '-',
        'Start Date': leave.startDate ? moment(leave.startDate).format('DD-MM-YYYY') : '-',
        'End Date': leave.endDate ? moment(leave.endDate).format('DD-MM-YYYY') : '-',
        'Status': leave.status || '-',
        'Reason': leave.reason || '-',
        'Created At': leave.created_at ? moment(leave.created_at).format('DD-MM-YYYY') : '-',
        'Department': leave.department || '-',
        'Total Days': leave.totalDays || '-'
      })) || [];

      if (data.length === 0) {
        message.warning('No data available to export');
        return;
      }

      const fileName = `leave_requests_${moment().format('DD-MM-YYYY')}`;

      switch (type) {
        case 'csv':
          const csvContent = [
            Object.keys(data[0]).join(','),
            ...data.map(item => 
              Object.values(item)
                .map(value => `"${value?.toString().replace(/"/g, '""')}"`)
                .join(',')
            )
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `${fileName}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          message.success('Successfully exported as CSV');
          break;

        case 'excel':
          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Leave Requests');
          XLSX.writeFile(wb, `${fileName}.xlsx`);
          message.success('Successfully exported as Excel');
          break;

        case 'pdf':
          const doc = new jsPDF('l', 'pt', 'a4');
          doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { 
              fontSize: 8,
              cellPadding: 2
            },
            theme: 'grid'
          });
          doc.save(`${fileName}.pdf`);
          message.success('Successfully exported as PDF');
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="revenue-page">
      <div className="page-breadcrumb">
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/dashboard">
                  <FiHome /> Home
                </Link>
              ),
            },
            {
              title: "HRM",
            },
            {
              title: "Leave Management",
            },
          ]}
        />
      </div>

      <div className="page-header">
        <div className="page-title">
          <h2>Leave Management</h2>
          <Text type="secondary">Manage employee leave requests</Text>
        </div>
        <div className="header-actions">
          <div className="search-filter-group" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Input
              placeholder="Search leave requests..."
              prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ 
                width: '300px', 
                borderRadius: '20px',
                height: '38px'
              }}
            />
            <RangePicker
              onChange={handleDateRangeChange}
              value={filters.dateRange}
              allowClear
              style={{ width: 300, height: 40 }}
              placeholder={['Start Date', 'End Date']}
            />
          </div>
          <div className="action-buttons">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'csv',
                    label: 'Export as CSV',
                    icon: <FiDownload />,
                    onClick: () => handleExport('csv')
                  },
                  {
                    key: 'excel',
                    label: 'Export as Excel',
                    icon: <FiDownload />,
                    onClick: () => handleExport('excel')
                  },
                  {
                    key: 'pdf',
                    label: 'Export as PDF',
                    icon: <FiDownload />,
                    onClick: () => handleExport('pdf')
                  }
                ]
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button className="export-button" loading={loading}>
                <FiDownload /> Export <FiChevronDown />
              </Button>
            </Dropdown>
            <Button type="primary" className="add-button" onClick={handleCreate}>
              <FiPlus /> New Leave Request
            </Button>
          </div>
        </div>
      </div>

      <LeaveList
        onEdit={handleEdit}
        onView={handleView}
        searchText={searchText}
        filters={filters}
      />

      {isCreateModalOpen && (
        <CreateLeave
          open={isCreateModalOpen}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      )}

      {isEditModalOpen && selectedLeave && (
        <EditLeave
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          initialValues={selectedLeave}
        />
      )}
    </div>
  );
};

export default Leave;
