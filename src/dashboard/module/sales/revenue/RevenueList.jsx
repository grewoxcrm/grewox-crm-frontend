import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  Button,
  Dropdown,
  Typography,
  Modal,
  message,
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  Input,
  Space,
  DatePicker
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiCalendar,
  FiPackage,
  FiUser,
  FiTrendingUp,
  FiPercent
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetRevenueQuery,
  useDeleteRevenueMutation,
} from "./services/revenueApi";
import { useGetProductsQuery } from "../product&services/services/productApi";
import { useGetCustomersQuery } from "../customer/services/custApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useLocation, useNavigate } from 'react-router-dom';
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
const { Text } = Typography;
const { Option } = Select;

const RevenueList = ({
  onEdit,
  onDelete,
  onView,
  searchText = "",
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Get customer from location state if coming from customer list
  const customerFromList = location.state?.selectedCustomer;
  const productFromList = location.state?.selectedProduct;

  // Set initial customer if coming from customer list
  useEffect(() => {
    if (customerFromList) {
      setSelectedCustomer(customerFromList.id);
    }
    if (productFromList) {
      setSelectedProduct(productFromList.id);
    }
  }, [customerFromList, productFromList]);

  const { data: revenueData} = useGetRevenueQuery();
  const loggedInUser = useSelector(selectCurrentUser);
  const { data: productsData } = useGetProductsQuery(loggedInUser?.id);
  const { data: customersData } = useGetCustomersQuery();
  const [deleteRevenue] = useDeleteRevenueMutation();
  const { data: currencies } = useGetAllCurrenciesQuery();

  const revdata = revenueData?.data || [];
  const products = productsData?.data || [];
  const customers = customersData?.data || [];

  // Process revenue data to include parsed products
  const processedRevenue = useMemo(() => {
    try {
      return (revdata || []).map(revenue => ({
        ...revenue,
        parsedProducts: revenue?.products ?
          (typeof revenue.products === 'string' ? JSON.parse(revenue.products) : revenue.products)
          : []
      }));
    } catch (error) {
      console.error('Error processing revenue data:', error);
      return [];
    }
  }, [revdata]);

  // Calculate product-wise revenue
  const productRevenue = useMemo(() => {
    try {
      const revenueMap = new Map();
      (processedRevenue || []).forEach(revenue => {
        (revenue?.parsedProducts || []).forEach(product => {
          if (!product?.product_id) return;

          const existing = revenueMap.get(product.product_id) || {
            total_revenue: 0,
            total_profit: 0,
            quantity_sold: 0,
            product_name: product.name || 'Unknown Product',
          };

          existing.total_revenue += Number(product.total) || 0;
          existing.total_profit += Number(product.profit) || 0;
          existing.quantity_sold += Number(product.quantity) || 0;

          revenueMap.set(product.product_id, existing);
        });
      });

      return Array.from(revenueMap.entries()).map(([id, data]) => ({
        id,
        ...data,
      }));
    } catch (error) {
      console.error('Error calculating product revenue:', error);
      return [];
    }
  }, [processedRevenue]);

  // Calculate customer-wise revenue
  const customerRevenue = useMemo(() => {
    try {
      const revenueMap = new Map();
      (processedRevenue || []).forEach(revenue => {
        if (!revenue?.customer) return;

        const customerId = revenue.customer;
        const existing = revenueMap.get(customerId) || {
          total_revenue: 0,
          total_profit: 0,
          transaction_count: 0,
        };

        existing.total_revenue += Number(revenue.amount) || 0;
        existing.total_profit += Number(revenue.profit) || 0;
        existing.transaction_count += 1;

        revenueMap.set(customerId, existing);
      });

      return Array.from(revenueMap.entries()).map(([id, data]) => ({
        id,
        ...data,
      }));
    } catch (error) {
      console.error('Error calculating customer revenue:', error);
      return [];
    }
  }, [processedRevenue]);

  // Filter revenue based on selected product and customer
  const filteredRevenue = useMemo(() => {
    return processedRevenue.filter(revenue => {
      const matchesProduct = !selectedProduct ||
        revenue.parsedProducts.some(p => p.product_id === selectedProduct);
      const matchesCustomer = !selectedCustomer || revenue.customer === selectedCustomer;
      const matchesSearch = !searchText ||
        revenue.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        revenue.category?.toLowerCase().includes(searchText.toLowerCase());

      return matchesProduct && matchesCustomer && matchesSearch;
    });
  }, [processedRevenue, selectedProduct, selectedCustomer, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Revenue",
      content: "Are you sure you want to delete this revenue?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteRevenue(id).unwrap();
          message.success("Revenue deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete revenue");
        }
      },
    });
  };

  const getCurrencyDetails = (currencyId) => {
    if (!currencyId || !currencies) return { currencyIcon: '₹', currencyCode: 'INR' };
    const currency = currencies.find(c => c.id === currencyId);
    return currency || { currencyIcon: '₹', currencyCode: 'INR' };
  };

  const formatAmount = (amount, currencyId) => {
    if (amount === undefined || amount === null) return '₹ 0.00';
    const currency = getCurrencyDetails(currencyId);
    const numericAmount = Number(amount) || 0;
    return `${currency.currencyIcon} ${numericAmount.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })}`;
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date", // Added dataIndex which was missing
      key: "date",
      width: '25%',
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
          if (!value || !record.date) return false;
          return dayjs(record.date).format('YYYY-MM-DD') === value;
      },
      filterIcon: filtered => (
          <FiCalendar style={{ color: filtered ? '#1890ff' : undefined }} />
      )
    },
    {
      title: "Products",
      key: "products",
      width: '30%',
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
        record.parsedProducts.some(p => p.name.toLowerCase().includes(value.toLowerCase())),
      render: (_, record) => (
        <div>
          {record.parsedProducts.map((product, index) => (
            <div key={index} style={{ marginBottom: index !== record.parsedProducts.length - 1 ? '8px' : 0 }}>
              <Text strong>{product.name}</Text>
              <div>
                {/* <Text type="secondary" style={{ fontSize: "12px" }}>
                  Qty: {product.quantity} × {formatAmount(product.unit_price, record.currency)}
                  {product.tax_rate > 0 && ` (Tax: ${product.tax_rate}%)`}
                  {product.discount > 0 && ` (Discount: ${formatAmount(product.discount, record.currency)})`}
                </Text> */}
              </div>
              <Text type="success" style={{ fontSize: "12px" }} >
                Total: {formatAmount(product.total, record.currency)}
              </Text>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      width: '15%',
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
            {formatAmount(record.amount, record.currency)}
          </Text>
          <Text type="secondary" style={{ display: "block", fontSize: "12px" }}>
            Cost: {formatAmount(record.cost_of_goods, record.currency)}
          </Text>
        </div>
      ),
    },
    {
      title: "Profit",
      key: "profit",
      width: '20%',
      sorter: (a, b) => Number(a.profit) - Number(b.profit),
      render: (_, record) => (
        <div>
          <Text strong style={{
            color: Number(record.profit || 0) < 0 ? '#ff4d4f' : '#1890ff',
            display: "block"
          }}>
            <FiTrendingUp style={{ marginRight: "4px" }} />
            {formatAmount(record.profit || 0, record.currency)}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {(Number(record.profit_margin_percentage) || 0).toFixed(2)}% Margin
          </Text>
        </div>
      ),
    },
    {
      title: "Action",
      key: "actions",
      width: '10%',
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
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
                onClick: () => onEdit?.(record),
              },
              {
                key: "delete",
                icon: <FiTrash2 />,
                label: "Delete",
                onClick: () => handleDelete(record.id),
                danger: true,
              },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-dropdown-button"
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  // Calculate totals for stats
  const stats = useMemo(() => {
    return filteredRevenue.reduce((acc, rev) => ({
      total_revenue: acc.total_revenue + (Number(rev.amount) || 0),
      total_profit: acc.total_profit + (Number(rev.profit) || 0),
      total_margin: acc.total_margin + (Number(rev.profit_margin_percentage) || 0),
      count: acc.count + 1
    }), { total_revenue: 0, total_profit: 0, total_margin: 0, count: 0 });
  }, [filteredRevenue]);

  const clearCustomerFilter = () => {
    setSelectedCustomer(null);
    navigate('/dashboard/sales/revenue', { replace: true });
  };

  const clearProductFilter = () => {
    setSelectedProduct(null);
    navigate('/dashboard/sales/revenue', { replace: true });
  };

  return (
    <div className="revenue-container">
      {/* {selectedCustomer && (
        <div style={{ marginBottom: 16 }}>
          <Tag color="blue" closable onClose={clearCustomerFilter}>
            Filtered by Customer: {customers.find(c => c.id === selectedCustomer)?.name}
          </Tag>  
        </div>
      )}
      {selectedProduct && (
        <div style={{ marginBottom: 16 }}>
          <Tag color="blue" closable onClose={clearProductFilter}>
            Filtered by Product: {products.find(p => p.id === selectedProduct)?.name}
          </Tag>
        </div>
      )} */}

      <Row gutter={[16, 16]} className="revenue-filters">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Select Product"
            allowClear
            style={{ width: "100%" }}
            onChange={setSelectedProduct}
            value={selectedProduct}
          >
            {products.map((product) => (
              <Option key={product.id} value={product.id}>
                {product.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Select Customer"
            allowClear
            style={{ width: "100%" }}
            onChange={setSelectedCustomer}
            value={selectedCustomer}
          >
            {customers.map((customer) => (
              <Option key={customer.id} value={customer.id}>
                {customer.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="revenue-stats">
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.total_revenue}
              precision={2}
              formatter={(value) => `₹ ${(Number(value) || 0).toLocaleString('en-IN')}`}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Profit"
              value={stats.total_profit}
              precision={2}
              valueStyle={{
                color: stats.total_profit < 0 ? '#ff4d4f' : '#3f8600',
                fontWeight: '600'
              }}
              prefix={stats.total_profit < 0 ? '-₹ ' : '₹ '}
              formatter={(value) => `${Math.abs(Number(value) || 0).toLocaleString('en-IN')}`}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Average Profit Margin"
              value={stats.count > 0 ? (stats.total_margin / stats.count) : 0}
              precision={2}
              suffix="%"
              valueStyle={{
                color: (stats.count > 0 ? (stats.total_margin / stats.count) : 0) < 0 ? '#ff4d4f' : '#3f8600',
                fontWeight: '600'
              }}
              prefix={(stats.count > 0 ? (stats.total_margin / stats.count) : 0) < 0 ? '-' : '+'}
              formatter={(value) => `${Math.abs(Number(value) || 0).toFixed(2)}`}
            />
          </Card>
        </Col>
      </Row>

      <div className="revenue-tables">
        <Table
          columns={columns}
          dataSource={filteredRevenue}
          rowKey="id"
          // loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
          }}
          className="revenue-table"
        />
      </div>
    </div>
  );
};

export default RevenueList;
