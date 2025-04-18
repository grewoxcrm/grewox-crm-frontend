import React, { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiMoreVertical, FiGrid, FiList, FiGitBranch } from "react-icons/fi";
import AddPipelineModal from "./AddPipelineModal";
import EditPipelineModal from "./EditPipelineModal";
import {
  useGetPipelinesQuery,
  useDeletePipelineMutation,
} from "./services/pipelineApi";
import "./pipeline.scss";
import { Button, Card, Table, Dropdown, message, Modal, Tooltip } from "antd";

const Pipeline = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [viewType, setViewType] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useGetPipelinesQuery();
  const [deletePipeline] = useDeletePipelineMutation();

  // Ensure pipelines is always an array
  const pipelines = Array.isArray(data?.pipelines)
    ? data.pipelines
    : Array.isArray(data)
      ? data
      : [];

  const paginatedPipelines = pipelines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleEdit = (pipeline) => {
    setSelectedPipeline(pipeline);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Pipeline',
      content: 'Are you sure you want to delete this pipeline?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: '20px',
      },
      onOk: async () => {
        try {
          await deletePipeline(id).unwrap();
          message.success('Pipeline deleted successfully');
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete pipeline');
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
      title: 'Pipeline',
      dataIndex: 'pipeline_name',
      key: 'pipeline_name',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <FiGitBranch />
          </div>
          <span>{text}</span>
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

  return (
    <div className="pipeline-wrapper">
      <div className="pipeline-container">
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
              Add Pipeline
            </Button>
          </div>
        </div>

        {viewType === 'grid' ? (
          <>
            <div className="pipeline-grid">
              {pipelines && pipelines.length > 0 ? (
                paginatedPipelines.map((pipeline) => (
                  <div key={pipeline.id} className="pipeline-card">
                    <div className="pipeline-content">
                      <div className="pipeline-header">
                        <div className="pipeline-info-wrapper">
                          <div className="pipeline-icon">
                            <FiGitBranch />
                          </div>
                          <div className="pipeline-info">
                            <h3>{pipeline.pipeline_name}</h3>
                          </div>
                        </div>
                        <div className="pipeline-actions">
                          <Button
                            type="text"
                            icon={<FiEdit2 />}
                            onClick={() => handleEdit(pipeline)}
                            className="edit-button"
                          />
                          <Button
                            type="text"
                            icon={<FiTrash2 />}
                            onClick={() => handleDelete(pipeline.id)}
                            className="delete-button"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-pipelines">
                  <FiGitBranch size={48} />
                  <p>No pipelines found. Create one to get started.</p>
                </div>
              )}
            </div>
            {pipelines.length > pageSize && (
              <div className="grid-pagination">
                <Table
                  pagination={{
                    total: pipelines.length,
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
            dataSource={pipelines}
            rowKey="id"
            pagination={{
              total: pipelines.length,
              pageSize: pageSize,
              position: ['bottomRight'],
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: false,
            }}
            className="pipeline-table"
          />
        )}
      </div>

      <AddPipelineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditPipelineModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPipeline(null);
        }}
        pipeline={selectedPipeline}
      />
    </div>
  );
};

export default Pipeline;
