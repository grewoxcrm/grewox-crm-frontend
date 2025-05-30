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
  Upload,
  message,
} from "antd";
import {
  FiUser,
  FiX,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiUpload,
  FiHash,
  FiCopy,
} from "react-icons/fi";
import { useGetAllCountriesQuery } from "../../settings/services/settingsApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateCustomer = ({ open, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { data: countries = [], loading: countriesLoading } = useGetAllCountriesQuery();
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Find India in countries array and set as default
  useEffect(() => {
    if (countries.length > 0) {
      const india = countries.find(country => country.countryName === 'India');
      if (india) {
        setSelectedCountry(india);
        form.setFieldValue('phonecode', india.phoneCode);
      }
    }
  }, [countries]);


  
  const handleSubmit = async (values) => {
    try {
      // Find the country ID from the selected phone code
      const selectedCountry = countries?.find(c => c.phoneCode === values.phoneCode);
      if (!selectedCountry) {
        message.error('Please select a valid phone code');
        return;
      }

      const { phoneCode, phoneNumber, ...otherValues } = values;
      
      const customerData = {
        // Basic Information
        name: otherValues.name || "",
        contact: phoneNumber || "",
        email: otherValues.email || "",
        tax_number: otherValues.tax_number || "",
        alternate_number: otherValues.alternate_number || "",
        text_number: otherValues.text_number || "",
        company: otherValues.company || "",
        status: otherValues.status || "active",
        phonecode: selectedCountry.id, // Use country ID as phonecode

        // Address Information
        billing_address: otherValues.billing_address || null,
        shipping_address: otherValues.shipping_address || null,

        // Additional Information
        notes: otherValues.notes || "",
      };

      // If there's a profile image, append it to the data
      if (fileList.length > 0 && fileList[0].originFileObj) {
        customerData.profile_image = fileList[0].originFileObj;
      }

      await onSubmit(customerData);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error("Submit Error:", error);
      message.error("Failed to create customer");
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleCountryChange = (value) => {
    const country = countries.find(c => c.id === value);
    setSelectedCountry(country);
  };

  const copyBillingToShipping = () => {
    const billingAddress = form.getFieldValue("billing_address") || {};
    form.setFieldsValue({
      shipping_address: {
        street: billingAddress.street || "",
        city: billingAddress.city || "",
        state: billingAddress.state || "",
        country: billingAddress.country || "",
        postal_code: billingAddress.postal_code || "",
      },
    });
    message.success("Shipping address copied from billing address");
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
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
            }}
          >
            <FiUser style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2
              style={{
                margin: "0",
                fontSize: "24px",
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              Create New Customer
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create customer
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        style={{
          padding: "24px",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Customer Name
                </span>
              }
              rules={[
                { required: true, message: "Please enter customer name" },
                { max: 100, message: "Name cannot exceed 100 characters" },
              ]}
            >
              <Input
                prefix={
                  <FiUser style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter customer name"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tax_number"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Tax Number
                </span>
              }
            >
              <Input
                prefix={
                  <FiHash style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter tax number"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Email Address
                </span>
              }
            >
              <Input
                prefix={
                  <FiMail style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter email address"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label={
                <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                }}>
                    Phone Number <span style={{ color: '#ff4d4f' }}>*</span>
                </span>
              }
              // rules={[{ required: true, message: "Please enter phone number" }]}
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
                      initialValue="+91"
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
                          defaultValue="+91"
                      >
                          {countries?.map(country => (
                              <Option 
                                  key={country.id} 
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
                      name="phoneNumber"
                      noStyle
                  >
                      <Input
                          size="large"
                          type="number"
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
                          placeholder="Enter 10-digit phone number"
                          maxLength={10}
                      />
                  </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name={["billing_address", "street"]}
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Billing Address
                </span>
              }
            >
              <Input
                prefix={
                  <FiMapPin style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter street address"
                size="large"
                style={{
                  borderRadius: "10px",
                  padding: "8px 16px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e6e8eb",
                }}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={["billing_address", "city"]}>
                  <Input
                    placeholder="City"
                    size="large"
                    style={{
                      borderRadius: "10px",
                      padding: "8px 16px",
                      height: "48px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e6e8eb",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={["billing_address", "state"]}>
                  <Input
                    placeholder="State"
                    size="large"
                    style={{
                      borderRadius: "10px",
                      padding: "8px 16px",
                      height: "48px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e6e8eb",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={["billing_address", "country"]}>
                  <Input
                    placeholder="Country"
                    size="large"
                    style={{
                      borderRadius: "10px",
                      padding: "8px 16px",
                      height: "48px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e6e8eb",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={["billing_address", "postal_code"]}>
                  <Input
                    placeholder="Postal Code"
                    size="large"
                    style={{
                      borderRadius: "10px",
                      padding: "8px 16px",
                      height: "48px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e6e8eb",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>

        <Button
          type="link"
          icon={<FiCopy style={{ marginRight: "4px" }} />}
          onClick={copyBillingToShipping}
          style={{
            fontSize: "14px",
            padding: "4px 8px",
            height: "auto",
            color: "#1890ff",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginLeft: "auto",
            marginBottom: "10px",
          }}
        >
          Same as Billing
        </Button>

        <Col span={24}>
          <Form.Item
            name={["shipping_address", "street"]}
            label={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Shipping Address
                </span>
              </div>
            }
          >
            <Input
              prefix={
                <FiMapPin style={{ color: "#1890ff", fontSize: "16px" }} />
              }
              placeholder="Enter street address"
              size="large"
              style={{
                borderRadius: "10px",
                padding: "8px 16px",
                height: "48px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
              }}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={["shipping_address", "city"]}>
                <Input
                  placeholder="City"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                    height: "48px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e6e8eb",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={["shipping_address", "state"]}>
                <Input
                  placeholder="State"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                    height: "48px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e6e8eb",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={["shipping_address", "country"]}>
                <Input
                  placeholder="Country"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                    height: "48px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e6e8eb",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={["shipping_address", "postal_code"]}>
                <Input
                  placeholder="Postal Code"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    padding: "8px 16px",
                    height: "48px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e6e8eb",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>


        <Divider style={{ margin: "24px 0" }} />

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <Button
            onClick={onCancel}
            style={{
              padding: "8px 24px",
              height: "40px",
              borderRadius: "8px",
              border: "1px solid #d9d9d9",
              background: "#ffffff",
              color: "#262626",
              fontWeight: "500",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              padding: "8px 24px",
              height: "40px",
              borderRadius: "8px",
              background: "#1890ff",
              border: "none",
              color: "#ffffff",
              fontWeight: "500",
            }}
          >
            Create Customer
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateCustomer;
