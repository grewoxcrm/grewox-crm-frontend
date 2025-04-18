import React from "react";
import { Table, Avatar, Dropdown, Button, message, Tag, Typography, Space, Tooltip, Menu, Input, Select, DatePicker } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiZap,
  FiTarget,
  FiTrendingUp,
  FiLink,
  FiInfo,
  FiCheck,
  FiArrowRight,
  FiDollarSign,
  FiBriefcase,
  FiX,
  FiFilter,
  FiSearch,
  FiTag,
  FiLayers,
  FiStar,
  FiCalendar
} from "react-icons/fi";
import { useGetDealsQuery, useDeleteDealMutation } from "./services/dealApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLabelsQuery, useGetSourcesQuery } from "../crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useNavigate } from "react-router-dom";
import { useGetAllCurrenciesQuery } from '../../../module/settings/services/settingsApi';
import { useGetContactsQuery } from "../contact/services/contactApi";
import { useGetCompanyAccountsQuery } from "../companyacoount/services/companyAccountApi";
import moment from 'moment';
import dayjs from 'dayjs';
import { formatCurrency } from '../../../utils/currencyUtils';

const { Text } = Typography;

const DealList = ({ onEdit, onView, onDealClick, deals = [] }) => {
  const loggedInUser = useSelector(selectCurrentUser);
  const [deleteDeal] = useDeleteDealMutation();
  const { data: dealStages = [] } = useGetLeadStagesQuery();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: labelsData } = useGetLabelsQuery(loggedInUser?.id);
  const { data: currencies = [] } = useGetAllCurrenciesQuery();
  const { data: contactsResponse, isLoading: isContactsLoading, error: contactsError } = useGetContactsQuery();
  const { data: companyAccountsResponse = { data: [] }, isLoading: isCompanyAccountsLoading } = useGetCompanyAccountsQuery();

  const sources = sourcesData?.data || [];
  const labels = labelsData?.data || [];

  const handleDelete = async (record) => {
    try {
      await deleteDeal(record.id).unwrap();
      message.success("Deal deleted successfully");
    } catch (error) {
      message.error("Failed to delete deal: " + (error.data?.message || "Unknown error"));
    }
  };

  const getStatusColor = (status, is_won) => {
    // First check is_won flag
    if (is_won === true) {
      return {
        bg: '#dcfce7',
        color: '#15803d',
        icon: <FiTarget />,
        text: 'Won'
      };
    } else if (is_won === false) {
      return {
        bg: '#fee2e2',
        color: '#b91c1c',
        icon: <FiTarget />,
        text: 'Lost'
      };
    }

    // Default to pending if is_won is null
    return {
      bg: '#dbeafe',
      color: '#1e40af',
      icon: <FiTarget />,
      text: 'Pending'
    };
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye style={{ color: '#1890ff' }} />,
        label: (
          <Text style={{ color: '#1890ff', fontWeight: '500' }}>
            Overview
          </Text>
        ),
        onClick: () => onDealClick(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 style={{ color: '#52c41a' }} />,
        label: (
          <Text style={{ color: '#52c41a', fontWeight: '500' }}>
            Edit Deal
          </Text>
        ),
        onClick: () => onEdit(record),
      },
      {
        key: "delete",
        icon: <FiTrash2 style={{ color: '#ff4d4f' }} />,
        label: (
          <Text style={{ color: '#ff4d4f', fontWeight: '500' }}>
            Delete Deal
          </Text>
        ),
        onClick: () => handleDelete(record),
      }
    ],
  });

  const columns = [
    {
      title: "Deal Name",
      dataIndex: "dealTitle",
      key: "dealTitle",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search deal title"
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
        record.dealTitle.toLowerCase().includes(value.toLowerCase()) ||
        record.company_name?.toLowerCase().includes(value.toLowerCase()),
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar style={{
            backgroundColor: record.status?.toLowerCase() === 'won' ? '#52c41a' : '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {text?.[0]?.toUpperCase() || 'D'}
          </Avatar>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text strong style={{ fontSize: '14px' }}>
                {text || 'Untitled Deal'}
              </Text>
              {record.status?.toLowerCase() === 'won' && (
                <FiCheck style={{ color: '#52c41a', fontSize: '16px' }} />
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              {record.company_name || ''}
            </Text>
          </div>
        </div>
      ),
      width: '25%',
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      filters: sources.map(source => ({
        text: source.name,
        value: source.id
      })),
      onFilter: (value, record) => record.source === value,
      render: (sourceId) => {
        const source = sources.find(s => s.id === sourceId) || {};
        const className = `source-${source.name?.toLowerCase().replace(/\s+/g, '')}`;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiLink style={{
              fontSize: '14px',
              color: source.color || '#64748b'
            }} />
            <Text style={{
              fontSize: '13px',
              fontWeight: '500',
              color: source.color || '#64748b'
            }}>
              {source.name || 'Unknown Source'}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      filters: dealStages.map(stage => ({
        text: stage.stageName,
        value: stage.id
      })),
      onFilter: (value, record) => record.stage === value,
      render: (stageId) => {
        const stage = dealStages.find(s => s.id === stageId);
        return (
          <Tag style={{
            textTransform: 'capitalize',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '500',
            color: 'white',
            background: stage?.color || '#1890ff'
          }}>
            {stage?.stageName || 'Unknown Stage'}
          </Tag>
        );
      },
    },
    {
      title: "Expected Date",
      dataIndex: "closedDate",
      key: "closedDate",
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
        if (!value || !record.closedDate) return false;
        return dayjs(record.closedDate).format('YYYY-MM-DD') === value;
      },
      filterIcon: filtered => (
        <FiCalendar style={{ color: filtered ? '#1890ff' : undefined }} />
      )
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      sorter: (a, b) => (a.value || 0) - (b.value || 0),
      render: (value, record) => (
        <Text strong style={{ fontSize: '14px', color: '#52c41a' }}>
          {formatCurrency(value || 0, record.currency, currencies)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: 'Won', value: true },
        { text: 'Lost', value: false },
        { text: 'Pending', value: null }
      ],
      onFilter: (value, record) => record.is_won === value,
      render: (status, record) => {
        const statusConfig = getStatusColor(status, record.is_won);
        return (
          <Tag style={{
            margin: 0,
            padding: '4px 11px',
            fontSize: '13px',
            borderRadius: '12px',
            background: statusConfig.bg,
            color: statusConfig.color,
            border: 'none',
          }}>
            {statusConfig.text}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <div onClick={e => e.stopPropagation()}>
          <Dropdown
            menu={getDropdownItems(record)}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<FiMoreVertical style={{ fontSize: '16px' }} />}
              className="action-btn"
              onClick={e => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 12px'
      }}>
        <Text strong>
          {deals.length} {deals.length === 1 ? 'Deal' : 'Deals'}
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={deals}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} deals`,
        }}
        className="colorful-table"
        onRow={(record) => ({
          onClick: () => onDealClick(record),
          style: { cursor: 'pointer' }
        })}
      />

      <style jsx global>{`
        .colorful-table {
          .ant-table {
            border-radius: 8px;
            overflow: hidden;

            .ant-table-thead > tr > th {
              background: #fafafa !important;
              color: #1f2937;
              font-weight: 600;
              border-bottom: 1px solid #f0f0f0;
              padding: 16px;

              &::before {
                display: none;
              }
            }

            .ant-table-tbody > tr {
              &:hover > td {
                background: rgba(24, 144, 255, 0.04) !important;
              }

              > td {
                padding: 16px;
                transition: all 0.3s ease;
              }

              &:nth-child(even) {
                background-color: #fafafa;
                
                &:hover > td {
                  background: rgba(24, 144, 255, 0.04) !important;
                }
              }
            }
          }

          .ant-table-pagination {
            margin: 16px !important;

            .ant-pagination-item-active {
              border-color: #1890ff;
              background: #1890ff;
              
              a {
                color: white;
              }
            }
          }
        }

        // Source colors
        .source-social { color: #1890ff !important; }
        .source-partner { color: #52c41a !important; }
        .source-referral { color: #722ed1 !important; }
        .source-website { color: #13c2c2 !important; }
        .source-event { color: #fa8c16 !important; }

        .action-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          color: #6B7280;
          transition: all 0.3s;
          
          &:hover {
            color: #1890ff;
            background: rgba(24, 144, 255, 0.1);
          }
        }

        .custom-filter-menu {
          width: 320px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);

          .filter-search-section {
            margin-bottom: 16px;

            .ant-input-affix-wrapper {
              border-radius: 6px;
              
              &:hover, &:focus {
                border-color: #1890ff;
              }
            }
          }

          .filter-section {
            margin-bottom: 16px;
            
            &:last-child {
              margin-bottom: 0;
            }

            .filter-section-title {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;
              color: #1f2937;
              font-weight: 500;

              .filter-icon {
                color: #6b7280;
              }
            }

            .filter-options {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;

              .ant-tag {
                margin: 0;
                padding: 4px 8px;
                cursor: pointer;
                user-select: none;
                border-radius: 4px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.3s;

                &:hover {
                  opacity: 0.8;
                }

                &.active {
                  color: #1890ff;
                  background: rgba(24, 144, 255, 0.1);
                  border-color: #1890ff;
                }
              }
            }
          }

          .filter-footer {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #f0f0f0;
            display: flex;
            justify-content: center;

            .ant-btn {
              color: #6b7280;
              
              &:hover {
                color: #1890ff;
              }
            }
          }
        }
      `}</style>
    </>
  );
};

export default DealList;
