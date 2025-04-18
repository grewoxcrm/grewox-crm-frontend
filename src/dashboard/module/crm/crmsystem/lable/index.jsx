import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiGrid, FiList, FiTag, FiMoreVertical } from "react-icons/fi";
import { Button, Table, Tag, message, Modal, Tooltip, Dropdown } from "antd";
import AddLableModal from "./AddLableModal";
import EditLableModal from "./EditLableModal";
import { useGetLabelsQuery, useDeleteLabelMutation } from "../souce/services/SourceApi";
import "./lable.scss";
import { selectCurrentUser } from "../../../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const Lable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLable, setSelectedLable] = useState(null);
  const [viewType, setViewType] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const userdata = useSelector(selectCurrentUser);

  const { data, isLoading } = useGetLabelsQuery(userdata?.id);
  const [deleteLabel] = useDeleteLabelMutation();

  const labels = data?.data || [];

  const paginatedLabels = labels?.slice((currentPage - 1) * pageSize, currentPage * pageSize);


  const handleEdit = (label) => {
    setSelectedLable(label);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Label',
      content: 'Are you sure you want to delete this label?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: '20px',
      },
      onOk: async () => {
        try {
          await deleteLabel(id).unwrap();
          message.success('Label deleted successfully');
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete label');
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
      title: 'Label',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: record.color || '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <FiTag />
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

  return (
    <div className="label-wrapper">
      <div className="label-container">
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
              Add Label
            </Button>
          </div>
        </div>

        {viewType === 'grid' ? (
          <>
            <div className="label-grid">
              {labels && labels.length > 0 ? (
                paginatedLabels.map((label) => (
                  <div key={label.id} className="label-card">
                    <div className="label-content">
                      <div className="label-header">
                        <div className="label-info-wrapper">
                          <div className="label-icon" style={{ background: label.color || "#1890ff" }}>
                            <FiTag />
                          </div>
                          <div className="label-info">
                            <h3>{label.name}</h3>
                          </div>
                        </div>
                        <div className="label-actions">
                          <Button
                            type="text"
                            icon={<FiEdit2 />}
                            onClick={() => handleEdit(label)}
                            className="edit-button"
                          />
                          <Button
                            type="text"
                            icon={<FiTrash2 />}
                            onClick={() => handleDelete(label.id)}
                            className="delete-button"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-labels">
                  <FiTag size={48} />
                  <p>No labels found. Create one to get started.</p>
                </div>
              )}
            </div>
            {labels && labels.length > pageSize && (
              <div className="grid-pagination">
                <Table
                  pagination={{
                    total: labels.length,
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
            dataSource={labels}
            rowKey="id"
            pagination={{
              total: labels?.length || 0,
              pageSize: pageSize,
              position: ['bottomRight'],
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: false,
            }}
            className="label-table"
          />
        )}
      </div>

      <AddLableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditLableModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLable(null);
        }}
        lable={selectedLable}
      />
    </div>
  );
};

export default Lable;
