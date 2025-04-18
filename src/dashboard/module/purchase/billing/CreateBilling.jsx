import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Select, Row, Col, Divider, InputNumber, DatePicker, Space, message, Switch } from 'antd';
import { FiFileText, FiX, FiUser, FiCalendar, FiHash, FiDollarSign, FiPlus, FiTrash2, FiPackage, FiPhone } from 'react-icons/fi';
import dayjs from 'dayjs';
import './billing.scss';
import { useGetVendorsQuery, useCreateVendorMutation } from '../vendor/services/vendorApi';
import { useGetProductsQuery } from '../../sales/product&services/services/productApi';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import { useGetAllTaxesQuery } from '../../settings/tax/services/taxApi';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useSelector } from 'react-redux';

const { Text } = Typography;
const { Option } = Select;

const CreateBilling = ({ open, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState('₹');
    const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);
    const [isCurrencyDisabled, setIsCurrencyDisabled] = useState(true);
    const [isTaxEnabled, setIsTaxEnabled] = useState(false);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [vendorForm] = Form.useForm();
    const [createVendor] = useCreateVendorMutation();
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: vendorsData, isLoading: vendorsLoading } = useGetVendorsQuery();

    // Fetch currencies
    const { data: currenciesData, isLoading: currenciesLoading } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    // Fetch taxes
    const { data: taxesData, isLoading: taxesLoading } = useGetAllTaxesQuery();

    // Fetch products
    const { data: productsData, isLoading: productsLoading } = useGetProductsQuery(loggedInUser?.id);

    useEffect(() => {
        if (currenciesData?.data?.length > 0 ) {
            const defaultCurrency = currenciesData.find(c => c.currencyCode === 'INR') || currenciesData.data[0];
            form.setFieldValue('currency', defaultCurrency.id);
        }
    }, [currenciesData, form]);

    const handleCurrencyChange = (value, option) => {
        const currency = currenciesData?.find(c => c.id === value);
        if (currency) {
            setSelectedCurrency(currency.currencyIcon);
            setSelectedCurrencyId(value);

            // Update all prices with new currency
            const items = form.getFieldValue('items') || [];
            const updatedItems = items.map(item => ({
                ...item,
                unit_price: item.unit_price || 0,
                currency: value,
                currencyIcon: currency.currencyIcon
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
                setSelectedCurrency(productCurrency.currencyIcon);
                setSelectedCurrencyId(productCurrency.id);
                setIsCurrencyDisabled(true);

                // Update the form with the product's currency
                form.setFieldsValue({
                    currency: productCurrency.id
                });

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
                    currency: selectedProduct.currency,
                    currencyIcon: productCurrency.currencyIcon
                };
                form.setFieldsValue({
                    items: newItems,
                    currency: selectedProduct.currency
                });
                calculateTotals(newItems);
            }
        }
    };

    const handleCreateVendor = async (values) => {
        try {
            const result = await createVendor({
                name: values.name,
                contact: values.contact,
            }).unwrap();

            message.success('Vendor created successfully');
            setIsVendorModalOpen(false);
            vendorForm.resetFields();

            // Automatically select the newly created vendor
            form.setFieldValue('vendor_id', result.data.id);
        } catch (error) {
            message.error('Failed to create vendor: ' + error.message);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            // Find selected currency details
            const selectedCurrencyData = currenciesData?.find(curr => curr.id === values.currency);

            // Format the data according to your API requirements
            const formattedData = {
                vendor: values.vendor_id,
                billDate: values.billDate ? dayjs(values.billDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                currency: selectedCurrencyData?.id || values.currency,
                currencyCode: selectedCurrencyData?.currencyCode || values.currency,
                currencyIcon: selectedCurrencyData?.currencyIcon || selectedCurrency,
                items: values.items?.map(item => ({
                    itemName: item.item_name,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.selling_price || item.unit_price),
                    hsnSac: item.hsn_sac || '',
                    discount: Number(item.discount || 0),
                    tax: Number(item.tax || 0),
                    taxId: item.taxId,
                    taxAmount: calculateItemTaxAmount(item),
                    amount: calculateItemTotal(item),
                    description: item.description || '',
                    currency: item.currency || values.currency,
                    currencyIcon: item.currencyIcon || selectedCurrency
                })),
                discription: values.discription || '',
                subTotal: Number(values.sub_total || 0),
                discount: Number(values.discount || 0),
                tax: Number(values.tax_amount || 0),
                taxAmount: Number(values.tax_amount || 0),
                total: Number(values.total_amount || 0),
                status: values.status || 'pending'
            };

            await onSubmit(formattedData);
            console.log('Formatted Data:', formattedData);
            form.resetFields();
            onCancel();
        } catch (error) {
            console.error('Submit Error:', error);
            message.error(error?.data?.message || 'Failed to create bill');
        } finally {
            setLoading(false);
        }
    };

    const calculateItemTaxAmount = (item) => {
        if (!item) return 0;
        if (!isTaxEnabled || !item.tax) return 0;

        const quantity = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        const discount = Number(item.discount || 0);

        const amountBeforeTax = (quantity * price) - discount;
        const taxRate = Number(item.tax) || 0;

        return (amountBeforeTax * taxRate) / 100;
    };

    const calculateItemTotal = (item) => {
        if (!item) return 0;

        const quantity = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        const discount = Number(item.discount || 0);
        const taxAmount = isTaxEnabled ? calculateItemTaxAmount(item) : 0;

        return (quantity * price) - discount + taxAmount;
    };

    const calculateTotals = (items = []) => {
        let subTotal = 0;
        let totalTaxAmount = 0;

        items.forEach(item => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.unit_price) || 0;
            let itemTaxAmount = 0;

            if (isTaxEnabled && item.tax) {
                itemTaxAmount = calculateItemTaxAmount(item);
                totalTaxAmount += itemTaxAmount;
            }

            // Calculate item amount including tax
            const itemAmount = (quantity * price) + itemTaxAmount;

            // Add to subtotal
            subTotal += itemAmount;
        });

        const discountType = form.getFieldValue('discount_type') || 'percentage';
        const discountValue = Number(form.getFieldValue('discount')) || 0;
        let discountAmount = 0;

        if (discountType === 'percentage') {
            discountAmount = (subTotal * discountValue) / 100;
        } else {
            discountAmount = discountValue;
        }

        // Total amount is subtotal minus discount
        const totalAmount = subTotal - discountAmount;

        form.setFieldsValue({
            sub_total: subTotal.toFixed(2),
            tax_amount: isTaxEnabled ? totalTaxAmount.toFixed(2) : '0.00',
            total_amount: totalAmount.toFixed(2)
        });
    };

    const vendorModal = (
        <Modal
            title={null}
            open={isVendorModalOpen}
            onCancel={() => {
                setIsVendorModalOpen(false);
                vendorForm.resetFields();
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
                    borderRadius: '8px',
                    overflow: 'hidden',
                }
            }}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                    padding: '24px',
                    color: '#ffffff',
                    position: 'relative',
                }}
            >
                <Button
                    type="text"
                    onClick={() => {
                        setIsVendorModalOpen(false);
                        vendorForm.resetFields();
                    }}
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
                        <FiUser style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            Create New Vendor
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            Add a new vendor to the system
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={vendorForm}
                layout="vertical"
                onFinish={handleCreateVendor}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <Form.Item
                    name="name"
                    label="Vendor Name"
                    rules={[{ required: true, message: 'Please enter vendor name' }]}
                >
                    <Input
                        prefix={<FiUser style={{ color: '#1890ff' }} />}
                        placeholder="Enter vendor name"
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
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        marginTop: '24px',
                    }}
                >
                    <Button
                        size="large"
                        onClick={() => {
                            setIsVendorModalOpen(false);
                            vendorForm.resetFields();
                        }}
                        style={{
                            padding: '8px 24px',
                            height: '44px',
                            borderRadius: '8px',
                            border: '1px solid #e6e8eb',
                            fontWeight: '500',
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
                        Create Vendor
                    </Button>
                </div>
            </Form>
        </Modal>
    );

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={1000}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
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
                    background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
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
                            Create New Bill
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            Fill in the information to create bill
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
                    status: 'pending'
                }}
                style={{
                    padding: '24px',
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="vendor_id"
                        label={
                            <span className="form-label">
                                Vendor <span className="required"></span>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select vendor' }]}
                    >
                        <Select
                            placeholder="Select Vendor"
                            showSearch
                            optionFilterProp="children"
                            size="large"
                            loading={vendorsLoading}
                            style={{
                                width: '100%',
                                borderRadius: '8px',
                            }}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{ margin: '8px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Button
                                            type="primary"
                                            icon={<FiPlus />}
                                            onClick={() => setIsVendorModalOpen(true)}
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
                                            Add Vendor
                                        </Button>
                                    </div>
                                </>
                            )}
                        >
                            {vendorsData?.data?.map(vendor => (
                                <Option key={vendor.id} value={vendor.id}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '4px 0'
                                    }}>
                                        <FiUser style={{ color: '#1890ff' }} />
                                        <span>{vendor.name}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="billDate"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Bill Date <span style={{ color: '#ff4d4f' }}></span>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select bill date' }]}
                    >
                        <DatePicker
                            format="DD-MM-YYYY"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                            }}
                            suffixIcon={<FiCalendar style={{ color: '#1890ff' }} />}
                        />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                            disabled={isCurrencyDisabled}
                            style={{
                                borderRadius: "10px",
                            }}
                            optionLabelProp="label"
                        >
                            {currenciesData?.map((currency) => (
                                <Option
                                    key={currency.id}
                                    value={currency.id}
                                    label={`${currency.currencyName} (${currency.currencyIcon})`}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{currency.currencyIcon}</span>
                                        <span>{currency.currencyName}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Status <span style={{ color: '#ff4d4f' }}></span>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select
                            placeholder="Select Status"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                            }}
                        >
                             <Option value="pending">Pending</Option>
                            <Option value="unpaid">Unpaid</Option>
                            <Option value="partially_paid">Partially Paid</Option>
                            <Option value="paid">Paid</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    name="discription"
                    label="Description"
                >
                    <Input.TextArea />
                </Form.Item>

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
                                    // Reset tax values when toggle is turned off
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
                            onChange={(value, option) => {
                                const selectedProduct = productsData?.data?.find(product => product.id === value);
                                if (selectedProduct) {
                                    // Get the product's currency from currencies list
                                    const productCurrency = currenciesData?.find(c => c.id === selectedProduct.currency);
                                    if (productCurrency) {
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
                            }}
                        >
                            {productsData?.data?.map(product => (
                                <Option
                                    key={product.id}
                                    value={product.id}
                                    label={product.name}
                                    selling_price={product.selling_price}
                                    hsn_sac={product.hsn_sac}
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
                                        <div style={{ display: 'flex' }}>
                                            <div>
                                                <span style={{ fontWeight: 400 }}>{product.name}</span>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '12px', color: '#666' }}>
                                                    {/* {product.selling_price} */}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.List name="items" style={{ marginTop: '20px' }}>
                        {(fields, { add, remove }) => (
                            <>
                                <table className="proposal-items-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Quantity</th>
                                            <th>Unit Price</th>
                                            <th>HSN/SAC</th>
                                            <th>Tax</th>
                                            <th>Amount</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fields.map((field, index) => (
                                            <React.Fragment key={field.key}>
                                                <tr className="item-data-row">
                                                    <td>
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, 'item_name']}
                                                           
                                                        >
                                                            <Input 
                                                                placeholder="Item Name" 
                                                                className="item-input"
                                                                style={{
                                                                    textAlign: 'center',
                                                                    '::placeholder': {
                                                                        textAlign: 'center'
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </td>
                                                    <td>
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, 'quantity']}
                                                            initialValue={1}
                                                        >
                                                            <InputNumber
                                                                min={1}
                                                                className="quantity-input"
                                                                onChange={() => calculateTotals(form.getFieldValue('items'))}
                                                                style={{
                                                                    textAlign: 'center',
                                                                    '::placeholder': {
                                                                        textAlign: 'center'
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    </td>
                                                    <td>
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, 'unit_price']}
                                                        >
                                                            <InputNumber
                                                                className="price-input"
                                                                formatter={value => `${selectedCurrency} ${value}`}
                                                                parser={value => value.replace(selectedCurrency, '').trim()}
                                                                onChange={() => calculateTotals(form.getFieldValue('items'))}
                                                                defaultValue={0}
                                                            />
                                                        </Form.Item>
                                                    </td>
                                                    <td>
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, 'hsn_sac']}
                                                        >
                                                            <Input placeholder="HSN/SAC" className="item-input" />
                                                        </Form.Item>
                                                    </td>
                                                    <td>
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, 'taxId']}
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
                                                                {calculateItemTotal(form.getFieldValue('items')[index])?.toFixed(2) || '0.00'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {fields.length > 1 && (
                                                            <Button
                                                                type="text"
                                                                className="delete-btn"
                                                                icon={<FiTrash2 style={{ color: '#ff4d4f' }} />}
                                                                onClick={() => {
                                                                    remove(field.name);
                                                                    calculateTotals(form.getFieldValue('items'));
                                                                }}
                                                            />
                                                        )}
                                                    </td>
                                                </tr>

                                            </React.Fragment>
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
                            <Text style={{marginTop:'10px'}}>Sub Total</Text>
                            <Form.Item
                                name="sub_total"
                                style={{ }}
                            >
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
                            <Text style={{marginTop:'10px'}}>Discount</Text>
                            <Space>
                                <Form.Item
                                    name="discount_type"
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
                                        onChange={() => calculateTotals(form.getFieldValue('items'))}
                                    >
                                        <Option value="percentage">Percentage</Option>
                                        <Option value="fixed">Fixed Amount</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name="discount"
                                    style={{ margin: 0 }}
                                >
                                    <InputNumber
                                        placeholder={form.getFieldValue('discount_type') === 'fixed' ? 'Amount' : '%'}
                                        size="large"
                                        style={{
                                            width: '100px',
                                            borderRadius: '8px',
                                            height: '40px',
                                        }}
                                        formatter={value => form.getFieldValue('discount_type') === 'fixed' ? `${selectedCurrency}${value}` : `${value}`}
                                        parser={value => form.getFieldValue('discount_type') === 'fixed' ? value.replace(selectedCurrency, '').trim() : value.replace('%', '')}
                                        onChange={() => calculateTotals(form.getFieldValue('items'))}
                                    />
                                </Form.Item>
                                {form.getFieldValue('discount_type') === 'percentage' && <Text>%</Text>}
                            </Space>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <Text style={{marginTop:'10px'}}>Tax Amount</Text>
                            <Form.Item
                                name="tax_amount"
                                style={{ margin: 0 }}
                            >
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
                            <Text style={{marginTop:'10px'}}>Total Amount</Text>
                            <Form.Item
                                name="total_amount"
                                style={{ margin: 0 }}
                            >
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
                        Create Bill
                    </Button>
                </div>
            </Form>

            {vendorModal}
        </Modal>
    );
};

export default CreateBilling;