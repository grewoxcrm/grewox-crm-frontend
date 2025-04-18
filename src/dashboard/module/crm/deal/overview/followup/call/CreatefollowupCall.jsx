import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Select, Button, Typography, Tag, Checkbox, Space, Avatar, Radio, Switch, message } from 'antd';
import { FiX, FiCalendar, FiPhone, FiUser, FiShield, FiBriefcase, FiChevronDown } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetUsersQuery } from '../../../../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../../../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../../auth/services/authSlice';
import { useCreateFollowupCallMutation } from './services/followupCallApi';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateFollowupCall = ({ open, onCancel, onSubmit, initialDate, initialTime, dealId }) => {
  const [form] = Form.useForm();
  const [selectedCallType, setSelectedCallType] = useState(null);
  const currentUser = useSelector(selectCurrentUser);
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
 
  const [createFollowupCall, { isLoading: followupCallResponseLoading }] = useCreateFollowupCallMutation();
  // Get subclient role ID to filter it out
  const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

  // Filter users to get team members (excluding subclients)
  const users = usersResponse?.data?.filter(user =>
    user?.created_by === currentUser?.username &&
    user?.role_id !== subclientRoleId
  ) || [];

  // Get role colors and icons
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



  const handleSubmit = async (values) => {
    const assignedToArray = Array.isArray(values.assigned_to) ? values.assigned_to : [values.assigned_to].filter(Boolean);

    try {
      const formattedValues = {
        ...values,
        assigned_to: {
          assigned_to: assignedToArray
        },
        call_type: 'scheduled',
        call_start_date: values.call_start_date ? values.call_start_date.format('YYYY-MM-DD') : null,
        call_start_time: values.call_start_time ? values.call_start_time.format('HH:mm:ss') : null,
      };


      await createFollowupCall({id: dealId, data: formattedValues});
      // console.log('Call Data:', formattedValues);
      message.success('Call scheduled successfully');
      form.resetFields();
      onCancel();

      if (onSubmit) {
        onSubmit(formattedValues);
      }
    } catch (error) {
      console.error('Error scheduling call:', error);
      message.error('Failed to schedule call');
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
            <FiPhone style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2 style={{
              margin: "0",
              fontSize: "24px",
              fontWeight: "600",
              color: "#ffffff",
            }}>
              Schedule Call
            </h2>
            <Text style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.85)",
            }}>
              Add a new call to your deal
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          call_date: initialDate,
          call_time: initialTime,
          created_by: currentUser?.username,
        }}
        style={{ padding: "24px" }}
      >
        {/* <Typography.Title level={5} style={{ marginBottom: '24px' }}>Schedule Call</Typography.Title> */}

        {/* Basic Call Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* <Form.Item
            name="call_for"
            label="Call For"
            rules={[{ required: true, message: 'Please select call for' }]}
          >
            <Select
              placeholder="Select contact or lead"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="contact">Contact</Option>
              <Option value="lead">Lead</Option>
            </Select>
          </Form.Item> */}

        
        </div>

        {/* Assignment Section */}
      

        {/* Schedule Information */}
        <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
          <Form.Item
            name="call_start_date"
            label="Call Date"
            rules={[{ required: true, message: 'Please select date' }]}
            style={{ flex: 1 }}
          >
            <DatePicker
              format="DD/MM/YYYY"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            />
          </Form.Item>
          
          <Form.Item
            name="call_start_time"
            label="Call Time"
            rules={[{ required: true, message: 'Please select time' }]}
            style={{ flex: 1 }}
          >
            <TimePicker
              format="hh:mm A"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
              use12Hours
            />
          </Form.Item>
        </div>

        {/* Duration and Reminder */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: "20px" }}>
          {/* <Form.Item
            name="call_duration"
            label="Duration"
            rules={[{ required: true, message: 'Please select duration' }]}
          >
            <Select
              placeholder="Select duration"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="15">15 minutes</Option>
              <Option value="30">30 minutes</Option>
              <Option value="45">45 minutes</Option>
              <Option value="60">1 hour</Option>
            </Select>
          </Form.Item> */}
            {/* <Form.Item
            name="created_by"
            label="Call Owner"
            rules={[{ required: true, message: 'Please select creator' }]}
          >
            <Input
              value={currentUser?.username}
              disabled
              size="large"
              style={{
                borderRadius: "10px",
                height: "48px",
              }}
            />
          </Form.Item> */}

          <Form.Item
            name="priority"
            label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Priority</span>}
            rules={[{ required: true, message: "Please select priority" }]}
          >
            <Select
              placeholder="Select priority"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="highest">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff4d4f' }} />
                  Highest - Urgent and Critical
                </div>
              </Option>
              <Option value="high">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#faad14' }} />
                  High - Important
                </div>
              </Option>
              <Option value="medium">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1890ff' }} />
                  Medium - Normal
                </div>
              </Option>
              <Option value="low">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#52c41a' }} />
                  Low - Can Wait
                </div>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="call_reminder"
            label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Reminder</span>}
            rules={[{ required: true, message: 'Please select reminder' }]}
          >
            <Select
              placeholder="Select reminder"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="5_min">5 minutes before</Option>
              <Option value="10_min">10 minutes before</Option>
              <Option value="15_min">15 minutes before</Option>
              <Option value="30_min">30 minutes before</Option>
              <Option value="1_hour">1 hour before</Option>
            </Select>
          </Form.Item>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ fontSize: '16px', color: '#1f2937', display: 'block', marginBottom: '16px' }}>Assignment</Text>
          <Form.Item
            name="assigned_to"
            label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Assign To</span>}
            rules={[{ required: true, message: 'Please select assignee' }]}
          >
            <Select
              showSearch
              placeholder="Select team member"
              optionFilterProp="children"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px"
              }}
              filterOption={(input, option) => {
                const username = option?.username?.toLowerCase() || '';
                const searchTerm = input.toLowerCase();
                return username.includes(searchTerm);
              }}
            >
              {users.map((user) => {
                const userRole = rolesData?.data?.find(role => role.id === user.role_id);
                const roleStyle = getRoleStyle(userRole?.role_name);

                return (
                  <Option key={user.id} value={user.id} username={user.username}>
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
                        <Avatar size="small" style={{
                          backgroundColor: user.color || '#1890ff',
                          fontSize: '12px'
                        }}>
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
        </div>
        {/* Subject and Purpose */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: "20px" }}>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter subject' }]}
          >
            <Input
              placeholder="e.g., Product Demo Call"
              size="large"
              style={{ borderRadius: "10px", height: "48px" }}
            />
          </Form.Item>

          <Form.Item
            name="call_purpose"
            label="Purpose"
            rules={[{ required: true, message: 'Please enter purpose' }]}
          >
            <Input
              placeholder="Enter purpose"
              size="large" 
              style={{ borderRadius: "10px", height: "48px" }}
            />
          </Form.Item>
        </div>

        {/* Call Status */}
        <Form.Item
          name="call_status"
          label="Call Status"
          initialValue="not_started"
          rules={[{ required: true, message: 'Please select call status' }]}
          style={{ marginTop: "20px" }}
        >
          <Select
            placeholder="Select call status"
            size="large"
            style={{ width: "100%", borderRadius: "10px", height: "48px" }}
          >
            <Option value="not_started">
              <Tag color="default">Not Started</Tag>
            </Option>
            <Option value="in_progress">
              <Tag color="processing">In Progress</Tag>
            </Option>
            <Option value="completed">
              <Tag color="success">Completed</Tag>
            </Option>
            <Option value="cancelled">
              <Tag color="error">Cancelled</Tag>
            </Option>
            <Option value="no_answer">
              <Tag color="warning">No Answer</Tag>
            </Option>
            <Option value="busy">
              <Tag color="orange">Busy</Tag>
            </Option>
            <Option value="wrong_number">
              <Tag color="red">Wrong Number</Tag>
            </Option>
            <Option value="voicemail">
              <Tag color="purple">Voicemail</Tag>
            </Option>
          </Select>
        </Form.Item>

        {/* Notes */}
        <Form.Item
          name="call_notes"
          label="Notes"
          style={{ marginTop: "20px" }}
        >
          <TextArea
            placeholder="Enter any notes or talking points for the call"
            rows={4}
            style={{
              borderRadius: "10px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb"
            }}
          />
        </Form.Item>

        {/* Action Buttons */}
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
              background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
            }}
          >
            Schedule Call
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateFollowupCall;
