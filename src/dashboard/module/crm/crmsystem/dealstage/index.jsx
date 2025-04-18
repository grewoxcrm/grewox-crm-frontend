import React, { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiLayers, FiGrid, FiList, FiMoreVertical, FiFilter } from "react-icons/fi";
import AddDealStageModal from "./AddDealStageModal";
import EditDealStageModal from "./EditDealStageModal";
import {
  useGetLeadStagesQuery,
  useDeleteLeadStageMutation,
} from "../leadstage/services/leadStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";
import "./dealstage.scss";
import { Button, Modal, message, Table, Tooltip, Dropdown, Select } from "antd";

const DealStages = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [viewType, setViewType] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedPipeline, setSelectedPipeline] = useState('all');

  const { data: stagesData = [], isLoading, refetch } = useGetLeadStagesQuery();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const [deleteDealStage] = useDeleteLeadStageMutation();

  // Filter for deal stages only
  const dealStages = stagesData?.filter(stage => stage.stageType === "deal") || [];

  // Filter stages based on selected pipeline
  const filteredStages = selectedPipeline === 'all'
    ? dealStages
    : dealStages.filter(stage => stage.pipeline === selectedPipeline);

  // Calculate paginated stages
  const paginatedStages = filteredStages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getPipelineName = (pipelineId) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    return pipeline?.pipeline_name || 'Not assigned';
  };

  const handleEdit = (stage) => {
    setSelectedStage(stage);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Deal Stage',
      content: 'Are you sure you want to delete this deal stage?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: '20px',
      },
      onOk: async () => {
        try {
          await deleteDealStage(id).unwrap();
          message.success('Deal stage deleted successfully');
          refetch();
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete deal stage');
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
      title: 'Stage',
      dataIndex: 'stageName',
      key: 'stageName',
      render: (text, record) => (
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
            <FiLayers />
          </div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Pipeline',
      dataIndex: 'pipeline',
      key: 'pipeline',
      render: (pipelineId) => getPipelineName(pipelineId),
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
    return <div className="loading-spinner">Loading deal stages...</div>;
  }

  return (
    <div className="deal-stages-wrapper">
      <div className="deal-stages-container">
        <div className="header-section" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div className="filter-section">
            <Select
              value={selectedPipeline}
              onChange={setSelectedPipeline}
              style={{ width: 240 }}
              placeholder="Filter by Pipeline"
              suffixIcon={
                <div className="filter-icon">
                  <FiFilter size={16} style={{ strokeWidth: 2 }} />
                </div>
              }
              options={[
                { value: 'all', label: 'All Pipelines' },
                ...pipelines.map(pipeline => ({
                  value: pipeline.id,
                  label: pipeline.pipeline_name
                }))
              ]}
              dropdownStyle={{ minWidth: 240 }}
            />
          </div>
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
              Add Deal Stage
            </Button>
          </div>
        </div>

        {viewType === 'grid' ? (
          <>
            <div className="stage-grid">
              {filteredStages && filteredStages.length > 0 ? (
                paginatedStages.map((stage) => (
                  <div key={stage.id} className="stage-card">
                    <div className="stage-content">
                      <div className="stage-header">
                        <div className="stage-info-wrapper">
                          <div className="stage-icon">
                            <FiLayers />
                          </div>
                          <div className="stage-info">
                            <h3>{stage.stageName}</h3>
                            <p className="pipeline-name">
                              {getPipelineName(stage.pipeline)}
                            </p>
                          </div>
                        </div>
                        <div className="stage-actions">
                          <Button
                            type="text"
                            icon={<FiEdit2 />}
                            onClick={() => handleEdit(stage)}
                            className="edit-button"
                          />
                          <Button
                            type="text"
                            icon={<FiTrash2 />}
                            onClick={() => handleDelete(stage.id)}
                            className="delete-button"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-stages">
                  <FiLayers size={48} />
                  <p>No deal stages found. Create one to get started.</p>
                </div>
              )}
            </div>
            {filteredStages.length > pageSize && (
              <div className="grid-pagination">
                <Table
                  pagination={{
                    total: filteredStages.length,
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
            dataSource={filteredStages}
            rowKey="id"
            pagination={{
              total: filteredStages.length,
              pageSize: pageSize,
              position: ['bottomRight'],
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: false,
            }}
            className="stage-table"
          />
        )}
      </div>

      <AddDealStageModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />

      <EditDealStageModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStage(null);
          refetch();
        }}
        stage={selectedStage}
      />
    </div>
  );
};

export default DealStages;

