import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiGrid, FiList, FiFileText, FiMoreVertical } from "react-icons/fi";
import { Button, Table, message, Tooltip, Dropdown } from "antd";
import AddContractTypeModal from "./AddContractTypeModal";
import EditContractTypeModal from "./EditContractTypeModal";
import {
  useGetContractTypesQuery,
  useDeleteContractTypeMutation,
} from "../souce/services/SourceApi";
import "./contractType.scss";
import { selectCurrentUser } from "../../../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const ContractType = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContractType, setSelectedContractType] = useState(null);
  const userdata = useSelector(selectCurrentUser);
  const [viewType, setViewType] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useGetContractTypesQuery(userdata?.id);
  const [deleteContractType] = useDeleteContractTypeMutation();

  const contractTypes = data?.data || [];

  const handleEditClick = (contractType) => {
    setSelectedContractType(contractType);
    setIsEditModalOpen(true);
  };

  const handleDeleteContractType = async (contractTypeId) => {
    try {
      await deleteContractType(contractTypeId).unwrap();
      message.success("Contract type deleted successfully");
    } catch (error) {
      message.error(error?.data?.message || "Failed to delete contract type");
    }
  };

  const actionMenu = (record) => ({
    items: [
      {
        key: 'edit',
        label: 'Edit',
        icon: <FiEdit2 />,
        onClick: () => handleEditClick(record),
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <FiTrash2 />,
        danger: true,
        onClick: () => handleDeleteContractType(record.id),
      },
    ],
  });

  const columns = [
    {
      title: 'Contract Type',
      dataIndex: 'name',
      key: 'name',
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
            <FiFileText />
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

  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          color: "#ff4d4f",
          background: "#fff1f0",
          borderRadius: "8px",
          margin: "24px",
        }}
      >
        Error loading contract types: {error.message}
      </div>
    );
  }

  return (
    <div className="contract-type-wrapper">
      <div className="contract-type-container">
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
              Add Contract Type
            </Button>
          </div>
        </div>

        {viewType === 'grid' ? (
          <>
            <div className="contract-type-grid">
              {contractTypes && contractTypes.length > 0 ? (
                contractTypes.map((contractType) => (
                  <div key={contractType.id} className="contract-type-card">
                    <div className="contract-type-content">
                      <div className="contract-type-header">
                        <div className="contract-type-info-wrapper">
                          <div className="contract-type-icon">
                            <FiFileText />
                          </div>
                          <div className="contract-type-info">
                            <h3>{contractType.name}</h3>
                          </div>
                        </div>
                        <div className="contract-type-actions">
                          <Button
                            type="text"
                            icon={<FiEdit2 />}
                            onClick={() => handleEditClick(contractType)}
                            className="edit-button"
                          />
                          <Button
                            type="text"
                            icon={<FiTrash2 />}
                            onClick={() => handleDeleteContractType(contractType.id)}
                            className="delete-button"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-contract-types">
                  <FiFileText size={48} />
                  <p>No contract types found. Create one to get started.</p>
                </div>
              )}
            </div>
            {contractTypes.length > pageSize && (
              <div className="grid-pagination">
                <Table
                  pagination={{
                    total: contractTypes.length,
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
            dataSource={contractTypes}
            rowKey="id"
            pagination={{
              total: contractTypes.length,
              pageSize: pageSize,
              position: ['bottomRight'],
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: false,
            }}
            className="contract-type-table"
          />
        )}
      </div>

      <AddContractTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditContractTypeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContractType(null);
        }}
        contractType={selectedContractType}
      />
    </div>
  );
};

export default ContractType;
