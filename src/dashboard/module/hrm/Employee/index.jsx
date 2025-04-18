import React, { useState, useEffect } from 'react';
import {
    Typography,
    Button,
    Modal,
    message,
    Input,
    Dropdown,
    Menu,
    Row,
    Col,
    Breadcrumb,
    Card,
    Form,
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiSearch,
    FiHome,
    FiChevronDown,
    FiGrid,
    FiList,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useGetEmployeesQuery, useCreateEmployeeMutation, useUpdateEmployeeMutation, useDeleteEmployeeMutation } from './services/employeeApi';
import CreateEmployee from './CreateEmployee';
// import EditEmployee from './EditEmployee';
import EmployeeList from './EmployeeList';
import EmployeeCard from './EmployeeCard';
import './Employee.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import EditEmployee from './EditEmployee';

const { Title, Text } = Typography;

const Employee = () => {
    // States
    const [searchText, setSearchText] = useState('');
    const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const loggedInUser = useSelector(selectCurrentUser);
    const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
    const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
    const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();
    const { data: employeesData, isLoading: isLoadingEmployees, refetch } = useGetEmployeesQuery();

    const [viewMode, setViewMode] = useState('table');



    useEffect(() => {
        if (employeesData?.data) {
            const filteredData = employeesData.data.filter(employee =>
                employee?.created_by === loggedInUser?.username ||
                employee?.client_id === loggedInUser?.id
            );


            const transformedData = filteredData.map(employee => ({
                id: employee.id,
                firstName: employee.firstName || 'N/A',
                lastName: employee.lastName || 'N/A',
                username: employee.username || 'N/A',
                phoneCode: employee.phoneCode || 'N/A',
                address: employee.address || 'N/A',
                state: employee.state || 'N/A',
                city: employee.city || 'N/A',
                country: employee.country || 'N/A',
                zipcode: employee.zipcode || 'N/A',
                website: employee.website || 'N/A',
                gstIn: employee.gstIn || 'N/A',
                gender: employee.gender || 'N/A',
                joiningDate: employee.joiningDate || 'N/A',
                leaveDate: employee.leaveDate || 'N/A',
                salary: employee.salary || 'N/A',
                currency: employee.currency || 'N/A',
                accountholder: employee.accountholder || 'N/A',
                accountnumber: employee.accountnumber || 'N/A',
                bankname: employee.bankname || 'N/A',
                email: employee.email || 'N/A',
                phone: employee.phone || 'N/A',
                branch: employee.branch || 'N/A',
                department: employee.department || 'N/A',
                designation: employee.designation || 'N/A',
                status: employee.status || 'inactive',
                created_at: employee.createdAt || '-',
                updated_at: employee.updatedAt || null,
                created_by: employee.created_by,
                updated_by: employee.updated_by,
                profilePic: employee.profilePic || null,
                salary: employee.salary || null,
                ifsc: employee.ifsc || null,
                banklocation: employee.banklocation || null,
                role_id: employee.role_id
            }));
            setEmployees(transformedData);
            setFilteredEmployees(transformedData);
        }
    }, [employeesData]);


    useEffect(() => {
        const filtered = employees.filter(employee =>
            employee.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            employee.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            employee.department?.toLowerCase().includes(searchText.toLowerCase()) ||
            employee.designation?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredEmployees(filtered);


    }, [employees, searchText]);

    // Handlers
    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Employee',
            content: 'Are you sure you want to delete this employee?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: {
                padding: '20px',
            },
            onOk: async () => {
                try {
                    await deleteEmployee(record.id).unwrap();
                    message.success('Employee deleted successfully');
                    refetch();
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete employee');
                }
            },
        });
    };

    const handleAddEmployee = () => {
        setSelectedEmployee(null);
        setIsCreateFormVisible(true);
    };

    const handleEditEmployee = (employee) => {

        // Format the employee data for the edit form
        const formattedEmployee = {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            username: employee.username,
            email: employee.email,
            // Split phone number into code and number
            phone: employee.phone?.replace(/^\+\d+\s*/, ''),
            phoneCode: employee.phoneCode || employee.phone?.match(/^\+(\d+)/)?.[1] || '91',
            address: employee.address,
            gender: employee.gender,
            joiningDate: employee.joiningDate,
            // IDs for dropdowns
            branch: employee.branch,
            department: employee.department,
            designation: employee.designation,
            // Salary information
            salary: employee.salary,
            currency: employee.currency,
            // Bank details
            accountholder: employee.accountholder,
            accountnumber: employee.accountnumber,
            bankname: employee.bankname,
            ifsc: employee.ifsc,
            banklocation: employee.banklocation,
        };


        setSelectedEmployee(formattedEmployee);
        setIsEditFormVisible(true);


    };


    const handleEditSuccess = () => {
        setIsEditFormVisible(false);
        setSelectedEmployee(null);
        refetch(); // Refresh the employee list
        message.success('Employee updated successfully');
    };

    const handleCreateSubmit = async (formData) => {
        try {
            await createEmployee(formData).unwrap();
            message.success('Employee created successfully');

            setIsCreateFormVisible(false);
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to create employee');
        }
    };

    const handleEditSubmit = async (formData) => {
        try {
            if (!formData?.id) {
                throw new Error('Employee ID is required for update');
            }

            const updateData = {
                id: formData.id,
                data: formData
            };

            await updateEmployee(updateData).unwrap();
            message.success('Employee updated successfully');
            setIsEditFormVisible(false);
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update employee');
        }
    };

    const exportMenu = (
        <Menu>
            <Menu.Item
                key="csv"
                icon={<FiDownload />}
                onClick={() => handleExport('csv')}
            >
                Export as CSV
            </Menu.Item>
            <Menu.Item
                key="excel"
                icon={<FiDownload />}
                onClick={() => handleExport('excel')}
            >
                Export as Excel
            </Menu.Item>
            <Menu.Item
                key="pdf"
                icon={<FiDownload />}
                onClick={() => handleExport('pdf')}
            >
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = filteredEmployees.map(employee => ({
                'Employee Name': employee.name,
                'Email': employee.email,
                'Phone': employee.phone,
                'Department': employee.department,
                'Designation': employee.designation,
                'Status': employee.status,
                'Created Date': moment(employee.created_at).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'employees_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'employees_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'employees_export');
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
            Object.keys(data[0]).join(','),
            ...data.map(item => Object.values(item).map(value =>
                `"${value?.toString().replace(/"/g, '""')}"`
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const exportToExcel = (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Employees');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 }
        });
        doc.save(`${filename}.pdf`);
    };

    const handleCreateSuccess = () => {
        refetch();
    };

    return (
        <div className="employee-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Employee</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Employees</Title>
                    <Text type="secondary">Manage all employees in the system</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search employees by name, email, department, or designation"
                                allowClear
                                onChange={(e) => handleSearch(e.target.value)}
                                value={searchText}
                                className="search-input"
                            />
                            <div className="action-buttons">
                                <Button.Group className="view-toggle">
                                    <Button
                                        type={viewMode === 'table' ? 'primary' : 'default'}
                                        icon={<FiList size={16} />}
                                        onClick={() => setViewMode('table')}
                                    />
                                    <Button
                                        type={viewMode === 'card' ? 'primary' : 'default'}
                                        icon={<FiGrid size={16} />}
                                        onClick={() => setViewMode('card')}
                                    />
                                </Button.Group>
                                <Dropdown overlay={exportMenu} trigger={["click"]}>
                                    <Button className="export-button">
                                        <FiDownload size={16} />
                                        <span>Export</span>
                                        <FiChevronDown size={14} />
                                    </Button>
                                </Dropdown>
                                <Button
                                    type="primary"
                                    icon={<FiPlus size={16} />}
                                    onClick={handleAddEmployee}
                                    className="add-button"
                                >
                                    Add Employee
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="employee-card">
                {viewMode === 'table' ? (
                    <EmployeeList
                        employees={filteredEmployees}
                        loading={isLoadingEmployees}
                        onEdit={handleEditEmployee}
                        onDelete={handleDelete}
                    />
                ) : (
                    <div className="employee-grid">
                        {filteredEmployees.map(employee => (
                            <EmployeeCard
                                key={employee.id}
                                employee={employee}
                                onEdit={handleEditEmployee}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </Card>

            <CreateEmployee
                visible={isCreateFormVisible}
                onCancel={() => setIsCreateFormVisible(false)}
                onSubmit={handleCreateSubmit}
                loading={isCreating}
                onSuccess={handleCreateSuccess}
            />
            <EditEmployee
                onEdit={handleEditEmployee}
                visible={isEditFormVisible}
                onCancel={() => setIsEditFormVisible(false)}
                initialValues={selectedEmployee}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
};

export default Employee;
