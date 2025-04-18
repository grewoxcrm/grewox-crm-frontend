import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Row,
  Col,
  Divider,
  InputNumber,
  DatePicker,
  Space,
  message,
  Switch,
} from "antd";
import {
  FiFileText,
  FiX,
  FiUser,
  FiCalendar,
  FiHash,
  FiDollarSign,
  FiPlus,
  FiTrash2,
  FiPackage,
  FiPhone,
  FiMail,
  FiLock,
  FiCreditCard,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./invoices.scss";
import { useCreateInvoiceMutation } from "../../../../sales/invoice/services/invoiceApi";
import { useGetCustomersQuery, useCreateCustomerMutation } from "../../../../sales/customer/services/custApi";
import { useGetAllCurrenciesQuery } from "../../../../../../superadmin/module/settings/services/settingsApi";
import { useGetAllTaxesQuery } from "../../../../settings/tax/services/taxApi";
import { useGetProductsQuery } from "../../../../sales/product&services/services/productApi";
import { useGetContactsQuery } from "../../../../crm/contact/services/contactApi";
import { useGetCompanyAccountsQuery } from "../../../../crm/companyacoount/services/companyAccountApi";


const { Text } = Typography;
const { Option } = Select;

const CreateInvoice = ({ open, dealId, onCancel, onSubmit, setCreateModalVisible, productsData, productsLoading }) => {
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const { data: custdata } = useGetCustomersQuery();
  const customers = custdata?.data;
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm] = Form.useForm();
  const [createCustomer] = useCreateCustomerMutation();
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const [selectedCurrency, setSelectedCurrency] = useState('₹');
  const [selectedCurrencyId, setSelectedCurrencyId] = useState('BEzBBPneRQq6rbGYiwYj45k'); // INR currency ID
  const [isTaxEnabled, setIsTaxEnabled] = useState(false);
  const { data: taxesData, isLoading: taxesLoading } = useGetAllTaxesQuery();
  const [selectedProductCurrency, setSelectedProductCurrency] = useState(null);
  const [isCurrencyDisabled, setIsCurrencyDisabled] = useState(true); // Set to true by default
  const { data: contactsData } = useGetContactsQuery();
  const { data: companyAccountsData } = useGetCompanyAccountsQuery();


  const contacts = contactsData?.data;
  const companyAccounts = companyAccountsData?.data;

  useEffect(() => {
    // Set default currency to INR when component mounts
    if (currenciesData) {
      const inrCurrency = currenciesData.find(c => c.id === 'BEzBBPneRQq6rbGYiwYj45k');
      if (inrCurrency) {
        setSelectedCurrency(inrCurrency.currencyIcon);
        setSelectedCurrencyId(inrCurrency.id);
        form.setFieldsValue({
          currency: inrCurrency.id
        });
      }
    }
  }, [currenciesData, form]);

  const calculateItemTaxAmount = (item) => {
    if (!item) return 0;
    if (!isTaxEnabled || !item.tax) return 0;

    const quantity = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const itemAmount = quantity * price;

    // Calculate discount
    const itemDiscount = Number(item.discount || 0);
    const itemDiscountType = item.discount_type || 'percentage';
    let itemDiscountAmount = 0;

    if (itemDiscountType === 'percentage') {
      itemDiscountAmount = (itemAmount * itemDiscount) / 100;
    } else {
      itemDiscountAmount = itemDiscount;
    }

    const amountAfterDiscount = itemAmount - itemDiscountAmount;
    const taxRate = Number(item.tax) || 0;

    return (amountAfterDiscount * taxRate) / 100;
  };

  const calculateItemTotal = (item) => {
    if (!item) return 0;

    const quantity = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const itemAmount = quantity * price;

    // Calculate discount
    const itemDiscount = Number(item.discount || 0);
    const itemDiscountType = item.discount_type || 'percentage';
    let itemDiscountAmount = 0;

    if (itemDiscountType === 'percentage') {
      itemDiscountAmount = (itemAmount * itemDiscount) / 100;
    } else {
      itemDiscountAmount = itemDiscount;
    }

    // Calculate tax
    const taxAmount = isTaxEnabled ? calculateItemTaxAmount(item) : 0;

    // Final item total: amount - discount + tax
    return itemAmount - itemDiscountAmount + taxAmount;
  };

  const calculateTotals = (items = []) => {
    if (!Array.isArray(items)) {
      items = [];
    }

    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const itemAmount = quantity * price;

      // Calculate item discount
      const itemDiscount = Number(item.discount || 0);
      const itemDiscountType = item.discount_type || 'percentage';
      let itemDiscountAmount = 0;

      if (itemDiscountType === 'percentage') {
        itemDiscountAmount = (itemAmount * itemDiscount) / 100;
      } else {
        itemDiscountAmount = itemDiscount;
      }

      totalDiscount += itemDiscountAmount;
      subTotal += itemAmount;

      if (isTaxEnabled) {
        totalTax += calculateItemTaxAmount(item);
      }
    });

    const totalAmount = subTotal - totalDiscount + totalTax;

    // Update form values
    form.setFieldsValue({
      subtotal: subTotal.toFixed(2),
      tax: totalTax.toFixed(2),
      total: totalAmount.toFixed(2),
    });

    // Update individual item amounts
    const updatedItems = items.map(item => {
      const taxAmount = calculateItemTaxAmount(item);
      const total = calculateItemTotal(item);
      return {
        ...item,
        amount: total.toFixed(2),
        tax_amount: taxAmount.toFixed(2)
      };
    });

    form.setFieldsValue({ items: updatedItems });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formattedItems = values.items?.map(item => ({
        product_id: item.id,
        name: item.item_name,
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        tax_rate: Number(item.tax) || 0,
        discount: Number(item.discount) || 0,
        discount_type: item.discount_type || 'percentage',
        hsn_sac: item.hsn_sac || '',
        tax_amount: calculateItemTaxAmount(item),
        amount: calculateItemTotal(item)
      }));

      const payload = {
        category: 'customer',
        customer: values.customer,
        issueDate: values.issueDate?.format("YYYY-MM-DD"),
        dueDate: values.dueDate?.format("YYYY-MM-DD"),
        currency: values.currency,
        items: formattedItems,
        subtotal: Number(values.subtotal) || 0,
        tax: Number(values.tax) || 0,
        total: Number(values.total) || 0,
        payment_status: values.status || "unpaid"
      };
      
      const result = await createInvoice({id:dealId, data:payload}).unwrap();
      message.success("Invoice created successfully");
      form.resetFields();
      setCreateModalVisible(false);
      onCancel();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error(error?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (values) => {
    try {
      const result = await createCustomer({
        name: values.name,
        contact: values.contact,
      }).unwrap();

      message.success('Customer created successfully');
      setIsCustomerModalOpen(false);
      customerForm.resetFields();

      // Automatically select the newly created customer
      form.setFieldValue('customer', result.data.id);
    } catch (error) {
      message.error('Failed to create customer: ' + error.message);
    }
  };

  const handleCurrencyChange = (value, option) => {
    const currency = currenciesData?.find(c => c.id === value);
    if (currency) {
      setSelectedCurrency(currency.currencyIcon);
      setSelectedCurrencyId(value);

      // Update all prices with new currency
      const items = form.getFieldValue('items') || [];
      const updatedItems = items.map(item => ({
        ...item,
        unit_price: item.unit_price || 0
      }));
      form.setFieldsValue({ items: updatedItems });
      calculateTotals(updatedItems);
    }
  };

  const handleProductSelect = (value, option) => {
    const selectedProduct = productsData?.data?.find(product => product.id === value);
    if (selectedProduct) {
      // Get the product's currency from currencies list
      const productCurrency = currenciesData?.find(c => c.id === selectedProduct.currency);
      if (productCurrency) {
        setSelectedProductCurrency(productCurrency);
        setSelectedCurrency(productCurrency.currencyIcon);
        setSelectedCurrencyId(productCurrency.id);
        setIsCurrencyDisabled(true);
      }

      // Update the items list
      const items = form.getFieldValue('items') || [];
      const newItems = [...items];
      const lastIndex = newItems.length - 1;
      newItems[lastIndex] = {
        ...newItems[lastIndex],
        id: selectedProduct.id,
        item_name: selectedProduct.name,
        unit_price: selectedProduct.selling_price,
        hsn_sac: selectedProduct.hsn_sac,
        tax: selectedProduct.tax,
        profilePic: selectedProduct.image,
        currency: selectedProduct.currency
      };
      form.setFieldsValue({
        items: newItems,
        currency: selectedProduct.currency
      });
      calculateTotals(newItems);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1100}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal"
      styles={{
        body: {
          padding: 0,
          borderRadius: "8px",
          overflow: "hidden",
        },
      }}
    >
      <div
        className="modal-header"
        style={{
          background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
          padding: "24px",
          color: "#ffffff",
          position: "relative",
        }}
      >
        <Button
          type="text"
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            color: "#ffffff",
            width: "32px",
            height: "32px",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }}
        >
          <FiX style={{ fontSize: "20px" }} />
        </Button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiFileText style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2
              style={{
                margin: "0",
                fontSize: "24px",
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              Create New Invoice
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create invoice
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        initialValues={{
          items: [{}],
          status: "unpaid"
        }}
        style={{
          padding: "24px",
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="customer"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiUser style={{ marginRight: "8px", color: "#1890ff" }} />
                  Customer <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select customer" }]}
            >
              <Select
                showSearch
                placeholder="Select Customer"
                optionFilterProp="children"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px"
                }}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        type="primary"
                        icon={<FiPlus />}
                        onClick={() => setIsCustomerModalOpen(true)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                          border: 'none',
                          height: '40px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
                          fontWeight: '500',
                        }}
                      >
                        Add Customer
                      </Button>
                    </div>
                  </>
                )}
              >
                {customers?.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="currency"
              label={
                <span className="form-label">
                  Currency <span className="required"></span>
                </span>
              }
              rules={[{ required: true, message: "Please select currency" }]}
            >
              <Select
                placeholder="Select Currency"
                size="large"
                value={selectedCurrencyId}
                onChange={handleCurrencyChange}
                disabled={true}
                style={{
                  // width: "450px",
                  borderRadius: "10px",
                }}
              >
                {currenciesData?.map((currency) => (
                  <Option
                    key={currency.id}
                    value={currency.id}
                    symbol={currency.currencyIcon}
                  >
                    {currency.currencyName} ({currency.currencyIcon})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="issueDate"
            label={
              <span className="form-label">
                Issue Date <span className="required"></span>
              </span>
            }
            rules={[{ required: true, message: "Please select issue date" }]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
                backgroundColor: "#f8fafc",
              }}
              suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
            />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label={
              <span className="form-label">
                Due Date <span className="required"></span>
              </span>
            }
            rules={[{ required: true, message: "Please select due date" }]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
                backgroundColor: "#f8fafc",
              }}
              suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label={
              <span className="form-label">
                Payment Status <span className="required"></span>
              </span>
            }
            rules={[{ required: true, message: "Please select payment status" }]}
          >
            <Select
              placeholder="Select Status"
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
              }}
            >
              <Option value="paid">Paid</Option>
              <Option value="unpaid">Unpaid</Option>
              {/* <Option value="partially_paid">Partially Paid</Option> */}
            </Select>
          </Form.Item>
        </div>

        <div className="table-style-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', marginBottom: '16px', marginLeft: '16px', marginRight: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
              <FiPackage style={{ marginRight: '8px', color: '#1890ff' }} />
              Items & Services
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ marginRight: '8px' }}>Enable Tax</Text>
              <Switch
                checked={isTaxEnabled}
                onChange={(checked) => {
                  setIsTaxEnabled(checked);
                  if (!checked) {
                    const items = form.getFieldValue('items') || [];
                    items.forEach(item => {
                      item.tax = 0;
                      item.taxId = undefined;
                    });
                    form.setFieldsValue({ items });
                  }
                  calculateTotals(form.getFieldValue('items'));
                }}
                size="small"
              />
            </div>
          </div>

          <Form.Item
            name="product_id"
            rules={[{ required: true, message: 'Please select product' }]}
          >
            <Select
              placeholder="Select Product"
              size="large"
              loading={productsLoading}
              style={{
                width: '30%',
                marginLeft: '16px',
                marginRight: '16px',
                marginTop: '16px',
                marginBottom: '16px',
                borderRadius: '10px',
              }}
              value={form.getFieldValue('items')?.[0]?.item_name}
              onChange={handleProductSelect}
            >
              {productsData?.data?.map(product => (
                <Option
                  key={product.id}
                  value={product.id}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '4px', overflow: 'hidden' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{product.name}</span>
                      {/* <span style={{ fontSize: '12px', color: '#666' }}>
                        Price: {selectedCurrency} {product.selling_price}
                      </span> */}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <table className="proposal-items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>HSN/SAC</th>
                      <th>Discount</th>
                      <th>Tax</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <tr key={key} className="item-data-row">
                        <td>
                          <Form.Item
                            {...restField}
                            name={[name, "item_name"]}
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input
                              placeholder="Item Name"
                              className="item-input"
                            />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            {...restField}
                            name={[name, "quantity"]}
                            rules={[{ required: true, message: "Required" }]}
                            initialValue={1}
                          >
                            <InputNumber
                              min={1}
                              className="quantity-input"
                              onChange={() => calculateTotals(form.getFieldValue("items"))}
                            />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            {...restField}
                            name={[name, "unit_price"]}
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <InputNumber
                              className="price-input"
                              min={0}
                              onChange={() => calculateTotals(form.getFieldValue("items"))}
                              formatter={value => `${selectedCurrency}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/[^\d.]/g, '')}
                            />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            {...restField}
                            name={[name, "hsn_sac"]}
                          >
                            <Input placeholder="HSN/SAC" className="hsn-input" />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item {...restField} name={[name, "discount"]} style={{ margin: 0 }}>
                            <Space>
                              <Form.Item
                                {...restField}
                                name={[name, "discount_type"]}
                                style={{ margin: 0 }}
                              >
                                <Select
                                  size="large"
                                  style={{
                                    width: '120px',
                                    borderRadius: '8px',
                                    height: '40px',
                                  }}
                                  defaultValue="percentage"
                                  onChange={() => calculateTotals(form.getFieldValue("items"))}
                                >
                                  <Option value="percentage">Percentage</Option>
                                  <Option value="fixed">Fixed Amount</Option>
                                </Select>
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "discount"]}
                                style={{ margin: 0 }}
                              >
                                <InputNumber
                                  className="item-discount-input"
                                  placeholder={form.getFieldValue('items')?.[index]?.discount_type === 'fixed' ? 'Amount' : '%'}
                                  formatter={value => form.getFieldValue('items')?.[index]?.discount_type === 'fixed' ? `${selectedCurrency}${value}` : `${value}`}
                                  parser={value => form.getFieldValue('items')?.[index]?.discount_type === 'fixed' ? value.replace(selectedCurrency, '').trim() : value.replace('%', '')}
                                  onChange={() => calculateTotals(form.getFieldValue("items"))}
                                  style={{
                                    width: '100px',
                                    borderRadius: '8px',
                                    height: '40px',
                                  }}
                                />
                              </Form.Item>
                              {form.getFieldValue('items')?.[index]?.discount_type === 'percentage' && <Text style={{ marginTop: '10px' }}>%</Text>}
                            </Space>
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            {...restField}
                            name={[name, "taxId"]}
                          >
                            <Select
                              placeholder="Select Tax"
                              loading={taxesLoading}
                              disabled={!isTaxEnabled}
                              onChange={(value, option) => {
                                const items = form.getFieldValue('items') || [];
                                items[index].tax = option?.taxRate;
                                form.setFieldsValue({ items });
                                calculateTotals(items);
                              }}
                            >
                              {taxesData?.data?.map(tax => (
                                <Option
                                  key={tax.id}
                                  value={tax.id}
                                  taxRate={tax.gstPercentage}
                                >
                                  {tax.gstName} ({tax.gstPercentage}%)
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </td>
                        <td>
                          <div className="amount-field">
                            <span className="currency-symbol">{selectedCurrency}</span>
                            <span className="amount-value">
                              {calculateItemTotal(form.getFieldValue("items")[index])?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </td>
                        <td>
                          {fields.length > 1 && (
                            <Button
                              type="text"
                              icon={<FiTrash2 style={{ color: "#ff4d4f" }} />}
                              onClick={() => {
                                remove(name);
                                calculateTotals(form.getFieldValue("items"));
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="add-item-container">
                  <Button
                    type="primary"
                    icon={<FiPlus />}
                    onClick={() => add()}
                    className="add-item-btn"
                  >
                    Add Items
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text style={{ marginTop: '10px' }}>Sub Total</Text>
              <Form.Item name="subtotal" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: '120px',
                    borderRadius: '8px',
                    height: '40px',
                  }}
                  formatter={value => `${selectedCurrency}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text>Tax</Text>
              <Form.Item name="tax" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: '120px',
                    borderRadius: '8px',
                    height: '40px',
                  }}
                  formatter={value => `${selectedCurrency}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Total Amount</Text>
              <Form.Item name="total" style={{ margin: 0 }}>
                <InputNumber
                  disabled
                  size="large"
                  style={{
                    width: '120px',
                    borderRadius: '8px',
                    height: '40px',
                  }}
                  formatter={value => `${selectedCurrency}${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </div>
          </div>
        </div>

        <div className="form-footer">
          <Button
            onClick={onCancel}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="create-btn"
          >
            Create Invoice
          </Button>
        </div>
      </Form>

      <Modal
        title={null}
        open={isCustomerModalOpen}
        onCancel={() => {
          setIsCustomerModalOpen(false);
          customerForm.resetFields();
        }}
        footer={null}
        width={500}
        destroyOnClose={true}
        centered
        closeIcon={null}
        className="pro-modal custom-modal"
        styles={{
          body: {
            padding: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
            padding: "24px",
            color: "#ffffff",
            position: "relative",
          }}
        >
          <Button
            type="text"
            onClick={() => {
              setIsCustomerModalOpen(false);
              customerForm.resetFields();
            }}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              color: "#ffffff",
              width: "32px",
              height: "32px",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
          >
            <FiX style={{ fontSize: "20px" }} />
          </Button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiUser style={{ fontSize: "24px", color: "#ffffff" }} />
            </div>
            <div>
              <h2
                style={{
                  margin: "0",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                Create New Customer
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Add a new customer to the system
              </Text>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <Form
          form={customerForm}
          layout="vertical"
          onFinish={handleCreateCustomer}
          requiredMark={false}
          style={{
            padding: "24px",
          }}
        >
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input
              prefix={<FiUser style={{ color: '#1890ff' }} />}
              placeholder="Enter customer name"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="contact"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter phone number' },
              { pattern: /^\d{10}$/, message: 'Please enter a valid 10-digit phone number' }
            ]}
          >
            <Input
              prefix={<FiPhone style={{ color: '#1890ff' }} />}
              placeholder="Enter phone number"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              size="large"
              onClick={() => {
                setIsCustomerModalOpen(false);
                customerForm.resetFields();
              }}
              style={{
                padding: "8px 24px",
                height: "44px",
                borderRadius: "8px",
                border: "1px solid #e6e8eb",
                fontWeight: "500",
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              style={{
                padding: '8px 24px',
                height: '44px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              }}
            >
              Create Customer
            </Button>
          </div>
        </Form>
      </Modal>
    </Modal>
  );
};

export default CreateInvoice;
