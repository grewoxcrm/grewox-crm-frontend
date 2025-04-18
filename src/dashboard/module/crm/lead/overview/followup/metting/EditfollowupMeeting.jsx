import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Select, Button, Typography, Tag, Avatar, Switch, Radio, Space } from 'antd';
import { FiX, FiCalendar, FiMapPin, FiUsers, FiUser, FiShield, FiBriefcase, FiChevronDown, FiLink } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetUsersQuery } from '../../../../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../../../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../../auth/services/authSlice';
import { message } from 'antd';
import { useUpdateFollowupMeetingMutation, useGetFollowupMeetingByIdQuery } from './services/followupMettingApi';

const { Text } = Typography;
const { Option } = Select;

const EditFollowupMeeting = ({ open, onCancel, onSubmit, meetingId, meetingData }) => {
    // Use the same state variables as CreateFollowupMeeting
    const [form] = Form.useForm();
    const [showParticipantsSection, setShowParticipantsSection] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState('Contacts');
    const [showContactsWithoutEmail, setShowContactsWithoutEmail] = useState(false);
    const [repeatType, setRepeatType] = useState('none');
    const [repeatEndType, setRepeatEndType] = useState('never');
    const [repeatTimes, setRepeatTimes] = useState(1);
    const [showRepeat, setShowRepeat] = useState(false);
    const [customRepeatInterval, setCustomRepeatInterval] = useState(1);
    const [customRepeatDays, setCustomRepeatDays] = useState([]);
    const [customFrequency, setCustomFrequency] = useState('weekly');
    const [repeatEndDate, setRepeatEndDate] = useState(null);
    const [venueType, setVenueType] = useState(null);
    const [showReminder, setShowReminder] = useState(false);
    const [monthlyPattern, setMonthlyPattern] = useState('day');
    const [yearlyPattern, setYearlyPattern] = useState('date');
    const [meetingType, setMeetingType] = useState(null);

    // Add queries and mutations
    const { data: meetingDataFromApi, isLoading: isMeetingLoading } = useGetFollowupMeetingByIdQuery(meetingId);
    const [updateFollowupMeeting] = useUpdateFollowupMeetingMutation();
    const currentUser = useSelector(selectCurrentUser);
    const { data: usersResponse } = useGetUsersQuery();
    const { data: rolesData } = useGetRolesQuery();

    // Use meetingData from props if available, otherwise use data from API
    const meeting = meetingData || (meetingDataFromApi?.data?.find(m => m.id === meetingId));

    // Filter users (same as create component)
    const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;
    const users = usersResponse?.data?.filter(user =>
        user?.created_by === currentUser?.username &&
        user?.role_id !== subclientRoleId
    ) || [];

    // Add useEffect to set initial form values when meeting data is loaded
    useEffect(() => {
        if (meeting) {

            // Parse assigned_to (participants)
            let assignedTo = { assigned_to: [] };
            if (meeting.assigned_to) {
                try {
                    assignedTo = typeof meeting.assigned_to === 'string' ? 
                        JSON.parse(meeting.assigned_to) : meeting.assigned_to;
                } catch (e) {
                    console.error('Error parsing assigned_to:', e);
                }
            }

            // Parse reminder data
            let reminderData = null;
            if (meeting.reminder) {
                try {
                    reminderData = typeof meeting.reminder === 'string' ? 
                        JSON.parse(meeting.reminder) : meeting.reminder;
                    setShowReminder(true);
                } catch (e) {
                    console.error('Error parsing reminder:', e);
                }
            } else {
                setShowReminder(false);
            }

            // Parse repeat data
            let repeatData = null;
            if (meeting.repeat) {
                try {
                    repeatData = typeof meeting.repeat === 'string' ? 
                        JSON.parse(meeting.repeat) : meeting.repeat;
                    if (repeatData) {
                        setRepeatType(repeatData.repeat_type || 'none');
                        setRepeatEndType(repeatData.repeat_end_type || 'never');
                        setRepeatTimes(repeatData.repeat_times || 1);
                        setCustomRepeatInterval(repeatData.custom_repeat_interval || 1);
                        setCustomRepeatDays(repeatData.custom_repeat_days || []);
                        setCustomFrequency(repeatData.custom_repeat_frequency || 'weekly');
                        setRepeatEndDate(repeatData.repeat_end_date ? dayjs(repeatData.repeat_end_date) : null);
                        setShowRepeat(true);
                    }
                } catch (e) {
                    console.error('Error parsing repeat data:', e);
                }
            } else {
                setShowRepeat(false);
                setRepeatType('none');
            }

            // Set meeting type and venue
            if (meeting.meeting_type) {
                setMeetingType(meeting.meeting_type);
                if (meeting.meeting_type === 'offline') {
                    setVenueType(meeting.venue);
                }
            }

            // Set form values
            const formValues = {
                title: meeting.title || '',
                meeting_type: meeting.meeting_type || undefined,
                venue: meeting.venue || undefined,
                location: meeting.location || undefined,
                meeting_link: meeting.meeting_link || undefined,
                from_date: meeting.from_date ? dayjs(meeting.from_date) : null,
                from_time: meeting.from_time ? dayjs(meeting.from_time, 'HH:mm:ss') : null,
                to_date: meeting.to_date ? dayjs(meeting.to_date) : null,
                to_time: meeting.to_time ? dayjs(meeting.to_time, 'HH:mm:ss') : null,
                host: meeting.host || undefined,
                assigned_to: assignedTo.assigned_to || [],
                participants_reminder: meeting.participants_reminder || undefined,
                meeting_status: meeting.meeting_status || 'scheduled'
            };

            // Add reminder values if exists
            if (reminderData) {
                formValues.reminder_date = reminderData.reminder_date ? dayjs(reminderData.reminder_date) : null;
                formValues.reminder_time = reminderData.reminder_time ? dayjs(reminderData.reminder_time, 'HH:mm:ss') : null;
            }

            // Add repeat values if exists
            if (repeatData) {
                formValues.repeat = repeatData.repeat_type;
            }

            form.setFieldsValue(formValues);
        } else {
            message.error('Failed to load meeting data');
        }
    }, [meeting, form, currentUser]);

    const handleSubmit = async (values) => {
        try {
            // Prepare reminder data
            const reminderData = showReminder ? {
                reminder_date: values.reminder_date?.format('YYYY-MM-DD'),
                reminder_time: values.reminder_time?.format('HH:mm:ss'),
            } : null;

            // Prepare repeat data
            const repeatData = repeatType !== 'none' ? {
                repeat_type: repeatType,
                repeat_end_type: repeatEndType,
                repeat_times: repeatEndType === 'after' ? parseInt(repeatTimes) : (repeatEndType === 'never' ? null : 1),
                repeat_end_date: repeatEndType === 'on' ? repeatEndDate?.format('YYYY-MM-DD') : null,
                custom_repeat_interval: repeatType === 'custom' ? parseInt(customRepeatInterval) : 1,
                custom_repeat_days: repeatType === 'custom' ? customRepeatDays : [],
                custom_repeat_frequency: repeatType === 'custom' ? customFrequency : 'weekly'
            } : null;

            // Format the update payload
            const updateData = {
                title: values.title,
                meeting_type: values.meeting_type,
                venue: values.venue,
                location: values.location,
                meeting_link: values.meeting_link,
                from_date: values.from_date?.format('YYYY-MM-DD'),
                from_time: values.from_time?.format('HH:mm:ss'),
                to_date: values.to_date?.format('YYYY-MM-DD'),
                to_time: values.to_time?.format('HH:mm:ss'),
                host: values.host,
                assigned_to: {
                    assigned_to: Array.isArray(values.assigned_to) ? values.assigned_to : [values.assigned_to]
                },
                reminder: reminderData,
                repeat: repeatData,
                participants_reminder: values.participants_reminder,
                meeting_status: values.meeting_status,
                updated_by: currentUser?.username,
                client_id: meeting?.client_id
            };


            // Make the update API call
            const result = await updateFollowupMeeting({ id: meetingId, data: updateData }).unwrap();

            if (result.success) {
                message.success('Meeting updated successfully');
                onCancel();
                if (onSubmit) onSubmit();
            }
        } catch (error) {
            console.error('Error updating meeting:', error);
            message.error(error?.data?.message || 'Failed to update meeting');
        }
    };

    // Copy all the helper functions and styles from CreateFollowupMeeting
    const getRoleStyle = (roleName) => {
        const roleColors = {
            'employee': {
                color: '#D46B08',
                bg: '#FFF7E6',
                border: '#FFD591',
                icon: <FiUser style={{ fontSize: '14px' }} />
            },
            'admin': {
                color: '#096DD9',
                bg: '#E6F7FF',
                border: '#91D5FF',
                icon: <FiShield style={{ fontSize: '14px' }} />
            },
            'manager': {
                color: '#08979C',
                bg: '#E6FFFB',
                border: '#87E8DE',
                icon: <FiBriefcase style={{ fontSize: '14px' }} />
            },
            'default': {
                color: '#531CAD',
                bg: '#F9F0FF',
                border: '#D3ADF7',
                icon: <FiUser style={{ fontSize: '14px' }} />
            }
        };
        return roleColors[roleName?.toLowerCase()] || roleColors.default;
    };

    const handleVenueChange = (value) => {
        setVenueType(value);
        // If venue is online, clear the location field
        if (value === 'online') {
            form.setFieldsValue({ location: undefined });
        }
    };

    const handleRepeatToggle = (checked) => {
        setRepeatType(checked ? 'daily' : 'none');
    };

    const handleFrequencyChange = (value) => {
        setFrequency(value);
    };

    const repeatOptions = [
        { value: 'none', label: 'None' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
        { value: 'custom', label: 'Custom...' }
    ];

    const frequencyOptions = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' }
    ];

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Copy all the style constants
    const formItemStyle = {
        fontSize: "14px",
        fontWeight: "500",
        color: "#1f2937"
    };

    const inputStyle = {
        height: "48px",
        borderRadius: "10px",
        padding: "8px 16px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e6e8eb",
        transition: "all 0.3s ease"
    };

    const selectStyle = {
        width: '100%',
        height: '48px'
    };

    // Return the same form structure as CreateFollowupMeeting, but with updated title
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
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <FiUsers style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: "0",
                            fontSize: "24px",
                            fontWeight: "600",
                            color: "#ffffff",
                        }}>
                            Edit Meeting
                        </h2>
                        <Text style={{
                            fontSize: "14px",
                            color: "rgba(255, 255, 255, 0.85)",
                        }}>
                            Update meeting details
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ padding: "24px" }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="title"
                        label="Title"
                    >
                        <Input
                            placeholder="Enter meeting title"
                            size="large"
                            style={{
                                borderRadius: "10px",
                                height: "48px",
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="meeting_type"
                        label="Meeting Type"
                    >
                        <Select
                            placeholder="Select meeting type"
                            size="large"
                            style={{
                                width: "100%",
                                borderRadius: "10px",
                                height: "48px",
                            }}
                            onChange={(value) => {
                                setMeetingType(value);
                                // Reset venue and location when meeting type changes
                                form.setFieldsValue({
                                    venue: undefined,
                                    location: undefined
                                });
                                setVenueType(null);
                            }}
                        >
                            <Option value="online">Online Meeting</Option>
                            <Option value="offline">Offline Meeting</Option>
                        </Select>
                    </Form.Item>
                </div>

                {meetingType && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {meetingType === 'offline' && (
                            <>
                                <Form.Item
                                    name="venue"
                                    label="Meeting Venue"
                                >
                                    <Select
                                        placeholder="Select venue"
                                        size="large"
                                        style={{
                                            width: "100%",
                                            borderRadius: "10px",
                                            height: "48px",
                                        }}
                                        onChange={handleVenueChange}
                                    >
                                        <Option value="client_location">Client Location</Option>
                                        <Option value="office">In-Office</Option>
                                    </Select>
                                </Form.Item>

                                {venueType && (
                                    <Form.Item
                                        name="location"
                                        label="Location"
                                    >
                                        <Input
                                            placeholder="Enter location details"
                                            size="large"
                                            style={{
                                                borderRadius: "10px",
                                                height: "48px",
                                            }}
                                            prefix={<FiMapPin style={{ color: "#1890ff" }} />}
                                        />
                                    </Form.Item>
                                )}
                            </>
                        )}

                        {meetingType === 'online' && (
                            <Form.Item
                                name="meeting_link"
                                label="Meeting Link"
                                style={{ gridColumn: '1 / -1' }}
                            >
                                <Input
                                    placeholder="Enter meeting link (e.g., Zoom, Google Meet)"
                                    size="large"
                                    style={{
                                        borderRadius: "10px",
                                        height: "48px",
                                    }}
                                    prefix={<FiLink style={{ color: "#1890ff" }} />}
                                />
                            </Form.Item>
                        )}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <Form.Item
                        name="from_date"
                        label="From Date"
                    >
                        <DatePicker
                            format="DD/MM/YYYY"
                            style={{
                                width: '100%',
                                borderRadius: "10px",
                                height: "48px",
                            }}
                            suffixIcon={<FiCalendar style={{ color: "#4096ff" }} />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="from_time"
                        label="From Time"
                    >
                        <TimePicker
                            format="hh:mm A"
                            style={{
                                width: '100%',
                                borderRadius: "10px",
                                height: "48px",
                            }}
                            use12Hours
                        />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <Form.Item
                        name="to_date"
                        label="To Date"
                    >
                        <DatePicker
                            format="DD/MM/YYYY"
                            style={{
                                width: '100%',
                                borderRadius: "10px",
                                height: "48px",
                            }}
                            suffixIcon={<FiCalendar style={{ color: "#4096ff" }} />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="to_time"
                        label="To Time"
                    >
                        <TimePicker
                            format="hh:mm A"
                            style={{
                                width: '100%',
                                borderRadius: "10px",
                                height: "48px",
                            }}
                            use12Hours
                        />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    {/* <Form.Item
                        name="host"
                        label={<span style={formItemStyle}>Host</span>}
                        initialValue={currentUser?.username}
                    >
                        <Input
                            value={currentUser?.username}
                            disabled
                            style={{
                                ...inputStyle,
                                backgroundColor: '#f3f4f6'
                            }}
                        />
                    </Form.Item> */}

                    <Form.Item
                        name="assigned_to"
                        label={
                            <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                Participants
                            </span>
                        }
                    >
                        <Select
                            mode="multiple"
                            showSearch
                            size="large"
                            placeholder="Select team members"
                            optionFilterProp="children"
                            style={{
                                width: "100%",
                                borderRadius: "10px",
                                height: "48px"
                            }}
                            listHeight={100}
                            dropdownStyle={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                                scrollbarWidth: 'thin',
                                scrollBehavior: 'smooth'
                            }}
                            filterOption={(input, option) => {
                                const username = option?.username?.toLowerCase() || '';
                                const searchTerm = input.toLowerCase();
                                return username.includes(searchTerm);
                            }}
                            defaultOpen={false}
                        >
                            {users.map((user) => {
                                const userRole = rolesData?.data?.find(role => role.id === user.role_id);
                                const roleStyle = getRoleStyle(userRole?.role_name);

                                return (
                                    <Option
                                        key={user.id}
                                        value={user.id}
                                        username={user.username}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <Avatar
                                                    size="small"
                                                    style={{
                                                        backgroundColor: user.color || '#1890ff',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {user.username?.[0]?.toUpperCase() || '?'}
                                                </Avatar>
                                                <Text strong>{user.username}</Text>
                                            </div>
                                            <Tag style={{
                                                margin: 0,
                                                background: roleStyle.bg,
                                                color: roleStyle.color,
                                                border: `1px solid ${roleStyle.border}`,
                                                fontSize: '12px',
                                                borderRadius: '16px',
                                                padding: '2px 10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                {roleStyle.icon}
                                                {userRole?.role_name || 'User'}
                                            </Tag>
                                        </div>
                                    </Option>
                                );
                            })}
                        </Select>
                    </Form.Item>

                    <Form.Item
          name="meeting_status"
          label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Meeting Status</span>}
          rules={[{ required: true, message: 'Please select meeting status' }]}
          initialValue="scheduled"
        >
          <Select
            placeholder="Select status"
            size="large"
            style={{
              width: "100%",
              borderRadius: "10px",
              height: "48px"
            }}
          >
            <Option value="scheduled">
              <Tag color="processing">Scheduled</Tag>
            </Option>
            <Option value="in_progress">
              <Tag color="warning">In Progress</Tag>
            </Option>
            <Option value="completed">
              <Tag color="success">Completed</Tag>
            </Option>
            <Option value="cancelled">
              <Tag color="error">Cancelled</Tag>
            </Option>
            <Option value="postponed">
              <Tag color="default">Postponed</Tag>
            </Option>
          </Select>
        </Form.Item>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Reminder</Text>
                        <Switch checked={showReminder} onChange={setShowReminder} />
                    </div>

                    {showReminder && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Form.Item
                                name="reminder_date"
                                label={<span style={formItemStyle}>Reminder Date</span>}
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    style={{
                                        ...inputStyle,
                                        width: '100%'
                                    }}
                                    suffixIcon={<FiCalendar style={{ color: "#4096ff" }} />}
                                />
                            </Form.Item>

                            <Form.Item
                                name="reminder_time"
                                label={<span style={formItemStyle}>Reminder Time</span>}
                            >
                                <TimePicker
                                    format="hh:mm A"
                                    style={{
                                        ...inputStyle,
                                        width: '100%'
                                    }}
                                    use12Hours
                                />
                            </Form.Item>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Repeat</Text>
                        <Switch
                            checked={repeatType !== 'none'}
                            onChange={handleRepeatToggle}
                        />
                    </div>

                    {repeatType !== 'none' && (
                        <div>
                            <Form.Item
                                name="repeat"
                                label={<span style={formItemStyle}>Repeat Type</span>}
                            >
                                <Select
                                    placeholder="Select repeat option"
                                    style={selectStyle}
                                    value={repeatType}
                                    onChange={(value) => setRepeatType(value)}
                                    suffixIcon={<FiChevronDown size={14} />}
                                >
                                    <Option value="daily">Daily</Option>
                                    <Option value="weekly">Weekly</Option>
                                    <Option value="monthly">Monthly</Option>
                                    <Option value="yearly">Yearly</Option>
                                    <Option value="custom">Custom</Option>
                                </Select>
                            </Form.Item>

                            {repeatType === 'custom' && (
                                <div style={{
                                    marginTop: '16px',
                                    padding: '16px',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '8px',
                                    backgroundColor: '#f8fafc'
                                }}>
                                    <Form.Item
                                        name="repeat_frequency"
                                        label={<span style={formItemStyle}>Frequency</span>}
                                    >
                                        <Select
                                            defaultValue="weekly"
                                            style={selectStyle}
                                            onChange={(value) => setCustomFrequency(value)}
                                            suffixIcon={<FiChevronDown size={14} />}
                                        >
                                            <Option value="weekly">Weekly</Option>
                                            <Option value="monthly">Monthly</Option>
                                            <Option value="yearly">Yearly</Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item label={<span style={formItemStyle}>Repeat Every</span>}>
                                        <Input.Group compact>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={customRepeatInterval}
                                                onChange={(e) => setCustomRepeatInterval(e.target.value)}
                                                style={{
                                                    width: '20%',
                                                    ...inputStyle,
                                                    borderTopRightRadius: 0,
                                                    borderBottomRightRadius: 0
                                                }}
                                            />
                                            <div style={{
                                                lineHeight: '48px',
                                                padding: '0 16px',
                                                backgroundColor: '#f3f4f6',
                                                border: '1px solid #e6e8eb',
                                                borderLeft: 'none',
                                                borderTopRightRadius: '10px',
                                                borderBottomRightRadius: '10px'
                                            }}>
                                                {customFrequency === 'weekly' ? 'weeks' : customFrequency === 'monthly' ? 'months' : 'years'}
                                            </div>
                                        </Input.Group>
                                    </Form.Item>

                                    {customFrequency === 'weekly' && (
                                        <Form.Item label={<span style={formItemStyle}>On These Days</span>}>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                                    <Button
                                                        key={day}
                                                        type={customRepeatDays.includes(index) ? 'primary' : 'default'}
                                                        shape="circle"
                                                        onClick={() => {
                                                            const newDays = customRepeatDays.includes(index)
                                                                ? customRepeatDays.filter(d => d !== index)
                                                                : [...customRepeatDays, index];
                                                            setCustomRepeatDays(newDays);
                                                        }}
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            padding: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            ...(customRepeatDays.includes(index) ? {
                                                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                                                border: 'none'
                                                            } : {})
                                                        }}
                                                    >
                                                        {day}
                                                    </Button>
                                                ))}
                                            </div>
                                        </Form.Item>
                                    )}

                                    {customFrequency === 'monthly' && (
                                        <Form.Item label={<span style={formItemStyle}>On</span>}>
                                            <Space>
                                                <Select style={{ width: 120 }} defaultValue="first">
                                                    <Option value="first">First</Option>
                                                    <Option value="second">Second</Option>
                                                    <Option value="third">Third</Option>
                                                    <Option value="fourth">Fourth</Option>
                                                    <Option value="last">Last</Option>
                                                </Select>
                                                <Select style={{ width: 120 }} defaultValue="monday">
                                                    <Option value="sunday">Sunday</Option>
                                                    <Option value="monday">Monday</Option>
                                                    <Option value="tuesday">Tuesday</Option>
                                                    <Option value="wednesday">Wednesday</Option>
                                                    <Option value="thursday">Thursday</Option>
                                                    <Option value="friday">Friday</Option>
                                                    <Option value="saturday">Saturday</Option>
                                                </Select>
                                            </Space>
                                        </Form.Item>
                                    )}

                                    {customFrequency === 'yearly' && (
                                        <Form.Item label={<span style={formItemStyle}>On</span>}>
                                            <Space direction="vertical">
                                                <Space>
                                                    <Select style={{ width: 120 }} defaultValue="1">
                                                        {Array.from({ length: 12 }, (_, i) => (
                                                            <Option key={i + 1} value={i + 1}>
                                                                {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                    <Select style={{ width: 120 }} defaultValue="first">
                                                        <Option value="first">First</Option>
                                                        <Option value="second">Second</Option>
                                                        <Option value="third">Third</Option>
                                                        <Option value="fourth">Fourth</Option>
                                                        <Option value="last">Last</Option>
                                                    </Select>
                                                    <Select style={{ width: 120 }} defaultValue="monday">
                                                        <Option value="sunday">Sunday</Option>
                                                        <Option value="monday">Monday</Option>
                                                        <Option value="tuesday">Tuesday</Option>
                                                        <Option value="wednesday">Wednesday</Option>
                                                        <Option value="thursday">Thursday</Option>
                                                        <Option value="friday">Friday</Option>
                                                        <Option value="saturday">Saturday</Option>
                                                    </Select>
                                                </Space>
                                            </Space>
                                        </Form.Item>
                                    )}
                                </div>
                            )}

                            <div style={{
                                border: '1px solid #f0f0f0',
                                borderRadius: '8px',
                                padding: '16px',
                                marginTop: '16px',
                                backgroundColor: '#f8fafc'
                            }}>
                                <Form.Item
                                    label={<span style={formItemStyle}>Ends</span>}
                                    style={{ marginBottom: '16px' }}
                                >
                                    <Radio.Group
                                        value={repeatEndType}
                                        onChange={(e) => setRepeatEndType(e.target.value)}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Radio value="never">Never</Radio>
                                            <Radio value="after">
                                                <Space align="center">
                                                    After{' '}
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={repeatTimes}
                                                        onChange={(e) => setRepeatTimes(e.target.value)}
                                                        style={{
                                                            width: '60px',
                                                            ...inputStyle,
                                                            height: '32px'
                                                        }}
                                                        disabled={repeatEndType !== 'after'}
                                                    />
                                                    {' '}Times
                                                </Space>
                                            </Radio>
                                            <Radio value="on">
                                                <Space align="center">
                                                    On{' '}
                                                    <DatePicker
                                                        value={repeatEndDate}
                                                        onChange={(date) => setRepeatEndDate(date)}
                                                        disabled={repeatEndType !== 'on'}
                                                        format="DD/MM/YYYY"
                                                        style={{
                                                            ...inputStyle,
                                                            height: '32px'
                                                        }}
                                                    />
                                                </Space>
                                            </Radio>
                                        </Space>
                                    </Radio.Group>
                                </Form.Item>
                            </div>
                        </div>
                    )}
                </div>

                <Form.Item
                    name="participants_reminder"
                    label="Participants Reminder"
                    style={{ marginTop: "20px" }}
                >
                    <Select
                        placeholder="Select reminder option"
                        size="large"
                        listHeight={100}
                        virtual={true}
                        style={{
                            width: "100%",
                            borderRadius: "10px",
                            height: "48px",
                        }}
                    >
                        <Option value="none">None</Option>
                        <Option value="at_time_of_meeting">At time of meeting</Option>
                        <Option value="15_min">15 minutes before</Option>
                        <Option value="30_min">30 minutes before</Option>
                        <Option value="1_hour">1 hour before</Option>
                        <Option value="1_day">1 day before</Option>
                        <Option value="2_days">2 days before</Option>
                    </Select>
                </Form.Item>

                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    marginTop: "24px"
                }}>
                    <Button
                        size="large"
                        onClick={onCancel}
                        style={{
                            padding: "8px 24px",
                            height: "44px",
                            borderRadius: "10px",
                            border: "1px solid #e6e8eb",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        style={{
                            padding: "8px 32px",
                            height: "44px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        }}
                    >
                        Update Meeting
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditFollowupMeeting;
