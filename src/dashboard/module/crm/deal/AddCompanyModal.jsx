import React, { useState, useEffect } from "react";
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
import "../companyacoount/companyaccount.scss";
import { useCreateCompanyAccountMutation } from "../companyacoount/services/companyAccountApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AddCompanyModal = ({ open, onCancel, loggedInUser, companyAccountsResponse, onSuccess, initialCompanyName }) => {
  const [form] = Form.useForm();
  const [createCompanyAccount, { isLoading }] = useCreateCompanyAccountMutation();
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);

  useEffect(() => {
    if (open && initialCompanyName) {
      form.setFieldsValue({
        company_name: initialCompanyName
      });
    }
  }, [open, initialCompanyName, form]);

  const handleSubmit = async (values) => {
    try {
      const companyData = {
        ...values,
        account_owner: loggedInUser?.id
      }
      await createCompanyAccount(companyData).unwrap();
      form.resetFields();
      onCancel();
    } catch (error) {
      if (error?.data?.message?.includes("already exists")) {
        message.error("A company with this name already exists");
        return;
      }
      console.error("Submit Error:", error);
      message.error(error?.data?.message || "Failed to create company account");
    }
  };

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
            {/* <FiBuilding /> */}
          </div>
          <div>
            <h2>Create Company Account</h2>
            <Text>Fill in the information to create company account</Text>
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
                initialValue={loggedInUser?.username}
                disabled
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

          
          </Row>
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
            loading={isLoading}
            className="submit-button"
          >
            Create Company
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddCompanyModal;
