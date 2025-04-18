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
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import CreateProduct from "./CreateProduct";
import ProductList from "./ProfductList";
import EditProduct from "./EditProduct";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } from "./services/productApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";

const { Title, Text } = Typography;

const ProductServices = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const id = currentUser?.id;
  const { data: productsData = [], isLoading, refetch } = useGetProductsQuery(id);
  const [createProduct] = useCreateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const { data: currenciesData } = useGetAllCurrenciesQuery();


  const handleCreate = () => {
    setSelectedProduct(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (formData) => {
    try {
      setLoading(true);
      await createProduct({ id: currentUser?.id, data: formData }).unwrap();
      message.success("Product created successfully");
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };


  const handleProductRevenueClick = (product) => {
    navigate(`/dashboard/sales/revenue`, { 
      state: { selectedProduct: product } 
    });
  };
  

  // const handleEdit = (record) => {
  //   setSelectedProduct(record);
  //   setIsEditModalOpen(true);
  // };

  // const handleEditSubmit = async (formData) => {
  //   try {
  //     setLoading(true);
  //     await updateProduct({ id: selectedProduct.id, data: formData }).unwrap();
  //     message.success("Product updated successfully");
  //     setIsEditModalOpen(false);
  //     setSelectedProduct(null);
  //     refetch();
  //   } catch (error) {
  //     message.error(error?.data?.message || "Failed to update product");
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleEdit = (record) => {
    setSelectedProduct(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedProduct(null);
  };


  const handleView = (record) => {
    console.log("View product:", record);
  };

  

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = productsData.map((product) => ({
        "Product Name": product.name,
        Category: product.category,
        Price: product.price,
        SKU: product.sku,
        Tax: product.tax,
        "HSN/SAC": product.hsn_sac,
        Description: product.description,
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "products_export");
          break;
        case "excel":
          exportToExcel(data, "products_export");
          break;
        case "pdf":
          exportToPDF(data, "products_export");
          break;
        default:
          break;
      }
      message.success(`Successfully exported as ${type.toUpperCase()}`);
    } catch (error) {
      message.error(`Failed to export: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map((item) =>
        Object.values(item)
          .map((value) => `"${value?.toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = (data, filename) => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map((item) => Object.values(item)),
      margin: { top: 20 },
      styles: { fontSize: 8 },
    });
    doc.save(`${filename}.pdf`);
  };

  const exportMenu = (
    <Menu>
      <Menu.Item
        key="csv"
        icon={<FiDownload />}
        onClick={() => handleExport("csv")}
      >
        Export as CSV
      </Menu.Item>
      <Menu.Item
        key="excel"
        icon={<FiDownload />}
        onClick={() => handleExport("excel")}
      >
        Export as Excel
      </Menu.Item>
      <Menu.Item
        key="pdf"
        icon={<FiDownload />}
        onClick={() => handleExport("pdf")}
      >
        Export as PDF
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="inquiry-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/dashboard/sales">Sales</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Products & Services</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Products & Services</Title>
          <Text type="secondary">Manage all products and services in the organization</Text>
        </div>
        <Row justify="center" className="header-actions-wrapper">
          <Col xs={24} sm={24} md={20} lg={16} xl={14}>
            <div className="header-actions">
              <Input
                prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
                placeholder="Search products & services..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                className="search-input"
              />
              <div className="action-buttons">
                <Dropdown menu={exportMenu} trigger={["click"]}>
                  <Button className="export-button">
                    <FiDownload size={16} />
                    <span>Export</span>
                    <FiChevronDown size={14} />
                  </Button>
                </Dropdown>
                <Button
                  type="primary"
                  icon={<FiPlus size={16} />}
                  onClick={handleCreate}
                  className="add-button"
                >
                  Add Product
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Card className="content-card">
        <ProductList
          data={productsData}
          loading={isLoading}
          onEdit={handleEdit}
          onProductRevenueClick={handleProductRevenueClick}
          onView={handleView}
          currenciesData={currenciesData}
          searchText={searchText}
        />
      </Card>

      <CreateProduct
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        currenciesData={currenciesData}
        loading={loading}
      />
{/* 
      <EditProduct
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        product={selectedProduct}
        loading={loading}
      /> */}

<EditProduct
        open={editModalVisible}
        currenciesData={currenciesData}
        onCancel={handleEditModalClose}
        initialValues={selectedProduct}
      />
    </div>
  );
};

export default ProductServices;
