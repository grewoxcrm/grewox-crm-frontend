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
import "./contact.scss";
import { useCreateContactMutation } from "./services/contactApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import AddCompanyModal from "../deal/AddCompanyModal";
import { PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateContact = ({ open, onCancel, loggedInUser, companyAccountsResponse }) => {
  const [form] = Form.useForm();
  const [createContact, { isLoading }] = useCreateContactMutation();
  const [isAddCompanyVisible, setIsAddCompanyVisible] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");

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

  const handleCompanyCreationSuccess = (newCompany) => {
    setIsAddCompanyVisible(false);
    form.setFieldsValue({
      company_name: newCompany.id
    });
    message.success('Company added successfully');
    setNewCompanyName("");
  };

  const handleAddCompanyClick = (e) => {
    if (e) e.stopPropagation();
    setIsAddCompanyVisible(true);
  };

  return (
    <>
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
                name="email"
                label={
                  <span className="form-label">
                    <FiMail />
                    Email
                  </span>
                }
                rules={[
                  { type: "email", message: "Please enter valid email" }
                ]}
              >
                <Input
                  placeholder="Enter email"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="phone"
                label={
                  <span className="form-label">
                    <FiPhone />
                    Phone
                  </span>
                }
              >
                <Input
                  placeholder="Enter phone number"
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
                    Company Name <span className="required">*</span>
                  </span>
                }
                rules={[{ required: true, message: "Please select company" }]}
              >
                <Select
                  placeholder="Select company"
                  size="large"
                  className="form-input"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  dropdownRender={(menu) => (
                    <div onClick={(e) => e.stopPropagation()}>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <div
                        style={{
                          padding: '8px 12px',
                          display: 'flex',
                          justifyContent: 'center'
                        }}
                      >
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddCompanyClick}
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
                          Add Company
                        </Button>
                      </div>
                    </div>
                  )}
                >
                  {companyAccountsResponse?.data?.map((company) => (
                    <Option key={company.id} value={company.id} label={company.company_name}>
                      {company.company_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="contact_source"
                label={
                  <span className="form-label">
                    <FiTag />
                    Contact Source
                  </span>
                }
              >
                <Select
                  placeholder="Select contact source"
                  size="large"
                  className="form-input"
                >
                  <Option value="Website">Website</Option>
                  <Option value="Referral">Referral</Option>
                  <Option value="Social Media">Social Media</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="address"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Address
                  </span>
                }
              >
                <TextArea
                  placeholder="Enter address"
                  rows={4}
                  className="form-textarea"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="city"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    City
                  </span>
                }
              >
                <Input
                  placeholder="Enter city"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="state"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    State
                  </span>
                }
              >
                <Input
                  placeholder="Enter state"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="country"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Country
                  </span>
                }
              >
                <Input
                  placeholder="Enter country"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label={
                  <span className="form-label">
                    <FiFileText />
                    Description
                  </span>
                }
              >
                <TextArea
                  placeholder="Enter description"
                  rows={4}
                  className="form-textarea"
                />
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

      <AddCompanyModal
        open={isAddCompanyVisible}
        onCancel={() => setIsAddCompanyVisible(false)}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
        onSuccess={handleCompanyCreationSuccess}
        initialCompanyName={newCompanyName}
      />
    </>
  );
};

export default CreateContact;
