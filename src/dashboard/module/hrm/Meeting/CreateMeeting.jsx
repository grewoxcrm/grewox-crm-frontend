import React, { useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Select,
    Row,
    Col,
    DatePicker,
    TimePicker,
    message,
} from 'antd';
import {
    FiX,
    FiUsers,
    FiMapPin,
    FiCalendar,
    FiClock,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useGetEmployeesQuery } from '../Employee/services/employeeApi';
import { useGetAllDepartmentsQuery } from '../Department/services/departmentApi';
import { useGetAllSubclientsQuery } from '../../user-management/subclient/services/subClientApi';
import { useCreateMeetingMutation } from './services/meetingApi';
import { useSelector } from 'react-redux';

dayjs.extend(customParseFormat);

const { Text } = Typography;
const { TextArea } = Input;

const CreateMeeting = ({
    open,
    onCancel,
    onSubmit,
    isEditing,
    initialValues,
    loading
}) => {
    const [form] = Form.useForm();
    
    const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();
    
    const { data: subClientsData, isLoading: subClientsLoading } = useGetAllSubclientsQuery();
    const { data: departmentsData, isLoading: departmentsLoading } = useGetAllDepartmentsQuery();
    const { data: employeesData, isLoading: employeesLoading } = useGetEmployeesQuery();

    // Add this to get client_id from Redux state
    const auth = useSelector((state) => state.auth);
    // const clientId = localStorage.getItem('client_id') || auth?.user?.client_id;

    // Transform subclients data
    const subclients = React.useMemo(() => {
        if (!subClientsData) return [];
        if (Array.isArray(subClientsData)) return subClientsData;
        if (Array.isArray(subClientsData.data)) return subClientsData.data;
        return [];
    }, [subClientsData]);

    // Transform employees data for better logging
    const employeeOptions = React.useMemo(() => {
        if (!employeesData?.data) return [];
        return employeesData.data.map(emp => ({
            value: emp.id,
            label: `${emp.firstName} ${emp.lastName || ''}`
        }));
    }, [employeesData]);

    // Define meeting types
    const meetingTypes = [
        { value: 'team_meeting', label: 'Team Meeting' },
        { value: 'client_meeting', label: 'Client Meeting' },
        { value: 'board_meeting', label: 'Board Meeting' },
        { value: 'project_meeting', label: 'Project Meeting' },
    ];

    // Define locations
    const locations = [
        { value: 'conference_room_1', label: 'Conference Room 1' },
        { value: 'conference_room_2', label: 'Conference Room 2' },
        { value: 'meeting_room_1', label: 'Meeting Room 1' },
        { value: 'virtual', label: 'Virtual Meeting' },
    ];

    useEffect(() => {
        if (initialValues) {
            

            // Convert employee data to array if it's not already
            let employeeIds = [];
            if (initialValues.employee) {
                if (Array.isArray(initialValues.employee)) {
                    employeeIds = initialValues.employee;
                } else if (typeof initialValues.employee === 'string') {
                    // If it's a comma-separated string
                    employeeIds = initialValues.employee.split(',').map(id => id.trim());
                } else {
                    employeeIds = [initialValues.employee];
                }
            }

            const formattedValues = {
                ...initialValues,
                date: initialValues.date ? dayjs(initialValues.date) : null,
                startTime: initialValues.startTime ? dayjs(initialValues.startTime, 'HH:mm') : null,
                endTime: initialValues.endTime ? dayjs(initialValues.endTime, 'HH:mm') : null,
                employees: employeeIds, // Set the formatted employee IDs
            };

          
            form.setFieldsValue(formattedValues);
        } else {
            form.resetFields();
        }
    }, [initialValues, form]);

    const handleSubmit = async (values) => {
        try {
            const formattedValues = {
                title: values.title,
                department: values.department,
                employee: values.employees || [],
                description: values.notes,
                date: values.date && dayjs(values.date).format('YYYY-MM-DD'),
                startTime: values.startTime && dayjs(values.startTime).format('HH:mm'),
                endTime: values.endTime && dayjs(values.endTime).format('HH:mm'),
                meetingLink: values.meetingLink || null,
                status: values.status || 'scheduled',
                client: values.client,
               
            };

            console.log('Submitting meeting with data:', formattedValues); // For debugging

            if (isEditing) {
                await onSubmit(formattedValues);
            } else {
                const response = await createMeeting(formattedValues).unwrap();
                if (response.success) {
                    message.success('Meeting scheduled successfully');
                    form.resetFields();
                    onCancel();
                } else {
                    throw new Error(response.message || 'Failed to create meeting');
                }
            }
        } catch (error) {
            console.error('Meeting creation error:', error);
            message.error(error?.data?.message || 'Failed to schedule meeting');
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={720}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="meeting-form-modal"
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
                        <FiUsers style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            {isEditing ? 'Edit Meeting' : 'Schedule New Meeting'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update meeting information'
                                : 'Fill in the information to schedule meeting'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialValues}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="title"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Meeting Title
                                </span>
                            }
                            rules={[{ required: true, message: 'Please enter meeting title' }]}
                        >
                            <Input
                                prefix={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                                placeholder="Enter meeting title"
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
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="department"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Department
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select department' }]}
                        >
                            <Select
                                placeholder="Select department"
                                size="large"
                                listHeight={100}
                                dropdownStyle={{
                                    Height: '100px',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollBehavior: 'smooth'
                                }}
                                loading={departmentsLoading}
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                                options={departmentsData?.map(dept => ({
                                    value: dept.id,
                                    label: dept.department_name
                                })) || []}
                                showSearch
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="employees"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Employees
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select employees' }]}
                        >
                            <Select
                                mode="multiple"
                                listHeight={100}
                                dropdownStyle={{
                                    Height: '100px',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollBehavior: 'smooth'
                                }}
                                placeholder="Select employees"
                                size="large"
                                loading={employeesLoading}
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                                options={employeeOptions}
                                showSearch
                                filterOption={(input, option) =>
                                    option?.label?.toLowerCase().includes(input.toLowerCase())
                                }
                                maxTagCount={3}
                                maxTagTextLength={10}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="client"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Client
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select client' }]}
                        >
                            <Select
                                placeholder="Select client"
                                listHeight={100}
                                dropdownStyle={{
                                    Height: '100px',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollBehavior: 'smooth'
                                }}
                                size="large"
                                loading={subClientsLoading}
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                                options={subclients.map(client => ({
                                    value: client.id,
                                    label: client.username
                                })) || []}
                                   
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="date"
                            label="Meeting Date"
                            rules={[{ required: true, message: 'Please select date' }]}
                        >
                            <DatePicker 
                                format="DD-MM-YYYY"
                                style={{ width: '100%' , height: '48px'}}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="startTime"
                            label="Start Time"
                            rules={[{ required: true, message: 'Please select start time' }]}
                        >
                            <TimePicker 
                                format="HH:mm"
                                style={{ width: '100%' , height: '48px'}}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="endTime"
                            label="End Time"
                            rules={[{ required: true, message: 'Please select end time' }]}
                        >
                            <TimePicker 
                                format="HH:mm"
                                style={{ width: '100%' , height: '48px'}}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="status"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Status
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select
                                placeholder="Select status"
                                size="large"
                                options={[
                                    { value: 'scheduled', label: 'Scheduled' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'cancelled', label: 'Cancelled' }
                                ]}
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="meetingLink"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Meeting Link
                                </span>
                            }
                        >
                            <Input
                                placeholder="Enter meeting link"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="notes"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Meeting Description
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter meeting description' }]}
                >
                    <TextArea
                        placeholder="Enter meeting description"
                        rows={4}
                        style={{
                            borderRadius: '10px',
                            padding: '12px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                            transition: 'all 0.3s ease',
                            resize: 'none',
                        }}
                    />
                </Form.Item>

                <Divider style={{ margin: '24px 0' }} />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                    }}
                >
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
                        loading={isCreating}
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isEditing ? 'Update Meeting' : 'Schedule Meeting'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateMeeting;