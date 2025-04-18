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
  DatePicker,
  InputNumber,
  Space,
  message,
  Upload,
  Divider
} from "antd";
import { 
  CloseOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  FileTextOutlined,
  UploadOutlined
} from "@ant-design/icons";
import { FiX, FiDollarSign, FiFileText, FiUser } from "react-icons/fi";
import dayjs from "dayjs";
import "./proposal.scss";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useGetLeadsQuery } from "../lead/services/LeadApi";
import { useGetAllTaxesQuery } from "../../settings/tax/services/taxApi";
import { useCreateProposalMutation } from "./services/proposalApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateProposal = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([{ id: 1, item: "", quantity: 1, unit_price: 0, tax: null, amount: 0, description: "" }]);
  const [totals, setTotals] = useState({
    subTotal: 0,
    discount: 0,
    totalTax: 0,
    totalAmount: 0
  });
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState('₹');
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);

  // API hooks
  const { data: currencies = [], isLoading: currenciesLoading } = useGetAllCurrenciesQuery({ limit: 100 });
  const { data: leadsResponse = {}, isLoading: leadsLoading } = useGetLeadsQuery({});
  const { data: taxesData = {}, isLoading: taxesLoading } = useGetAllTaxesQuery();
  const [createProposal] = useCreateProposalMutation();

  // Fetch currencies from the API
  const currencyOptions = currencies.map(currency => ({
    value: currency.currencyCode,
    label: `${currency.currencyCode} - ${currency.currencyName} ${currency.currencyIcon}`,
    symbol: currency.currencyIcon
  }));

  // Fetch leads from the API
  const leads = leadsResponse.data || [];

  // Replace mock lead data with actual leads from API
  const leadOptions = leads.map(lead => ({
    id: lead.id,
    title: lead.leadTitle || `Lead #${lead.id}`,
    value: lead.leadValue || 0,
    currency: lead.currency || 'INR'
  }));

  // Format tax options for the select component
  const taxOptions = React.useMemo(() => {
    if (!taxesData?.data || !Array.isArray(taxesData.data)) return [];
    
    return taxesData.data.map(tax => ({
      value: `${tax.gstName}|${tax.gstPercentage}`,
      label: `${tax.gstName} (${tax.gstPercentage}%)`,
      tax: {
        gstName: tax.gstName,
        gstPercentage: tax.gstPercentage
      }
    }));
  }, [taxesData]);

  // Calculate subtotal (sum of all row amounts)
  const calculateSubTotal = () => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const baseAmount = quantity * unitPrice;
      const tax = item.tax ? parseFloat(item.tax.gstPercentage) : 0;
      const taxAmount = (baseAmount * tax) / 100;
      const totalAmount = baseAmount + taxAmount;
      return sum + totalAmount;
    }, 0);
  };

  // Calculate totals
  const calculateTotals = () => {
    // Calculate subtotal
    const subTotal = calculateSubTotal();
    
    // Calculate total tax amount from all items
    const totalTax = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const baseAmount = quantity * unitPrice;
      const taxPercentage = item.tax ? parseFloat(item.tax.gstPercentage) : 0;
      const taxAmount = (baseAmount * taxPercentage) / 100;
      return sum + taxAmount;
    }, 0);
    
    // Calculate discount
    let discountAmount = 0;
    if (discountValue !== "") {
      if (discountType === "percentage") {
        discountAmount = (subTotal * (parseFloat(discountValue) || 0)) / 100;
      } else {
        discountAmount = parseFloat(discountValue) || 0;
      }
    }
    
    // Calculate final total
    const totalAmount = subTotal - discountAmount;
    
    setTotals({
      subTotal,
      discount: discountAmount,
      totalTax,
      totalAmount
    });
    
    // Update form fields
    form.setFieldsValue({
      total_amount: totalAmount
    });
  };

  // Effect to calculate totals whenever items change
  useEffect(() => {
    calculateTotals();
  }, [items, discountValue, discountType]);

  // Set default Indian currency (INR) when currencies are loaded
  useEffect(() => {
    if (currencies.length > 0) {
      const inrCurrency = currencies.find(curr => curr.currencyCode === 'INR');
      if (inrCurrency) {
        setSelectedCurrencySymbol(inrCurrency.currencyIcon);
        form.setFieldsValue({ currency: 'INR' });
      }
    }
  }, [currencies, form]);

  // Add handler for currency change
  const handleCurrencyChange = (value) => {
    const selectedCurrency = currencyOptions.find(curr => curr.value === value);
    if (selectedCurrency) {
      setSelectedCurrencySymbol(selectedCurrency.symbol);
    }
  };

  // Add handler for lead selection
  const handleLeadChange = (leadId) => {
    const selectedLead = leads.find(lead => lead.id === leadId);
    if (selectedLead && selectedLead.currency) {
      // Update currency when lead is selected
      form.setFieldsValue({ currency: selectedLead.currency });
      
      // Find and update currency symbol
      const selectedCurrency = currencies.find(c => c.currencyCode === selectedLead.currency);
      if (selectedCurrency) {
        setSelectedCurrencySymbol(selectedCurrency.currencyIcon);
      }
      
      // Update the first item with lead details
      if (items.length > 0) {
        const updatedItems = [...items];
        updatedItems[0] = {
          ...updatedItems[0],
          item: selectedLead.leadTitle || "",
          unit_price: selectedLead.leadValue || 0,
          amount: selectedLead.leadValue * updatedItems[0].quantity
        };
        setItems(updatedItems);
      }
    }
  };

  // Handle item changes
  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate amount whenever quantity or unit price changes
        if (field === 'quantity' || field === 'unit_price') {
          const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 0;
          const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : parseFloat(item.unit_price) || 0;
          const baseAmount = quantity * unitPrice;
          const taxPercentage = item.tax ? parseFloat(item.tax.gstPercentage) : 0;
          const taxAmount = (baseAmount * taxPercentage) / 100;
          updatedItem.amount = baseAmount + taxAmount;
        } else if (field === 'tax') {
          const quantity = parseFloat(item.quantity) || 0;
          const unitPrice = parseFloat(item.unit_price) || 0;
          const baseAmount = quantity * unitPrice;
          const taxPercentage = value ? parseFloat(value.gstPercentage) : 0;
          const taxAmount = (baseAmount * taxPercentage) / 100;
          updatedItem.amount = baseAmount + taxAmount;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(updatedItems);
  };

  // Add new item
  const handleAddItem = () => {
    const newId = Math.max(...items.map(item => item.id), 0) + 1;
    setItems([...items, { id: newId, item: "", quantity: 1, unit_price: 0, tax: null, amount: 0, description: "" }]);
  };

  // Remove item
  const handleRemoveItem = (id) => {
    if (items.length === 1) {
      message.warning("At least one item is required");
      return;
    }
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
  };

  // Handle discount change
  const handleDiscountChange = (value) => {
    setDiscountValue(value);
  };

  // Handle discount type change
  const handleDiscountTypeChange = (value) => {
    setDiscountType(value);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate items
      if (!items.some(item => item.item && item.quantity && item.unit_price)) {
        message.error('Please add at least one item with name, quantity, and price');
        setLoading(false);
        return;
      }

      // Transform items to the format required by API
      const formattedItems = items.map(item => ({
        item: item.item,
        quantity: parseFloat(item.quantity) || 0,
        price: parseFloat(item.unit_price) || 0,
        tax_name: item.tax ? item.tax.gstName : "",
        tax: item.tax ? parseFloat(item.tax.gstPercentage) : 0,
        amount: parseFloat(item.amount) || 0,
        description: item.description || ""
      }));

      // Prepare payload
      const payload = {
        lead_title: values.lead_title,
        valid_till: dayjs(values.date).format("YYYY-MM-DD"),
        currency: values.currency,
        description: values.description || "",
        items: formattedItems,
        subtotal: parseFloat(totals.subTotal).toFixed(2),
        discount_type: discountType,
        discount_value: parseFloat(discountValue) || 0,
        discount: parseFloat(totals.discount).toFixed(2),
        tax: parseFloat(totals.totalTax).toFixed(2),
        total: parseFloat(totals.totalAmount).toFixed(2)
      };

      // Call the API
      const response = await createProposal(payload).unwrap();
      
      message.success("Proposal created successfully");
      
      // Reset form and state
      form.resetFields();
      setItems([{ id: 1, item: "", quantity: 1, unit_price: 0, tax: null, amount: 0, description: "" }]);
      setDiscountValue(0);
      setDiscountType("percentage");
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response);
      }
      
      // Close modal
      onCancel();

    } catch (error) {
      console.error('Error creating proposal:', error);
      message.error(error.data?.message || 'Failed to create proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal"
      style={{
        '--antd-arrow-background-color': '#ffffff',
      }}
      styles={{
        body: {
          padding: 0,
          borderRadius: '8px',
          overflow: 'hidden',
        }
      }}
    >
      <div
        className="modal-header"
        style={{
          background: 'linear-gradient(135deg, #4096ff 0%, #096dd9 100%)',
          padding: '24px',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        <Button
          type="text"
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: '#ffffff',
            width: '32px',
            height: '32px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <FiX style={{ fontSize: '20px' }} />
        </Button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FiFileText style={{ fontSize: '24px', color: '#ffffff' }} />
          </div>
          <div>
            <h2
              style={{
                margin: '0',
                fontSize: '24px',
                fontWeight: '600',
                color: '#ffffff',
              }}
            >
              Create New Proposal
            </h2>
            <Text
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              Fill in the information to create a new business proposal
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: dayjs(),
          discount: 0,
          currency: 'INR'
        }}
        requiredMark={false}
        style={{
          padding: '24px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="lead_title"
            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Lead Title</span>}
            rules={[{ required: true, message: 'Please select lead title' }]}
          >
            <Select 
              placeholder="Select Lead Title" 
              size="large"
              loading={leadsLoading}
              onChange={handleLeadChange}
              style={{
                width: '100%',
                borderRadius: '10px',
                height: '48px'
              }}
            >
              {leadOptions.map(lead => (
                <Option key={lead.id} value={lead.id}>
                  {lead.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Date</span>}
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker 
              format="DD-MM-YYYY" 
              size="large"
              style={{ 
                width: "100%", 
                borderRadius: '10px',
                height: '48px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e6e8eb',
              }}
              placeholder="dd-mm-yyyy"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="currency"
          label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Currency</span>}
          rules={[{ required: true, message: 'Please select currency' }]}
        >
          <Select 
            placeholder="Select Currency" 
            size="large"
            loading={currenciesLoading}
            onChange={handleCurrencyChange}
            style={{
              width: '50%',
              borderRadius: '10px',
              height: '48px',
              backgroundColor: '#f8fafc',
            }}
            listHeight={100}
            dropdownStyle={{
              maxHeight: '120px',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollBehavior: 'smooth'
            }}
          >
            {currencyOptions.map(currency => (
              <Option key={currency.value} value={currency.value}>
                {currency.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Description</span>}
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea
            placeholder="Enter detailed description of the proposal"
            rows={4}
            style={{
              borderRadius: '10px',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e6e8eb',
              transition: 'all 0.3s ease',
            }}
          />
        </Form.Item>

        <div className="table-style-container">
          <table className="proposal-items-table">
            <thead>
              <tr>
                <th>Item*</th>
                <th>Quantity*</th>
                <th>Unit Price*</th>
                <th>TAX (%)</th>
                <th>Amount*</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <tr className="item-data-row">
                    <td>
                      <Input 
                        placeholder="Item Name"
                        value={item.item}
                        onChange={(e) => handleItemChange(item.id, "item", e.target.value)}
                        className="item-input"
                        size="middle"
                        style={{
                          padding: '0 11px',
                          marginBottom: '5px',
                        }}
                      />
                    </td>
                    <td>
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(value) => handleItemChange(item.id, "quantity", value)}
                        className="quantity-input"
                        controls={false}
                        size="middle"
                        style={{
                         padding: '0 11px',
                         marginBottom: '5px',
                        }}
                      />
                    </td>
                    <td>
                      <InputNumber
                        min={0}
                        value={item.unit_price}
                        onChange={(value) => handleItemChange(item.id, "unit_price", value)}
                        formatter={(value) => `${selectedCurrencySymbol} ${value}`}
                        parser={(value) => value.replace(new RegExp(`${selectedCurrencySymbol}\\s?|(,*)`, 'g'), '')}
                        className="price-input"
                        controls={false}
                        size="middle"
                        style={{
                          padding: '0 11px',
                          marginBottom: '5px',
                        }}
                      />
                    </td>
                    <td>
                      <Select
                        value={item.tax ? `${item.tax.gstName}|${item.tax.gstPercentage}` : "0"}
                        onChange={(value) => {
                          if (!value || value === "0") {
                            handleItemChange(item.id, "tax", null);
                            return;
                          }
                          const selectedTax = taxOptions.find(opt => opt.value === value);
                          if (selectedTax) {
                            handleItemChange(item.id, "tax", selectedTax.tax);
                          }
                        }}
                        className="tax-select"
                        placeholder="0%"
                        dropdownMatchSelectWidth={false}
                        size="middle"
                        loading={taxesLoading}
                        allowClear
                        style={{
                          padding: '0 11px',  
                          marginBottom: '5px',
                        }}
                      >
                        {taxOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </td>
                    <td>
                      <div className="amount-field">
                        <span className="currency-symbol">{selectedCurrencySymbol}</span>
                        <span className="amount-value">{item.amount.toFixed(2)}</span>
                      </div>
                    </td>
                    <td>
                      <Button
                        type="text"
                        icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                        onClick={() => handleRemoveItem(item.id)}
                        className="delete-btn"
                      />
                    </td>
                  </tr>
                  <tr className="item-description-row">
                    <td colSpan="4">
                      <TextArea
                        placeholder="Description"
                        rows={1}
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        className="item-description"
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          <div className="add-item-container">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddItem}
              className="add-item-btn"
            >
              Add Items
            </Button>
          </div>
        </div>

        <div className="summary-card">
          
          <div className="summary-content">
            <div className="summary-row sub-total">
              <span className="label">Sub Total</span>
              <span className="value">{selectedCurrencySymbol} {totals.subTotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row discount">
              <span className="label">Discount</span>
              <div className="discount-controls">
                <Select 
                  value={discountType}
                  onChange={handleDiscountTypeChange}
                  size="middle"
                  className="discount-type"
                  dropdownMatchSelectWidth={false}
                  bordered={true}
                >
                  <Option value="fixed">Fixed</Option>
                  <Option value="percentage">Percentage</Option>
                </Select>
                <div className="discount-input-wrapper">
                  <InputNumber
                    min={0}
                    max={discountType === "percentage" ? 100 : undefined}
                    value={discountValue}
                    onChange={handleDiscountChange}
                    className="discount-input"
                    controls={false}
                    size="middle"
                    formatter={value => `${value}`}
                    parser={value => value.replace(/\D/g, '')}
                  />
                  <span className="discount-symbol">{discountType === "percentage" ? "%" : selectedCurrencySymbol}</span>
                </div>
              </div>
            </div>
            
            <div className="summary-row tax">
              <span className="label">Total Tax</span>
              <span className="value">{selectedCurrencySymbol} {totals.totalTax.toFixed(2)}</span>
            </div>
            
            <div className="summary-row total">
              <span className="label">Total Amount</span>
              <span className="value total-value">{selectedCurrencySymbol} {totals.totalAmount.toFixed(2)}</span>
              <Form.Item name="total_amount" hidden noStyle>
                <InputNumber />
              </Form.Item>
            </div>
          </div>
        </div>

        <div className="form-footer">
          <Button 
            onClick={onCancel} 
            size="large"
            disabled={loading}
            style={{
              padding: '8px 24px',
              height: '44px',
              borderRadius: '10px',
              border: '1px solid #e6e8eb',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            style={{
              padding: '8px 32px',
              height: '44px',
              borderRadius: '10px',
              fontWeight: '500',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Create Proposal
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateProposal;
