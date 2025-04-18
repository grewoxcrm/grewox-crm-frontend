import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Select, Row, Col, Divider, InputNumber, DatePicker, Space, message, Switch } from 'antd';
import { FiFileText, FiX, FiUser, FiCalendar, FiHash, FiDollarSign, FiPlus, FiTrash2, FiPackage, FiPhone } from 'react-icons/fi';
import dayjs from 'dayjs';
import './billing.scss';
import { useGetVendorsQuery, useUpdateBillingMutation } from './services/billingApi';
import { useGetProductsQuery } from '../../sales/product&services/services/productApi';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import { useGetAllTaxesQuery } from '../../settings/tax/services/taxApi';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useSelector } from 'react-redux';
import CreateVendor from '../vendor/CreateVendor';
import { useCreateVendorMutation } from '../vendor/services/vendorApi';

const { Text } = Typography;
const { Option } = Select;

const EditBilling = ({ open, onCancel, initialData }) => {
    const [form] = Form.useForm();
    const [vendorForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(initialData?.currencyIcon || '₹');
    const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);
    const [isTaxEnabled, setIsTaxEnabled] = useState(false);
    const [isCurrencyDisabled, setIsCurrencyDisabled] = useState(true);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [createVendor] = useCreateVendorMutation();
    const [updateBilling] = useUpdateBillingMutation();

    // Add this to fetch vendors
    const { data: vendorsData, isLoading: vendorsLoading, refetch: refetchVendors } = useGetVendorsQuery();
    const loggedInUser = useSelector(selectCurrentUser);
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
        if (initialData && currenciesData && vendorsData?.data) {
            // Parse items if they're in string format
            const items = typeof initialData.items === 'string' 
                ? JSON.parse(initialData.items) 
                : initialData.items;

            // Check if any item has tax
            const hasTax = items?.some(item => item.tax > 0 || item.taxId);
            setIsTaxEnabled(hasTax);

            // Find the selected currency data
            const selectedCurrencyData = currenciesData.find(curr => 
                curr.id === initialData.currency || 
                curr.currencyCode === initialData.currencyCode
            );

            // Set currency symbol and ID if found
            if (selectedCurrencyData) {
                setSelectedCurrency(selectedCurrencyData.currencyIcon);
                setSelectedCurrencyId(selectedCurrencyData.id);
            }

            // Find the vendor data
            const selectedVendor = vendorsData.data.find(vendor => vendor.id === initialData.vendor);

            // Set initial form values
            const formValues = {
                vendor_id: selectedVendor?.id || initialData.vendor,
                vendor_name: selectedVendor?.name || '',
                bill_date: dayjs(initialData.billDate),
                currency: selectedCurrencyData?.id || initialData.currency,
                discription: initialData.discription,
                status: initialData.status || 'pending',
                items: items?.length > 0 
                    ? items.map(item => ({
                        item_name: item.itemName,
                        quantity: item.quantity,
                        unit_price: Number(item.unitPrice || 0),
                        selling_price: Number(item.unitPrice || 0),
                        hsn_sac: item.hsnSac,
                        taxId: item.taxId,
                        tax: item.tax,
                        discount: item.discount || 0,
                        currency: item.currency || initialData.currency,
                        currencyIcon: item.currencyIcon || selectedCurrencyData?.currencyIcon
                    }))
                    : [{}],
                sub_total: initialData.subTotal?.toFixed(2),
                discount: initialData.discount,
                discount_type: initialData.discountType || 'percentage',
                tax_amount: initialData.tax?.toFixed(2),
                total_amount: initialData.total?.toFixed(2),
                payment_status: initialData.payment_status || 'unpaid',
            };
            
            form.setFieldsValue(formValues);

            // Set product_id based on the first item's name
            if (items?.length > 0 && productsData?.data) {
                const firstItem = items[0];
                const matchingProduct = productsData.data.find(p => p.name === firstItem.itemName);
                if (matchingProduct) {
                    form.setFieldsValue({ 
                        product_id: matchingProduct.id,
                        [`items[0].unit_price`]: Number(firstItem.unitPrice || 0),
                        [`items[0].selling_price`]: Number(firstItem.unitPrice || 0)
                    });
                }
            }

            // Calculate totals after setting initial values
            setTimeout(() => {
                calculateTotals(formValues.items);
            }, 100);
        }
    }, [initialData, form, currenciesData, productsData, vendorsData]);

    // Handle currency change
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

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            // Find selected currency details
            const selectedCurrencyData = currenciesData?.find(curr => curr.id === values.currency);

            // Format the data according to your API requirements
            const formattedData = {
                vendor: values.vendor_id,
                billDate: dayjs(values.bill_date).format('YYYY-MM-DD'),
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
                    currency: item.currency || values.currency,
                    currencyIcon: item.currencyIcon || selectedCurrency
                })),
                discription: values.discription || '',
                status: values.status || 'pending',
                subTotal: Number(values.sub_total || 0),
                discount: Number(values.discount || 0),
                tax: Number(values.tax_amount || 0),
                taxAmount: Number(values.tax_amount || 0),
                total: Number(values.total_amount || 0),
                related_id: initialData?.related_id,
                billNumber: initialData?.billNumber,
                client_id: initialData?.client_id,
                bill_status: initialData?.bill_status,
                note: initialData?.note,
                updated_total: Number(values.total_amount || 0),
                created_by: initialData?.created_by,
                updated_by: initialData?.updated_by,
                createdAt: initialData?.createdAt,
                updatedAt: initialData?.updatedAt,
                payment_status: values.payment_status || 'unpaid',
                paid_amount: Number(values.paid_amount || 0),
                remaining_amount: Number(values.remaining_amount || 0)
            };

            const response = await updateBilling({
                id: initialData.id,
                data: formattedData
            }).unwrap();

            if (response.success) {
                message.success('Bill updated successfully');
                form.resetFields();
                onCancel();
            } else {
                message.error(response.message || 'Failed to update bill');
            }
        } catch (error) {
            console.error('Submit Error:', error);
            message.error(error?.data?.message || 'Failed to update bill');
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
        const discount = Number(item.discount) || 0;
        const taxAmount = calculateItemTaxAmount(item);

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

        setSubTotal(subTotal);
        setTaxTotal(totalTaxAmount);
        setTotal(totalAmount);
        setItems(items);
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

            // Refetch vendors to get the latest data
            await refetchVendors();

            // Automatically select the newly created vendor
            form.setFieldValue('vendor_id', result.data.id);
        } catch (error) {
            message.error('Failed to create vendor: ' + error.message);
        }
    };

    const handleAddNewVendor = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsVendorModalOpen(true);
    };

    const dropdownRender = (menu) => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <div onClick={e => e.stopPropagation()}>
                <Button
                    type="link"
                    icon={<FiPlus style={{ fontSize: '16px' }} />}
                    onClick={handleAddNewVendor}
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
                        color: '#ffffff',
                        fontWeight: '500',
                      }}
                    >
                      Add New Vendor
                </Button>
            </div>
        </>
    );

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

    // Update the product selection handler
    const handleProductChange = (value, option) => {
        const items = form.getFieldValue('items') || [];
        const newItems = [...items];
        const lastIndex = newItems.length - 1;
        
        // Get the selected product's details
        const selectedProduct = productsData?.data?.find(p => p.id === value);
        
        if (selectedProduct) {
            newItems[lastIndex] = {
                ...newItems[lastIndex],
                item_name: selectedProduct.name,
                unit_price: Number(selectedProduct.selling_price || 0),
                selling_price: Number(selectedProduct.selling_price || 0),
                hsn_sac: selectedProduct.hsn_sac,
                profilePic: selectedProduct.image
            };
            
            form.setFieldsValue({ 
                items: newItems,
                [`items[${lastIndex}].unit_price`]: Number(selectedProduct.selling_price || 0),
                [`items[${lastIndex}].selling_price`]: Number(selectedProduct.selling_price || 0)
            });
            
            calculateTotals(newItems);
        }
    };

    return (
        <>
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
                                Edit Bill
                            </h2>
                            <Text
                                style={{
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                Update the bill information
                            </Text>
                        </div>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={false}
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
                                dropdownRender={dropdownRender}
                                onChange={(value, option) => {
                                    const selectedVendor = vendorsData?.data?.find(v => v.id === value);
                                    if (selectedVendor) {
                                        form.setFieldsValue({
                                            vendor_name: selectedVendor.name
                                        });
                                    }
                                }}
                            >
                                {vendorsData?.data?.map(vendor => (
                                    <Option 
                                        key={vendor.id} 
                                        value={vendor.id}
                                        label={vendor.name}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FiUser style={{ color: '#1890ff' }} />
                                            <span>{vendor.name}</span>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="bill_date"
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
                                <Option value="unpaid">UnPaid</Option>
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
                                        if (!checked) {
                                            const items = form.getFieldValue('items') || [];
                                            const updatedItems = items.map(item => ({
                                                ...item,
                                                tax: 0,
                                                taxId: null,
                                                taxAmount: 0
                                            }));
                                            form.setFieldsValue({ items: updatedItems });
                                            calculateTotals(updatedItems);
                                        }
                                    }}
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
                                onChange={handleProductChange}
                            >
                                {productsData?.data?.map(product => (
                                    <Option
                                        key={product.id}
                                        value={product.id}
                                        label={product.name}
                                        selling_price={product.selling_price}
                                        hsn_sac={product.hsn_sac}
                                        profilePic={product.image}
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
                                                    {product.price}
                                                </span> */}
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
                                            onClick={() => {
                                                const items = form.getFieldValue('items') || [];
                                                add({
                                                    quantity: 1
                                                });
                                            }}
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
                            Update Bill
                        </Button>
                    </div>
                </Form>
            </Modal>

            {vendorModal}
        </>
    );
};

export default EditBilling;