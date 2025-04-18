import React, { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiDatabase, FiGrid, FiList, FiMoreVertical } from "react-icons/fi";
import AddSourceModal from "./AddSourceModal";
import EditSourceModal from "./EditSourceModal";
import {
  useGetSourcesQuery,
  useDeleteSourceMutation,
} from "./services/SourceApi";
import "./source.scss";
import { Button, Modal, message, Table, Tooltip, Dropdown } from "antd";
import { selectCurrentUser } from "../../../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const Source = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [viewType, setViewType] = useState('grid');
  const userdata = useSelector(selectCurrentUser);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: sourcesData = [], isLoading } = useGetSourcesQuery(userdata?.id);
  const [deleteSource] = useDeleteSourceMutation();

  const sources = sourcesData?.data?.filter(item => item.lableType === "source") || [];

  // Calculate paginated sources for grid view
  const paginatedSources = sources.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleEdit = (source) => {
    setSelectedSource(source);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Source',
      content: 'Are you sure you want to delete this source?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: '20px',
      },
      onOk: async () => {
        try {
          await deleteSource(id).unwrap();
          message.success('Source deleted successfully');
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete source');
        }
      },
    });
  };

  const actionMenu = (record) => ({
    items: [
      {
        key: 'edit',
        label: 'Edit',
        icon: <FiEdit2 />,
        onClick: () => handleEdit(record),
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <FiTrash2 />,
        danger: true,
        onClick: () => handleDelete(record.id),
      },
    ],
  });

  const columns = [
    {
      title: 'Source',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: record.color || '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <FiDatabase />
          </div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      render: (color) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              backgroundColor: color,
            }}
          />
          <span>{color}</span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={actionMenu(record)}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-button"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Dropdown>
      ),
    },
  ];

  if (isLoading) {
    return <div className="loading-spinner">Loading sources...</div>;
  }

  return (
    <div className="source-wrapper">
      <div className="source-container">
        <div className="header-section" style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="view-toggle" style={{ display: 'flex', gap: '8px' }}>
              <Tooltip title="Grid View">
                <Button
                  type={viewType === 'grid' ? 'primary' : 'default'}
                  icon={<FiGrid />}
                  onClick={() => setViewType('grid')}
                  style={{
                    background: viewType === 'grid' ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' : 'transparent',
                  }}
                />
              </Tooltip>
              <Tooltip title="List View">
                <Button
                  type={viewType === 'list' ? 'primary' : 'default'}
                  icon={<FiList />}
                  onClick={() => setViewType('list')}
                  style={{
                    background: viewType === 'list' ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' : 'transparent',
                  }}
                />
              </Tooltip>
            </div>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={() => setIsModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: "40px",
                padding: "0 16px",
                borderRadius: "8px",
                fontWeight: "500",
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                boxShadow: "0 2px 4px rgba(24, 144, 255, 0.15)",
              }}
            >
              Add Source
            </Button>
          </div>
        </div>

        {viewType === 'grid' ? (
          <>
            <div className="source-grid">
              {sources && sources.length > 0 ? (
                paginatedSources.map((source) => (
                  <div key={source.id} className="source-card">
                    <div className="source-content">
                      <div className="source-header">
                        <div className="source-info-wrapper">
                          <div className="source-icon" style={{ background: source.color || "#1890ff" }}>
                            <FiDatabase />
                          </div>
                          <div className="source-info">
                            <h3>{source.name}</h3>
                          </div>
                        </div>
                        <div className="source-actions">
                          <Button
                            type="text"
                            icon={<FiEdit2 />}
                            onClick={() => handleEdit(source)}
                            className="edit-button"
                          />
                          <Button
                            type="text"
                            icon={<FiTrash2 />}
                            onClick={() => handleDelete(source.id)}
                            className="delete-button"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-sources">
                  <FiDatabase size={48} />
                  <p>No sources found. Create one to get started.</p>
                </div>
              )}
            </div>
            {sources.length > pageSize && (
              <div className="grid-pagination">
                <Table
                  pagination={{
                    total: sources.length,
                    pageSize: pageSize,
                    current: currentPage,
                    onChange: setCurrentPage,
                    position: ['bottomRight'],
                    showSizeChanger: false,
                    showQuickJumper: false,
                    showTotal: false,
                  }}
                  className="pagination-only"
                />
              </div>
            )}
          </>
        ) : (
          <Table
            columns={columns}
            dataSource={sources}
            rowKey="id"
            pagination={{
              total: sources.length,
              pageSize: pageSize,
              position: ['bottomRight'],
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: false,
            }}
            className="source-table"
          />
        )}
      </div>

      <AddSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditSourceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSource(null);
        }}
        source={selectedSource}
      />
    </div>
  );
};

export default Source;
