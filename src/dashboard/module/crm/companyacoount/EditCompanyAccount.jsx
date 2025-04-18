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
  DatePicker,
  message,
  Switch,
} from "antd";
import {
  FiFileText,
  FiX,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiTag,
  FiDollarSign,
  FiGlobe,
  FiBriefcase,
  FiUsers,
  FiCopy,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./companyaccount.scss";
import { useGetUsersQuery } from "../../user-management/users/services/userApi";
import { useUpdateCompanyAccountMutation } from "./services/companyAccountApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditCompanyAccount = ({ open, onCancel, companyData, loggedInUser }) => {
  const [form] = Form.useForm();
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);
  const { data: usersData } = useGetUsersQuery();
  const [updateCompanyAccount, { isLoading }] = useUpdateCompanyAccountMutation();

  React.useEffect(() => {
    if (companyData) {
      console.log("companyData", companyData);
      
      // Find the account owner's name from users data
      let accountOwnerName = companyData?.account_owner;
      if (usersData?.data) {
        const owner = usersData.data.find(user => user.id === companyData?.account_owner);
        if (owner) {
          accountOwnerName = owner.username;
        }
      }
      
      form.setFieldsValue({
        ...companyData,
        account_owner: accountOwnerName,
        registrationDate: companyData.registrationDate ? dayjs(companyData.registrationDate) : null
      });
    }
  }, [companyData, form, usersData]);

  const handleCopyBillingToShipping = (checked) => {
    setCopyBillingToShipping(checked);
    if (checked) {
      const billingValues = form.getFieldsValue([
        'billing_address',
        'billing_city',
        'billing_state',
        'billing_pincode',
        'billing_country'
      ]);
      
      form.setFieldsValue({
        shipping_address: billingValues.billing_address,
        shipping_city: billingValues.billing_city,
        shipping_state: billingValues.billing_state,
        shipping_pincode: billingValues.billing_pincode,
        shipping_country: billingValues.billing_country
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Find the account owner ID from the username
      let accountOwnerId = companyData?.account_owner;
      if (usersData?.data) {
        const owner = usersData.data.find(user => user.username === values.account_owner);
        if (owner) {
          accountOwnerId = owner.id;
        }
      }
      
      const updatedCompanyData = {
        ...values,
        account_owner: accountOwnerId,
        registrationDate: values.registrationDate ? values.registrationDate.format('YYYY-MM-DD') : null
      };

      await updateCompanyAccount({ 
        id: companyData.id, 
        data: updatedCompanyData 
      }).unwrap();
      
      message.success("Company account updated successfully");
      onCancel();
    } catch (error) {
      console.error("Update Error:", error);
      message.error("Failed to update company account");
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
            <h2>Edit Company Account</h2>
            <Text>Update company account information</Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="company-account-form"
      >
        <div className="form-section">
          <Text strong className="section-title">Basic Information</Text>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="account_owner"
                label={
                  <span className="form-label">
                    <FiUser />
                    Account Owner <span className="required">*</span>
                  </span>
                }
                
                rules={[{ required: true, message: "Please enter account owner" }]}
              >
                <Input
                  placeholder="Enter account owner name"
                  size="large"
                  className="form-input"
                  disabled
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="company_name"
                label={
                  <span className="form-label">
                    {/* <FiBuilding /> */}
                    Company Name <span className="required">*</span>
                  </span>
                }
                rules={[{ required: true, message: "Please enter company name" }]}
              >
                <Input
                  placeholder="Enter company name"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="company_site"
                label={
                  <span className="form-label">
                    <FiGlobe />
                    Company Site
                  </span>
                }
              >
                <Input
                  placeholder="Enter company site"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="company_number"
                label={
                  <span className="form-label">
                    <FiPhone />
                    Company Number
                  </span>
                }
              >
                <Input
                  placeholder="Enter company number"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="form-section">
          <Text strong className="section-title">Company Details</Text>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="company_type"
                label={
                  <span className="form-label">
                    <FiBriefcase />
                    Company Type
                  </span>
                }
              >
                <Select
                  size="large"
                  placeholder="Select company type"
                  className="form-input"
                >
                  <Option value="private">Private</Option>
                  <Option value="public">Public</Option>
                  <Option value="partnership">Partnership</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="company_category"
                label={
                  <span className="form-label">
                    <FiTag />
                    Company Category
                  </span>
                }
              >
                <Input
                  placeholder="Enter company category"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="company_industry"
                label={
                  <span className="form-label">
                    <FiBriefcase />
                    Company Industry
                  </span>
                }
              >
                <Input
                  placeholder="Enter company industry"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="company_revenue"
                label={
                  <span className="form-label">
                    <FiDollarSign />
                    Company Revenue
                  </span>
                }
              >
                <Input
                  placeholder="Enter company revenue"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="form-section">
          <Text strong className="section-title">Contact Information</Text>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone_number"
                label={
                  <span className="form-label">
                    <FiPhone />
                    Phone Number
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

            <Col span={12}>
              <Form.Item
                name="website"
                label={
                  <span className="form-label">
                    <FiGlobe />
                    Website
                  </span>
                }
              >
                <Input
                  placeholder="Enter website"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fax"
                label={
                  <span className="form-label">
                    <FiPhone />
                    Fax
                  </span>
                }
              >
                <Input
                  placeholder="Enter fax number"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="ownership"
                label={
                  <span className="form-label">
                    <FiUsers />
                    Ownership
                  </span>
                }
              >
                <Input
                  placeholder="Enter ownership details"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="number_of_employees"
                label={
                  <span className="form-label">
                    <FiUsers />
                    Number of Employees
                  </span>
                }
              >
                <Input
                  type="number"
                  placeholder="Enter number of employees"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="form-section">
          <div className="section-header">
            <Text strong className="section-title">Billing Address</Text>
          </div>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="billing_address"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Address
                  </span>
                }
              >
                <TextArea
                  placeholder="Enter billing address"
                  rows={3}
                  className="form-textarea"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="billing_city"
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
                name="billing_state"
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
                name="billing_pincode"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Pincode
                  </span>
                }
              >
                <Input
                  type="number"
                  placeholder="Enter pincode"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="billing_country"
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
        </div>

        <div className="form-section">
          <div className="section-header">
            <Text strong className="section-title">Shipping Address</Text>
            <div className="copy-address-switch">
              <Text>Same as Billing Address</Text>
              <Switch 
                checked={copyBillingToShipping}
                onChange={handleCopyBillingToShipping}
                size="small"
              />
            </div>
          </div>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="shipping_address"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Address
                  </span>
                }
              >
                <TextArea
                  placeholder="Enter shipping address"
                  rows={3}
                  className="form-textarea"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="shipping_city"
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
                name="shipping_state"
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
                name="shipping_pincode"
                label={
                  <span className="form-label">
                    <FiMapPin />
                    Pincode
                  </span>
                }
              >
                <Input
                  type="number"
                  placeholder="Enter pincode"
                  size="large"
                  className="form-input"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="shipping_country"
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
        </div>

        <div className="form-section">
          <Text strong className="section-title">Additional Information</Text>
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
        </div>

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
            className="submit-button"
            loading={isLoading}
          >
            Update Company Account
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditCompanyAccount;
