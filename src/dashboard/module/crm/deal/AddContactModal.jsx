import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Row,
  Col,
  Divider,
  message,
} from "antd";
import {
  FiFileText,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiTag,
  FiGlobe,
  FiUsers,
} from "react-icons/fi";
import "../contact/contact.scss";
import { useCreateContactMutation } from "../contact/services/contactApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AddContactModal = ({ open, onCancel, loggedInUser, companyAccountsResponse }) => {
  const [form] = Form.useForm();
  const [createContact, { isLoading }] = useCreateContactMutation();

  // Safely handle company accounts data
  const companyAccounts = React.useMemo(() => {
    if (!companyAccountsResponse) return [];
    if (Array.isArray(companyAccountsResponse)) return companyAccountsResponse;
    if (companyAccountsResponse?.data && Array.isArray(companyAccountsResponse.data)) {
      return companyAccountsResponse.data;
    }
    return [];
  }, [companyAccountsResponse]);

  const handleSubmit = async (values) => {
    try {
      const contactData = {
        contact_owner: loggedInUser?.id || "",
        first_name: values.first_name || "",
        last_name: values.last_name || "",
        company_name: values.company_name || "",
        email: values.email || "",
        phone: values.phone || "",
        contact_source: values.contact_source || "",
        description: values.description || "",
        address: values.address || "",
        city: values.city || "",
        state: values.state || "",
        country: values.country || "",
      };

      await createContact(contactData);
      message.success("Contact created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error("Failed to create contact");
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
      <div className="modal-header">
        <Button
          type="text"
          onClick={onCancel}
          className="close-button"
        >
          <FiX />
        </Button>
        <div className="header-content">
          <div className="header-icon">
            <FiFileText />
          </div>
          <div>
            <h2>Create Contact</h2>
            <Text>Fill in the information to create new contact</Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="contact-form"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contact_owner"
              label={
                <span className="form-label">
                  <FiUsers />
                  Contact Owner <span className="required">*</span>
                </span>
              }
              initialValue={loggedInUser?.username}
            >
              <Input
                placeholder="Enter contact owner"
                size="large"
                className="form-input"
                disabled
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="first_name"
              label={
                <span className="form-label">
                  <FiUser />
                  First Name <span className="required">*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input
                placeholder="Enter first name"
                size="large"
                className="form-input"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="last_name"
              label={
                <span className="form-label">
                  <FiUser />
                  Last Name
                </span>
              }
            >
              <Input
                placeholder="Enter last name"
                size="large"
                className="form-input"
              />
            </Form.Item>
          </Col>
        </Row>


        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="company_name"
              label={
                <span className="form-label">
                  <FiGlobe />
                  Company Name <span className="required"></span>
                </span>
              }
            
            >
              <Select
                placeholder="Select company"
                size="large"
                className="form-input"
                showSearch
                allowClear
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {companyAccounts.map((company) => (
                  <Option key={company.id} value={company.id} label={company.company_name}>
                    {company.company_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

      
        </Row>



        <Divider className="form-divider" />

        <div className="form-footer">
          <Button
            size="large"
            onClick={onCancel}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="submit-button"
          >
            Create Contact
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddContactModal;
