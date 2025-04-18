import React, { useState } from 'react';
import { Modal, Form, Input, Button, Select, message, Typography, Divider, Upload, InputNumber, DatePicker } from 'antd';
import { 
    FiX, FiUserPlus, FiUser, FiMail, FiPhone, FiMapPin, FiGrid, FiAward, FiDollarSign,
    FiLock, FiPlus
} from 'react-icons/fi';
import { useCreateEmployeeMutation, useVerifySignupMutation, useResendSignupOtpMutation } from './services/employeeApi';
import { useSelector } from 'react-redux';
import CreateBranch from '../Branch/CreateBranch';
import { useGetAllBranchesQuery } from '../Branch/services/branchApi';
import { useGetAllDepartmentsQuery } from '../Department/services/departmentApi';
import { useGetAllDesignationsQuery } from '../Designation/services/designationApi';
import CreateDepartment from '../Department/CreateDepartment';
import CreateDesignation from '../Designation/CreateDesignation';
import { useGetAllCountriesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { Text } = Typography;
const { Option } = Select;

const CreateEmployee = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [createEmployee, { isLoading }] = useCreateEmployeeMutation();
    const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
    const [employeeFormData, setEmployeeFormData] = useState(null);
    const [otpLoading, setOtpLoading] = useState(false);
    const [sessionToken, setSessionToken] = useState(null);
    const [verifySignup] = useVerifySignupMutation();
    const [resendSignupOtp] = useResendSignupOtpMutation();
    const [isCreateBranchModalOpen, setIsCreateBranchModalOpen] = useState(false);
    const [isCreateDepartmentModalOpen, setIsCreateDepartmentModalOpen] = useState(false);
    const [isCreateDesignationModalOpen, setIsCreateDesignationModalOpen] = useState(false);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [filteredDesignations, setFilteredDesignations] = useState([]);
    const { data: countries, isLoading: countriesLoading } = useGetAllCountriesQuery({
        page: 1,
        limit: 100
    });
    const { data: currencies, isLoading: currenciesLoading } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    const { data: branchesData } = useGetAllBranchesQuery();
    const { data: departmentsData } = useGetAllDepartmentsQuery();
    const { data: designationsData } = useGetAllDesignationsQuery();

    // Add this useEffect to set default currency when form is initialized
    React.useEffect(() => {
        form.setFieldsValue({
            currency: '₹'
        });
    }, [form]);

    // Transform branch data
    const branches = React.useMemo(() => {
        if (!branchesData) return [];
        if (Array.isArray(branchesData)) return branchesData;
        if (Array.isArray(branchesData.data)) return branchesData.data;
        return [];
    }, [branchesData]);

    // Transform department data
    const departments = React.useMemo(() => {
        if (!departmentsData) return [];
        if (Array.isArray(departmentsData)) return departmentsData;
        if (Array.isArray(departmentsData)) return departmentsData;
        return [];
    }, [departmentsData]);


    // Transform designation data
    const designations = React.useMemo(() => {
        if (!designationsData) return [];
        if (Array.isArray(designationsData)) return designationsData;
        if (Array.isArray(designationsData)) return designationsData;
        return [];
        
    }, [designationsData]);

    const handleCreateBranchSuccess = async (newBranch) => {
        setIsCreateBranchModalOpen(false);
        message.success('Branch created successfully');
        if (newBranch?.id) {
            form.setFieldValue('branch', newBranch.id);
        }
    };

    const handleCreateDepartmentSuccess = async (newDepartment) => {
        try {
            setIsCreateDepartmentModalOpen(false);
            message.success('Department created successfully');
            
            // Add new department to filtered departments if it matches current branch
            const currentBranchId = form.getFieldValue('branch');
            if (currentBranchId === newDepartment.branch) {
                setFilteredDepartments(prev => [...prev, {
                    id: newDepartment.id,
                    department_name: newDepartment.department_name,
                    branch: newDepartment.branch
                }]);
            }

            // Set the newly created department as selected
            if (newDepartment?.id) {
                form.setFieldValue('department', newDepartment.id);
            }
        } catch (error) {
            console.error('Error handling new department:', error);
        }
    };

    const handleCreateDesignationSuccess = async (newDesignation) => {
        try {
            setIsCreateDesignationModalOpen(false);
            message.success('Designation created successfully');
            
            // Add new department to filtered departments if it matches current branch
            const currentBranchId = form.getFieldValue('branch');
            if (currentBranchId === newDesignation.branch) {
                setFilteredDesignations(prev => [...prev, {
                    id: newDesignation.id,
                    designation_name: newDesignation.designation_name,
                    branch: newDesignation.branch
                }]);
            }

            // Set the newly created department as selected
            if (newDesignation?.id) {
                form.setFieldValue('designation', newDesignation.id);
            }
        } catch (error) {
            tujconsole.error('Error handling new designation:', error);
        }
    };

    const dropdownRender = (menu) => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <div onClick={e => e.stopPropagation()}>
                <Button
                    type="link"
                    icon={<FiPlus style={{ fontSize: '16px' }} />}
                    onClick={() => setIsCreateBranchModalOpen(true)}
                    style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        color: '#1890ff',
                        fontWeight: 500,
                        gap: '8px'
                    }}
                >
                    Add New Branch
                </Button>
            </div>
        </>
    );

    const departmentDropdownRender = (menu) => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <div onClick={e => e.stopPropagation()}>
                <Button
                    type="link"
                    icon={<FiPlus style={{ fontSize: '16px' }} />}
                    onClick={() => setIsCreateDepartmentModalOpen(true)}
                    style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        color: '#1890ff',
                        fontWeight: 500,
                        gap: '8px'
                    }}
                >
                    Add New Department
                </Button>
            </div>
        </>
    );

    const designationDropdownRender = (menu) => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <div onClick={e => e.stopPropagation()}>
                <Button
                    type="link"
                    icon={<FiPlus style={{ fontSize: '16px' }} />}
                    onClick={() => setIsCreateDesignationModalOpen(true)}
                    style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        color: '#1890ff',
                        fontWeight: 500,
                        gap: '8px'
                    }}
                >
                    Add New Designation
                </Button>
            </div>
        </>
    );

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const response = await createEmployee(values).unwrap();

            if (response.success) {
                setEmployeeFormData(values);
                setSessionToken(response.data.sessionToken);
                setIsOtpModalVisible(true);
                message.success(response.message || 'Please verify your email to complete registration');
            } else {
                message.error(response.message || 'Failed to create employee');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to create employee');
        }
    };

    const handleOtpSubmit = async () => {
        try {
            setOtpLoading(true);
            const otpValue = await otpForm.validateFields();

            const verifyResponse = await verifySignup({
                otp: otpValue.otp,
                token: sessionToken
            }).unwrap();

            if (verifyResponse.success) {
                message.success('Employee verified successfully');
                setIsOtpModalVisible(false);
                otpForm.resetFields();
                form.resetFields();
                onCancel();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                message.error(verifyResponse.message || 'Failed to verify OTP');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to verify OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            const response = await resendSignupOtp({
                token: sessionToken
            }).unwrap();

            if (response.success) {
                message.success('OTP resent successfully');
            } else {
                message.error(response.message || 'Failed to resend OTP');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to resend OTP');
        }
    };

    const OtpModal = () => (
        <Modal
            title={null}
            open={isOtpModalVisible}
            onCancel={() => {
                setIsOtpModalVisible(false);
                otpForm.resetFields();
            }}
            footer={null}
            width={420}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            styles={{
                body: {
                    padding: 0,
                    overflow: "hidden",
                    borderRadius: "8px",
                },
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    padding: "24px",
                    color: "#ffffff",
                    position: "relative",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
            >
                <Button
                    type="text"
                    onClick={() => {
                        setIsOtpModalVisible(false);
                        otpForm.resetFields();
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
                        backdropFilter: "blur(8px)",
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
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        }}
                    >
                        <FiLock style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: "0",
                                fontSize: "24px",
                                fontWeight: "600",
                                color: "#ffffff",
                                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            Verify OTP
                        </h2>
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            Enter the OTP sent to your email
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ padding: "24px" }}>
                <Form
                    form={otpForm}
                    layout="vertical"
                    onFinish={handleOtpSubmit}
                >
                    <Form.Item
                        name="otp"
                        rules={[
                            { required: true, message: 'Please enter OTP' },
                            { len: 6, message: 'OTP must be 6 digits' },
                            { pattern: /^[0-9]+$/, message: 'OTP must contain only numbers' }
                        ]}
                    >
                        <Input
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            style={{
                                borderRadius: "8px",
                                height: "40px",
                                fontSize: "16px",
                                textAlign: "center",
                                letterSpacing: "8px",
                                fontWeight: "600"
                            }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={otpLoading}
                            block
                            style={{
                                height: "40px",
                                borderRadius: "8px",
                                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                border: "none",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}
                        >
                            Verify & Create Employee
                        </Button>
                    </Form.Item>

                    <div style={{ 
                        textAlign: 'center',
                        marginTop: '16px',
                        fontSize: '14px',
                        color: '#8c8c8c'
                    }}>
                        Didn't receive OTP? <Button
                            type="link"
                            style={{ padding: '0 4px' }}
                            onClick={handleResendOtp}
                        >
                            Resend
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );

    const handleBranchChange = (branchId) => {
        // Reset department and designation selections
        form.setFieldsValue({
            department: undefined,
            designation: undefined
        });

        // Filter departments for selected branch
        if (departments && departments.length > 0) {
            const depts = departments.filter(dept => dept.branch === branchId);
            setFilteredDepartments(depts);
        } else {
            setFilteredDepartments([]);
        }

        // Filter designations for selected branch
        const desigs = Array.isArray(designations) 
            ? designations.filter(desig => desig.branch === branchId)
            : [];
        setFilteredDesignations(desigs);
    };

    // Add useEffect to handle initial data loading and updates
    React.useEffect(() => {
        const currentBranchId = form.getFieldValue('branch');
        if (currentBranchId && departments) {
            const depts = departments.filter(dept => dept.branch === currentBranchId);
            setFilteredDepartments(depts);
        }
    }, [departments, form]);

    // Add useEffect to handle initial data loading and updates
    React.useEffect(() => {
        const currentBranchId = form.getFieldValue('branch');
        if (currentBranchId && designations) {
            const desigs = designations.filter(desig => desig.branch === currentBranchId);
            setFilteredDesignations(desigs);
        }
    }, [designations, form]);

    return (
        <>
        <Modal
            title={null}
                open={visible}
                onCancel={() => {
                    form.resetFields();
                    onCancel();
                }}
            footer={null}
            width={720}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            styles={{
                body: {
                    padding: 0,
                        overflow: "hidden",
                        borderRadius: "8px",
                    },
            }}
        >
            <div
                className="modal-header"
                style={{
                        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        padding: "24px",
                        color: "#ffffff",
                        position: "relative",
                        borderTopLeftRadius: "8px",
                        borderTopRightRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
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
                            backdropFilter: "blur(8px)",
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
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                            }}
                        >
                            <FiUserPlus style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                    margin: "0",
                                    fontSize: "24px",
                                    fontWeight: "600",
                                    color: "#ffffff",
                                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                Create New Employee
                        </h2>
                            <p
                            style={{
                                    margin: "4px 0 0",
                                    fontSize: "14px",
                                    color: "rgba(255, 255, 255, 0.85)",
                                }}
                            >
                                Add a new employee to the system
                            </p>
                    </div>
                </div>
            </div>

                <div style={{ padding: "24px" }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{
                            background: "#ffffff",
                            borderRadius: "8px",
                }}
            >

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '16px',
                    marginBottom: '24px'
                }}>

                    <Form.Item
                        name="firstName"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>First Name</span>}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter first name"
                            style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="lastName"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Last Name</span>}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter last name"
                            style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="username"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Username</span>}
                                rules={[
                                    { required: true, message: 'Please enter username' },
                                    { min: 3, message: 'Username must be at least 3 characters' }
                                ]}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter username"
                            style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Email</span>}
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input
                            prefix={<FiMail style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter email"
                            style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                            }}
                        />
                    </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Password</span>}
                                rules={[
                                    { required: true, message: 'Please enter password' },
                                    { min: 8, message: 'Password must be at least 8 characters' },
                                    {
                                        pattern: /^[a-zA-Z0-9!@#$%^&*]{8,30}$/,
                                        message: 'Password must contain only letters, numbers and special characters'
                                    }
                                ]}
                                extra={<span style={{ color: "#8c8c8c", fontSize: "12px" }}>Password must be at least 8 characters long</span>}
                            >
                                <Input.Password
                                    placeholder="Enter password"
                                    style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                                    }}
                                />
                            </Form.Item>

                           

                            <Form.Item
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Phone Number
                            </span>
                        }
                        required
                        // style={{ gridColumn: '1 / 2' }}
                    >
                        <Input.Group compact className="phone-input-group" style={{
                            display: 'flex',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            overflow: 'hidden'
                        }}>
                            <Form.Item
                                name="phoneCode"
                                noStyle
                                rules={[{ required: true, message: 'Required' }]}
                                initialValue="91"
                            >
                                <Select
                                    size="large"
                                    style={{
                                        width: '80px',
                                        height: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                    }}
                                    loading={countriesLoading}
                                    className="phone-code-select"
                                    dropdownStyle={{
                                        padding: '8px',
                                        borderRadius: '10px',
                                        backgroundColor: 'white',
                                    }}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {countries?.map(country => (
                                        <Option 
                                            key={country.phoneCode} 
                                            value={country.phoneCode}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                color: '#262626',
                                                cursor: 'pointer',
                                            }}>
                                                <span>{country.phoneCode}</span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                    <Form.Item
                        name="phone"
                        noStyle
                        rules={[
                            { required: true, message: 'Please enter phone number' },
                            {
                                validator: (_, value) => {
                                    if (value && !/^\d+$/.test(value)) {
                                        return Promise.reject('Please enter only numbers');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input
                            size="large"
                            style={{
                                flex: 1,
                                border: 'none',
                                borderLeft: '1px solid #e6e8eb',
                                borderRadius: 0,
                                height: '46px',
                                backgroundColor: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            placeholder="Enter phone number"
                        />
                    </Form.Item>
                        </Input.Group>
                    </Form.Item>

                            <Form.Item
                                name="address"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Address</span>}
                            >
                                <Input.TextArea
                                    placeholder="Enter address"
                            style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="gender"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Gender</span>}
                    >
                        <Select
                            placeholder="Select gender"
                                    style={{
                                        width: "100%",
                                        height: "40px",
                                        borderRadius: "8px",
                                    }}
                                    dropdownStyle={{
                                        borderRadius: "8px",
                                        padding: "8px",
                                    }}
                        >
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="joiningDate"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Joining Date</span>}
                        rules={[{ required: true, message: 'Please select joining date' }]}
                    >
                        <DatePicker
                            size="large"
                            format="YYYY-MM-DD"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                padding: '8px 16px',
                                height: '48px',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E6E8EB',
                                transition: 'all 0.3s ease',
                            }}
                            placeholder="Select joining date"
                        />
                    </Form.Item>


                    <Form.Item
                        name="branch"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Branch
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select a branch' }]}
                    >
                        <Select
                        listHeight={100}
                        dropdownStyle={{
                          Height: '100px',
                          overflowY: 'auto',
                          scrollbarWidth: 'thin',
                          scrollBehavior: 'smooth'
                        }}
                            showSearch
                            placeholder="Select a branch"
                            size="large"
                            dropdownRender={dropdownRender}
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                            }}
                            onChange={handleBranchChange}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {branches.map(branch => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.branchName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="department"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Department</span>}
                        rules={[{ required: true, message: 'Please select a department' }]}
                    >
                        <Select
                        listHeight={100}
                        dropdownStyle={{
                          Height: '100px',
                          overflowY: 'auto',
                          scrollbarWidth: 'thin',
                          scrollBehavior: 'smooth'
                        }}
                            showSearch
                            placeholder={form.getFieldValue('branch') ? "Select a department" : "Please select a branch first"}
                            size="large"
                            disabled={!form.getFieldValue('branch')}
                            dropdownRender={departmentDropdownRender}
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                            }}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {filteredDepartments.map(dept => (
                                <Option 
                                    key={dept.id} 
                                    value={dept.id}
                                >
                                    {dept.department_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="designation"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Designation</span>}
                        rules={[{ required: true, message: 'Please select a designation' }]}
                    >
                        <Select
                        listHeight={100}
                        dropdownStyle={{
                          Height: '100px',
                          overflowY: 'auto',
                          scrollbarWidth: 'thin',
                          scrollBehavior: 'smooth'
                        }}
                            showSearch
                            placeholder={form.getFieldValue('branch') ? "Select a designation" : "Please select a branch first"}
                            size="large"
                            disabled={!form.getFieldValue('branch')}
                            dropdownRender={designationDropdownRender}
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                            }}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {filteredDesignations.map(desig => (
                                <Option key={desig.id} value={desig.id}>
                                    {desig.designation_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="salary_group"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Salary
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
                                initialValue="INR"
                            >
                                <Select
                                    size="large"
                                    style={{
                                        width: '100px',
                                        height: '48px'
                                    }}
                                    loading={currenciesLoading}
                                    className="currency-select"
                                    dropdownStyle={{
                                        padding: '8px',
                                        borderRadius: '10px',
                                    }}
                                    showSearch
                                    optionFilterProp="children"
                                    defaultValue="INR"
                                >
                                    {currencies?.map(currency => (
                                        <Option 
                                            key={currency.currencyCode} 
                                            value={currency.currencyCode}
                                            selected={currency.currencyCode === 'INR'}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>{currency.currencyIcon}</span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="salary"
                                noStyle
                                rules={[{ required: true, message: 'Please enter salary' }]}
                            >
                                <Input
                                    placeholder="Enter salary"
                                    size="large"
                                    style={{
                                        flex: 1,
                                        width: '100%',
                                        border: 'none',
                                        borderLeft: '1px solid #e6e8eb',
                                        borderRadius: 0,
                                        height: '48px',
                                    }}
                                    min={0}
                                    precision={2}
                                    className="price-input"
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>

                            <Form.Item
                                name="accountholder"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Account Holder Name</span>}
                            >
                                <Input
                                    placeholder="Enter account holder name"
                                    style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="accountnumber"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Account Number</span>}
                            >
                                <Input
                                    placeholder="Enter account number"
                                    type="number"
                                    style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="bankname"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Bank Name</span>}
                            >
                                <Input
                                    placeholder="Enter bank name"
                            style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                            }}
                        />
                    </Form.Item>
                 
                    <Form.Item
                                name="ifsc"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>IFSC Code</span>}
                            >
                                <Input
                                    placeholder="Enter IFSC code"
                                    style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="banklocation"
                                label={<span style={{ color: "#262626", fontWeight: 500, fontSize: "14px" }}>Bank Location</span>}
                            >
                                <Input
                                    placeholder="Enter bank location"
                                    style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                                    }}
                                />
                    </Form.Item>
                </div>

                <Divider style={{ margin: '24px 0' }} />

                        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <Button
                                    onClick={() => {
                                        form.resetFields();
                                        onCancel();
                                    }}
                    style={{
                                        borderRadius: "8px",
                                        border: "1px solid #d9d9d9",
                                        boxShadow: "none",
                                        height: "40px",
                                        padding: "0 24px",
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "#40a9ff";
                                        e.currentTarget.style.color = "#40a9ff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "#d9d9d9";
                                        e.currentTarget.style.color = "rgba(0, 0, 0, 0.88)";
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                                    loading={isLoading}
                        style={{
                                        borderRadius: "8px",
                                        boxShadow: "none",
                                        height: "40px",
                                        padding: "0 24px",
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                        border: "none",
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = "0.85";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = "1";
                                    }}
                                >
                                    Create Employee
                    </Button>
                </div>
                        </Form.Item>
            </Form>
                </div>
        </Modal>

            <OtpModal />
            <CreateBranch 
                open={isCreateBranchModalOpen}
                onCancel={() => setIsCreateBranchModalOpen(false)}
                onSuccess={handleCreateBranchSuccess}
            />
            <CreateDepartment 
                open={isCreateDepartmentModalOpen}
                onCancel={() => setIsCreateDepartmentModalOpen(false)}
                onSuccess={handleCreateDepartmentSuccess}
            />
            <CreateDesignation 
                open={isCreateDesignationModalOpen}
                onCancel={() => setIsCreateDesignationModalOpen(false)}
                onSuccess={handleCreateDesignationSuccess}
            />
        </>
    );
};

export default CreateEmployee; 