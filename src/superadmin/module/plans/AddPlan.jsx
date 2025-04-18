import React, { useState } from 'react';
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Switch,
    Button,
    Typography,
    Divider,
    message,
    Dropdown,
    Menu,
    Space
} from 'antd';
import {
    FiUsers,
    FiClock,
    FiHardDrive,
    FiX,
    FiBox,
    FiTag
} from 'react-icons/fi';
import { useCreatePlanMutation } from './services/planApi';
import { useGetAllCurrenciesQuery } from '../settings/services/settingsApi';

const { Text } = Typography;
const { Option } = Select;

const AddPlan = ({ visible, onCancel, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [createPlan, { isLoading }] = useCreatePlanMutation();
    const [durationType, setDurationType] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [storageUnit, setStorageUnit] = useState('MB');

    const { data: currencies, isLoading: currenciesLoading } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    // Find INR currency ID for default value
    const getDefaultCurrencyId = () => {
        if (currencies) {
            const inrCurrency = currencies.find(c => c.currencyCode === 'INR');
            return inrCurrency?.id;
        }
        return undefined;
    };

    // Set default values when currencies are loaded
    React.useEffect(() => {
        if (currencies) {
            const defaultCurrencyId = getDefaultCurrencyId();
            if (defaultCurrencyId) {
                form.setFieldValue('currency', defaultCurrencyId);
            }
        }
    }, [currencies, form]);

    const handleSubmit = async (values) => {
        try {
            let formattedDuration = 'Lifetime';
            if (durationType === 'Monthly' && selectedMonth) {
                formattedDuration = `${selectedMonth} Month${selectedMonth > 1 ? 's' : ''}`;
            } else if (durationType === 'Yearly' && selectedYear) {
                formattedDuration = `${selectedYear} Year${selectedYear > 1 ? 's' : ''}`;
            }

            const formattedValues = {
                ...values,
                duration: formattedDuration,
                trial_period: values.trial_period.toString(),
                features: {},
                status: values.status ? 'active' : 'inactive',
                max_users: values.max_users.toString(),
                max_clients: values.max_clients.toString(),
                max_customers: values.max_customers.toString(),
                max_vendors: values.max_vendors.toString(),
                storage_limit: form.getFieldValue('_storage_limit_mb') || values.storage_limit.toString(),
                price: values.price.toString(),
                currency: values.currency
            };

            await createPlan(formattedValues).unwrap();
            message.success('Plan created successfully');
            form.resetFields();
            onCancel();
        } catch (error) {
            message.error('Failed to create plan: ' + (error.message || 'Unknown error'));
        }
    };

    const handleMenuClick = (e) => {
        if (e.key === 'Lifetime') {
            setDurationType('Lifetime');
            setSelectedMonth(null);
            setSelectedYear(null);
            form.setFieldValue('duration', 'Lifetime');
        }
    };

    const handleStorageUnitChange = (value) => {
        const currentStorage = form.getFieldValue('storage_limit');
        if (currentStorage) {
            if (value === 'GB' && storageUnit === 'MB') {
                form.setFieldValue('storage_limit', (currentStorage / 1024).toFixed(2));
            } else if (value === 'MB' && storageUnit === 'GB') {
                form.setFieldValue('storage_limit', (currentStorage * 1024).toFixed(0));
            }
        }
        setStorageUnit(value);
    };

    const handleStorageChange = (value) => {
        if (value) {
            // Convert to MB for storage
            const storageInMB = storageUnit === 'GB' ? value * 1024 : value;
            form.setFieldValue('_storage_limit_mb', storageInMB.toString());
        }
    };

    const monthlyMenu = (
        <Menu className="duration-submenu">
            <div className="duration-input-container">
                <InputNumber
                    min={1}
                    max={12}
                    placeholder="Enter number of months"
                    onChange={(value) => {
                        if (value && value > 0 && value <= 12) {
                            setDurationType('Monthly');
                            setSelectedMonth(value);
                            setSelectedYear(null);
                            form.setFieldValue('duration', `${value} Month${value > 1 ? 's' : ''}`);
                        }
                    }}
                    onClick={e => e.stopPropagation()}
                    className="duration-input"
                />
                <div className="duration-hint">For durations longer than 11 months, please use yearly option</div>
            </div>
        </Menu>
    );

    const yearlyMenu = (
        <Menu className="duration-submenu">
            <div className="duration-input-container">
                <InputNumber
                    min={1}
                    max={10}
                    placeholder="Enter number of years"
                    onChange={(value) => {
                        if (value && value > 0 && value <= 12) {
                            setDurationType('Yearly');
                            setSelectedYear(value);
                            setSelectedMonth(null);
                            form.setFieldValue('duration', `${value} Year${value > 1 ? 's' : ''}`);
                        }
                    }}
                    onClick={e => e.stopPropagation()}
                    className="duration-input"
                />
                <div className="duration-type-label">Years</div>
            </div>
        </Menu>
    );

    const mainMenu = (
        <Menu className="duration-menu">
            <Menu.Item
                key="Lifetime"
                className="duration-option lifetime"
                onClick={() => {
                    setDurationType('Lifetime');
                    setSelectedMonth(null);
                    setSelectedYear(null);
                    form.setFieldValue('duration', 'Lifetime');
                }}
            >
                <div className="duration-option-content">
                    <span className="option-label">Lifetime</span>
                    <span className="option-description">Never expires</span>
                </div>
            </Menu.Item>
            <Menu.SubMenu
                key="Monthly"
                title={
                    <div className="duration-option-content">
                        <span className="option-label">Monthly</span>
                        <span className="option-description">1-12 months duration</span>
                    </div>
                }
                popupClassName="duration-popup"
            >
                {monthlyMenu}
            </Menu.SubMenu>
            <Menu.SubMenu
                key="Yearly"
                title={
                    <div className="duration-option-content">
                        <span className="option-label">Yearly</span>
                        <span className="option-description">1-12 years duration</span>
                    </div>
                }
                popupClassName="duration-popup"
            >
                {yearlyMenu}
            </Menu.SubMenu>
        </Menu>
    );

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={720}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                '--antd-arrow-background-color': '#ffffff'
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden'
                }
            }}
        >
            <div className="modal-header" style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                padding: '24px',
                color: '#ffffff',
                position: 'relative'
            }}>
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
                        transition: 'all 0.3s ease'
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
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <FiBox style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            {isEditing ? 'Edit Plan' : 'Create New Plan'}
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            {isEditing ? 'Update plan information' : 'Fill in the information to create plan'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    status: true,
                    duration: 'Per Month',
                    trial_period: '7',
                    max_users: '5',
                    max_clients: '10',
                    max_customers: '50',
                    max_vendors: '20',
                    storage_limit: '10',
                    ...initialValues
                }}
                requiredMark={false}
                style={{
                    padding: '24px'
                }}
            >
                <Form.Item
                    name="name"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Plan Name
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter plan name' }]}
                >
                    <Input
                        prefix={<FiTag style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter plan name"
                        size="large"
                        style={{
                            borderRadius: '10px',
                            padding: '8px 16px',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                            transition: 'all 0.3s ease',
                        }}
                    />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="price_group"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Price
                            </span>
                        }
                        style={{ flex: 1 }}
                    >
                        <Input.Group compact className="price-input-group" style={{
                            display: 'flex',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            overflow: 'hidden',
                            marginBottom: 0
                        }}>
                            <Form.Item
                                name="currency"
                                noStyle
                                rules={[{ required: true }]}
                            >
                                <Select
                                    size="large"
                                    style={{
                                        width: '100px',
                                        height: '48px'
                                    }}
                                    loading={currenciesLoading}
                                    className="currency-select"
                                    defaultValue={getDefaultCurrencyId()}
                                    dropdownStyle={{
                                        padding: '8px',
                                        borderRadius: '10px',
                                    }}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => {
                                        const currency = currencies?.find(c => c.id === option.value);
                                        return currency?.currencyCode.toLowerCase().includes(input.toLowerCase()) ||
                                            currency?.currencyIcon.toLowerCase().includes(input.toLowerCase());
                                    }}
                                >
                                    {currencies?.map(currency => (
                                        <Option key={currency.id} value={currency.id}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>{currency.currencyIcon}</span>
                                                <span>{currency.currencyCode}</span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="price"
                                noStyle
                                rules={[{ required: true, message: 'Please enter price' }]}
                            >
                                <InputNumber
                                    placeholder="Enter price"
                                    size="large"
                                    style={{
                                        flex: 1,
                                        width: '100%',
                                        border: 'none',
                                        borderLeft: '1px solid #e6e8eb',
                                        borderRadius: 0,
                                        height: '48px',
                                        padding: '0 16px',
                                    }}
                                    min={0}
                                    precision={2}
                                    className="price-input"
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>

                    <Form.Item
                        name="duration"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Duration
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Dropdown
                            overlay={mainMenu}
                            trigger={['click']}
                            overlayClassName="duration-dropdown"
                        >
                            <Button className="duration-select-button">
                                <div className="duration-display">
                                    <span className="selected-duration">
                                        {durationType === 'Monthly' && selectedMonth
                                            ? `${selectedMonth} Month${selectedMonth > 1 ? 's' : ''}`
                                            : durationType === 'Yearly' && selectedYear
                                                ? `${selectedYear} Year${selectedYear > 1 ? 's' : ''}`
                                                : durationType === 'Lifetime'
                                                    ? 'Lifetime'
                                                    : 'Select Duration'}
                                    </span>
                                    <span className="duration-arrow">▼</span>
                                </div>
                            </Button>
                        </Dropdown>
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="trial_period"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Trial Period (Days)
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            prefix={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            min={0}
                        />
                    </Form.Item>

                    <Form.Item
                        name="storage_limit"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Storage Limit
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Input.Group compact className="storage-input-group" style={{
                            display: 'flex',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            overflow: 'hidden',
                            marginBottom: 0
                        }}>
                            <InputNumber
                                prefix={<FiHardDrive style={{ color: '#1890ff', fontSize: '16px' }} />}
                                size="large"
                                style={{
                                    flex: 1,
                                    width: 'calc(100% - 80px)',
                                    border: 'none',
                                    borderRadius: 0,
                                    height: '48px',
                                }}
                                min={0.01}
                                step={storageUnit === 'GB' ? 0.01 : 1}
                                onChange={handleStorageChange}
                                parser={value => value.replace(/[^0-9.]/g, '')}
                                formatter={value => value ? `${value}` : ''}
                                value={form.getFieldValue('storage_limit')}
                                className="storage-input"
                            />
                            <Select
                                value={storageUnit}
                                onChange={handleStorageUnitChange}
                                style={{
                                    width: '120px',
                                    height: '48px'
                                }}
                                className="storage-unit-select"
                                dropdownStyle={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                }}
                            >
                                <Option value="MB">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FiHardDrive style={{ fontSize: '14px' }} />
                                        <span>MB</span>
                                    </div>
                                </Option>
                                <Option value="GB">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FiHardDrive style={{ fontSize: '14px' }} />
                                        <span>GB</span>
                                    </div>
                                </Option>
                            </Select>
                        </Input.Group>
                    </Form.Item>
                </div>

                <Form.Item name="_storage_limit_mb" hidden>
                    <Input />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="max_users"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Max Users
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            prefix={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            min={1}
                        />
                    </Form.Item>

                    <Form.Item
                        name="max_clients"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Max Clients
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            prefix={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            min={1}
                        />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="max_vendors"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Max Vendors
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            prefix={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            min={1}
                        />
                    </Form.Item>

                    <Form.Item
                        name="max_customers"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Max Customers
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            prefix={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            min={1}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="status"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Status
                        </span>
                    }
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                        style={{
                            minWidth: '80px'
                        }}
                    />
                </Form.Item>

                <Divider style={{ margin: '24px 0' }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <Button
                        size="large"
                        onClick={onCancel}
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
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
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
                        Create Plan
                    </Button>
                </div>
            </Form>

            <style jsx>{`
                .currency-select .ant-select-selector {
                    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
                    border: none !important;
                    color: white !important;
                    height: 48px !important;
                    line-height: 46px !important;
                    padding: 0 12px !important;
                    display: flex;
                    align-items: center;
                    box-shadow: none !important;
                }

                .currency-select .ant-select-selection-item {
                    color: white !important;
                    font-weight: 500 !important;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    height: 46px !important;
                    line-height: 46px !important;
                    font-size: 14px;
                }

                .currency-select .ant-select-arrow {
                    color: white !important;
                }

                .currency-select .ant-select-clear {
                    background: transparent !important;
                    color: white !important;
                    opacity: 0.8;
                }

                .currency-select .ant-select-clear:hover {
                    opacity: 1;
                }

                .currency-select.ant-select-status-error:not(.ant-select-disabled):not(.ant-select-customize-input) .ant-select-selector {
                    border-color: rgba(255, 255, 255, 0.3) !important;
                }

                .currency-select.ant-select-status-error .ant-select-arrow {
                    color: white !important;
                }

                .currency-select .ant-select-selection-search-input {
                    color: white !important;
                }

                .currency-select .ant-select-selection-placeholder {
                    color: rgba(255, 255, 255, 0.8) !important;
                }

                .currency-select .ant-select-dropdown {
                    padding: 8px !important;
                }

                .currency-select .ant-select-item {
                    padding: 8px 12px !important;
                    border-radius: 6px !important;
                }

                .currency-select .ant-select-item-option-content {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                }

                .currency-select .ant-select-item-option-selected {
                    background-color: #e6f4ff !important;
                    font-weight: 500 !important;
                }

                .price-input-group {
                    margin-bottom: 0 !important;
                    display: flex !important;
                    width: 100% !important;

                    .ant-select-selector,
                    .ant-input-number {
                        height: 46px !important;
                        line-height: 46px !important;
                    }

                    .ant-select-selector {
                        border: none !important;
                        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
                        color: white !important;
                        padding: 0 16px !important;
                        display: flex;
                        align-items: center;
                        box-shadow: none !important;
                        height: 46px !important;
                    }

                    .ant-select-selection-item {
                        color: white !important;
                        font-weight: 500 !important;
                        display: flex;
                        align-items: center;
                        height: 46px !important;
                        line-height: 46px !important;
                    }

                    .price-input {
                        flex: 1 !important;
                        width: calc(100% - 100px) !important;
                    }

                    .ant-input-number {
                        background-color: transparent;
                        height: 46px !important;
                        
                        &:hover, &:focus {
                            border-color: transparent !important;
                            box-shadow: none !important;
                        }

                        .ant-input-number-input-wrap {
                            height: 46px !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            
                            input {
                                height: 46px !important;
                                font-size: 14px;
                                padding: 0 16px;
                                line-height: 46px !important;
                            }
                        }

                        .ant-input-number-handler-wrap {
                            display: none;
                        }
                    }

                    &:hover {
                        border-color: #1890ff;
                        
                        .ant-select-selector {
                            background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%) !important;
                        }
                    }

                    &:focus-within {
                        border-color: #1890ff;
                        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
                    }
                }

                .duration-select .ant-select-selector {
                    height: 48px !important;
                    padding: 0 16px !important;
                    background-color: #f8fafc !important;
                    border: 1px solid #e6e8eb !important;
                    border-radius: 10px !important;
                    display: flex;
                    align-items: center;
                }

                .duration-select .ant-select-selection-item {
                    line-height: 48px !important;
                    font-size: 14px;
                }

                .duration-select:hover .ant-select-selector {
                    border-color: #1890ff !important;
                }

                .duration-select.ant-select-focused .ant-select-selector {
                    border-color: #1890ff !important;
                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
                }

                .duration-submenu {
                    padding: 16px;
                    min-width: 240px;

                    .duration-input-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .duration-input {
                        margin-bottom: 12px;
                        width: 100%;
                    }

                    .duration-type-label {
                        font-size: 14px;
                        font-weight: 500;
                        color: rgba(0, 0, 0, 0.85);
                        margin-bottom: 8px;
                    }

                    .duration-hint {
                        font-size: 12px;
                        color: rgba(0, 0, 0, 0.65);
                    }
                }

                .storage-input-group {
                    margin-bottom: 0 !important;
                    display: flex !important;
                    width: 100% !important;
                }

                .storage-input {
                    flex: 1 !important;
                    background-color: transparent;
                    
                    &:hover, &:focus {
                        border-color: transparent !important;
                        box-shadow: none !important;
                    }

                    .ant-input-number-input-wrap {
                        height: 46px !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        
                        input {
                            height: 46px !important;
                            font-size: 14px;
                            padding: 0 16px;
                            line-height: 46px !important;
                        }
                    }

                    .ant-input-number-handler-wrap {
                        display: none;
                    }
                }

                .storage-unit-select .ant-select-selector {
                    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
                    border: none !important;
                    color: white !important;
                    height: 48px !important;
                    line-height: 46px !important;
                    padding: 0 12px !important;
                    display: flex;
                    align-items: center;
                    box-shadow: none !important;
                }

                .storage-unit-select .ant-select-selection-item {
                    color: white !important;
                    font-weight: 500 !important;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    height: 46px !important;
                    line-height: 46px !important;
                    font-size: 14px;
                }

                .storage-unit-select .ant-select-arrow {
                    color: white !important;
                }

                .storage-unit-select .ant-select-dropdown {
                    padding: 8px !important;
                    border-radius: 10px !important;
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;
                }

                .storage-unit-select .ant-select-item {
                    padding: 8px 12px !important;
                    border-radius: 6px !important;
                    transition: all 0.3s ease !important;
                }

                .storage-unit-select .ant-select-item:hover {
                    background: rgba(24, 144, 255, 0.06) !important;
                }

                .storage-unit-select .ant-select-item-option-selected {
                    background-color: #e6f4ff !important;
                    font-weight: 500 !important;
                }

                .storage-unit-select .ant-select-item-option-content {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                }

                .storage-unit-select:not(.ant-select-disabled):hover .ant-select-selector {
                    background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%) !important;
                }

                .storage-unit-select.ant-select-focused .ant-select-selector {
                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
                }
            `}</style>
        </Modal>
    );
};

export default AddPlan; 