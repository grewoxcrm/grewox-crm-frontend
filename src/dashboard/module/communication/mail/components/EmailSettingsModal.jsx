import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Switch, message } from 'antd';
import { FiMail, FiX, FiKey } from 'react-icons/fi';
import { useGetEmailSettingsQuery, useCreateEmailSettingsMutation, useUpdateEmailSettingsMutation } from '../services/mailApi';

const EmailSettingsModal = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useGetEmailSettingsQuery();
  const [createSettings] = useCreateEmailSettingsMutation();
  const [updateSettings] = useUpdateEmailSettingsMutation();

  useEffect(() => {
    if (settings?.data) {
      form.setFieldsValue({
        email: settings.data.email,
        app_password: '',
        is_default: settings.data.is_default
      });
    }
  }, [settings, form]);

  const handleSubmit = async (values) => {
    try {
      if (settings?.data) {
        await createSettings({
          ...values
        }).unwrap();
      } else {
        await createSettings(values).unwrap();
      }
      message.success('Email settings saved successfully');
      onCancel();
    } catch (error) {
      message.error(error?.data?.message || 'Failed to save email settings');
    }
  };

  return (
    <Modal
      title={
        <div className="settings-header">
          <FiMail className="header-icon" />
          <span>Email Settings</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      className="settings-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="settings-form"
      >
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please enter email address' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input 
            prefix={<FiMail />} 
            placeholder="Enter email address"
          />
        </Form.Item>

        <Form.Item
          name="app_password"
          label="App Password"
          rules={[
            { required: !settings?.data, message: 'Please enter app password' },
            { min: 16, message: 'App password must be at least 16 characters' }
          ]}
          extra="Generate an app password from your Google Account settings"
        >
          <Input.Password
            prefix={<FiKey />}
            placeholder="Enter app password"
          />
        </Form.Item>

        <Form.Item
          name="is_default"
          valuePropName="checked"
        >
          <Switch checkedChildren="Default" unCheckedChildren="Not Default" />
        </Form.Item>

        <div className="form-actions">
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Save Settings
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EmailSettingsModal;