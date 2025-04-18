import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Tooltip,
  Typography,
  Modal,
  message,
  Input,
  Space,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiBox,
  FiTag,
  FiPackage,
  FiTrendingUp,
  FiPercent,
  FiSearch,
  FiPlus,
  FiDownload,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "./services/productApi";
import EditProduct from "./EditProduct";
import { useGetCategoriesQuery } from "../../crm/crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";

const { Text } = Typography;
const { Search } = Input;

const ProductList = ({ onEdit, onView, searchText = "", selectedCategory = null,onProductRevenueClick, currenciesData }) => {
  // const loggedInUser = useSelector(selectCurrentUser);
  // const id = loggedInUser?.id;
  const currentUser = useSelector(selectCurrentUser);

  const id = currentUser?.id;

  const { data: productsData = [], isLoading } = useGetProductsQuery(id);

  const products = productsData.data;
  const [deleteProduct] = useDeleteProductMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

 
  const { data: categoriesData } = useGetCategoriesQuery(currentUser?.id);
  const categories = categoriesData?.data?.filter(item => item.lableType === "category") || [];

  // Create a map of category IDs to category names
  const categoryMap = React.useMemo(() => {
    if (!categories) return {};
    return categories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  // Function to get currency details
  const getCurrencyDetails = (currencyId) => {
    if (!currenciesData) return { currencyIcon: "₹", currencyCode: "INR" };
    const currency = currenciesData.find(c => c.id === currencyId);
    return currency || { currencyIcon: "₹", currencyCode: "INR" }; // Default to INR if not found
  };

  // Function to format price with currency
  const formatPrice = (amount, currencyId) => {
    const { currencyIcon } = getCurrencyDetails(currencyId);
    return `${currencyIcon} ${amount?.toLocaleString() || 0}`;
  };

  const statuses = [
    { id: 'in_stock', name: 'In Stock' },
    { id: 'low_stock', name: 'Low Stock' },
    { id: 'out_of_stock', name: 'Out of Stock' },
  ];

  const categoriess = categories;

  // Filter products based on search text and category
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    return products.filter(product => {
      const searchLower = searchText.toLowerCase();
      const name = product?.name?.toLowerCase() || "";
      const category = categoryMap[product?.category]?.toLowerCase() || "";
      const sku = product?.sku?.toLowerCase() || "";
      const description = product?.description?.toLowerCase() || "";

      const matchesSearch =
        name.includes(searchLower) ||
        category.includes(searchLower) ||
        sku.includes(searchLower) ||
        description.includes(searchLower);

      const matchesCategory = !selectedCategory || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchText, categoryMap, selectedCategory]);

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: '20px',
      },
      onOk: async () => {
        try {
          await deleteProduct(id).unwrap();
          message.success('Product deleted successfully');
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete product');
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedProduct(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedProduct(null);
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: 'view',
        icon: <FiEye />,
        label: 'View Details',
        onClick: (e) => {
          e.domEvent.stopPropagation();
          onView(record);
        },
      },
      {
        key: 'edit',
        icon: <FiEdit2 />,
        label: 'Edit',
        onClick: (e) => {
          e.domEvent.stopPropagation();
          handleEdit(record);
        },
      },
      {
        key: 'delete',
        icon: <FiTrash2 />,
        label: 'Delete',
        onClick: (e) => {
          e.domEvent.stopPropagation();
          handleDelete(record.id);
        },
        danger: true,
      },
    ],
  });

  const columns = [
    {
      title: "Product Details",
      dataIndex: "name",
      key: "name",
      width: '25%',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search product name"
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
        record.name.toLowerCase().includes(value.toLowerCase()) ||
        record.category?.toLowerCase().includes(value.toLowerCase()),
      render: (name, record) => (
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          {record.image && (
            <img
              src={record.image}
              alt={name}
              style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                borderRadius: "4px"
              }}
            />
          )}
          <div>
            <Text strong style={{ display: "block", fontSize: "14px", marginTop: "10px" }}>{name}</Text>
            {/* {record.sku && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                SKU: {record.sku}
              </Text>
            )} */}
          </div>
        </div>
      ),
    },
    {
      title: "Stock Info",
      key: "stock",
      width: '20%',
      filters: statuses.map(status => ({
        text: status.name,
        value: status.id
      })),
      onFilter: (value, record) => record.stock_status === value,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: "4px" }}>
            <Tag color={
              record.stock_status === 'in_stock' ? 'success' :
                record.stock_status === 'low_stock' ? 'warning' : 'error'
            }>
              {record.stock_status === 'in_stock' ? 'In Stock' :
                record.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>
            <FiPackage style={{ marginRight: "4px" }} />
            Quantity: {record.stock_quantity}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Min: {record.min_stock_level} | Max: {record.max_stock_level || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: "Pricing",
      key: "pricing",
      width: '20%',
      sorter: (a, b) => a.selling_price - b.selling_price,
      render: (_, record) => (
        <div>
          <Text strong style={{ display: "block", color: "#52c41a" }}>
            {/* <FiDollarSign style={{ marginRight: "4px" }} /> */}
            Selling: {formatPrice(record.selling_price, record.currency)}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>
            Buying: {formatPrice(record.buying_price, record.currency)}
          </Text>
          {record.tax && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Tax: {record.tax}%
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Profit Metrics",
      key: "profit",
      width: '20%',
      sorter: (a, b) => a.profit_margin - b.profit_margin,
      render: (_, record) => {
        const profit_margin = record.selling_price - record.buying_price;
        const profit_percentage = record.buying_price > 0 ? ((profit_margin / record.buying_price) * 100).toFixed(2) : 0;

        return (
          <div>
            <Text strong style={{ display: "block", color: "#1890ff" }}>
              <FiTrendingUp style={{ marginRight: "4px" }} />
              Margin: {formatPrice(profit_margin, record.currency)}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: '15%',
      filters: categoriess.map(categorys => ({
        text: categorys.name,
        value: categorys.id
      })),
      onFilter: (value, record) => record.category === value,
      render: (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return (
          <Tag
            color={category?.color || "blue"}
            style={{
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "13px",
              textTransform: "capitalize"
            }}
          >
            {category?.name || "Uncategorized"}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "actions",
      width: '5%',
      align: "center",
      render: (_, record) => (
        <div onClick={e => e.stopPropagation()}>
          <Dropdown
            menu={getDropdownItems(record)}
            trigger={["click"]}
            placement="bottomRight"
            overlayClassName="product-actions-dropdown"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-dropdown-button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
        </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="product-list" onClick={(e) => e.stopPropagation()}>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`,
          }}
          onRow={(record) => ({
            onClick: (e) => {
              if (!e.target.closest('.ant-dropdown-menu') && !e.target.closest('.action-dropdown-button')) {
                onProductRevenueClick(record);
              }
            },
            style: { cursor: 'pointer' }
          })}
          className="product-table"
          scroll={{ x: true }}
        />
      </div>

      <EditProduct
        open={editModalVisible}
        onCancel={handleEditModalClose}
        initialValues={selectedProduct}
      />
    </>
  );
};

export default ProductList;
