import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Dropdown,
  Typography,
  Modal,
  message,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMoreVertical,
  FiSearch,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../../auth/services/authSlice";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "../souce/services/SourceApi";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import "./category.scss";

const { Text } = Typography;

const Categories = () => {
  const [searchText, setSearchText] = useState("");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const currentUser = useSelector(selectCurrentUser);

  const { data: categoriesData, isLoading } = useGetCategoriesQuery(currentUser?.id);
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleDelete = async (record) => {
    Modal.confirm({
      title: "Delete Category",
      content: "Are you sure you want to delete this category?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteCategory(record.id).unwrap();
          message.success("Category deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete category");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedCategory(record);
    setEditModalVisible(true);
  };

  const filteredCategories = React.useMemo(() => {
    const categories = categoriesData?.data || [];
    if (!searchText) return categories;

    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [categoriesData, searchText]);

  const getDropdownItems = (record) => ({
    items: [
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
        onClick: () => handleDelete(record),
        danger: true,
      },
    ],
  });

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            className="color-dot"
            style={{ backgroundColor: record.color || "#1890ff" }}
          />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status?.toUpperCase() || "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-button"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="category-container">
      <div className="category-header">
        <div className="search-box">
          <Input
            placeholder="Search categories..."
            prefix={<FiSearch className="search-icon" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={() => setAddModalVisible(true)}
        >
          Add Category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCategories}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} categories`,
        }}
      />

      <AddCategoryModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
      />

      {selectedCategory && (
        <EditCategoryModal
          visible={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            setSelectedCategory(null);
          }}
          initialValues={selectedCategory}
        />
      )}
    </div>
  );
};

export default Categories; 