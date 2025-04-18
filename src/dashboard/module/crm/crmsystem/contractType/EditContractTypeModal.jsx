import React, { useEffect } from "react";
import { Modal, Form, Input, Button, message, Typography } from "antd";
import { useUpdateContractTypeMutation } from "../souce/services/SourceApi";
import { FiX, FiFileText } from "react-icons/fi";

const { Text } = Typography;

const EditContractTypeModal = ({ isOpen, onClose, contractType }) => {
  const [form] = Form.useForm();
  const [updateContractType, { isLoading }] = useUpdateContractTypeMutation();

  useEffect(() => {
    if (contractType) {
      form.setFieldsValue({
        name: contractType.name,
      });
    }
  }, [contractType, form]);

  const handleSubmit = async (values) => {
    try {
      await updateContractType({
        id: contractType.id,
        data: {
          name: values.name,
          lableType: "contract_type",
        },
      }).unwrap();
      message.success("Contract type updated successfully");
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error?.data?.message || "Failed to update contract type");
    }
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal"
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
          onClick={onClose}
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
          }}
        >
          <FiX style={{ fontSize: '20px' }} />
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FiFileText style={{ fontSize: '24px', color: '#ffffff' }} />
          </div>
          <div>
            <h2 style={{
              margin: '0',
              fontSize: '24px',
              fontWeight: '600',
              color: '#ffffff',
            }}>
              Edit Contract Type
            </h2>
            <Text style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.85)'
            }}>
              Fill in the information to update contract type
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        style={{ padding: '24px' }}
      >
        <Form.Item
          name="name"
          label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Contract Type Name</span>}
          rules={[{ required: true, message: 'Please enter the contract type name' }]}
        >
          <Input
            placeholder="Enter contract type name"
            style={{
              borderRadius: '10px',
              padding: '8px 16px',
              height: '48px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e6e8eb',
            }}
          />
        </Form.Item>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '24px'
        }}>
          <Button
            onClick={onClose}
            style={{
              padding: '8px 24px',
              height: '44px',
              borderRadius: '10px',
              border: '1px solid #e6e8eb',
              fontWeight: '500',
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            style={{
              padding: '8px 32px',
              height: '44px',
              borderRadius: '10px',
              fontWeight: '500',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
            }}
          >
            Update
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditContractTypeModal;
