import React, { useState } from "react";
import { Modal, Form, Input, Button, Typography } from "antd";
import { FiX, FiGitBranch } from "react-icons/fi";
import { useAddPipelineMutation } from "./services/pipelineApi";

const { Text } = Typography;

const AddPipelineModal = ({ isOpen, onClose }) => {
  const [form] = Form.useForm();
  const [addPipeline, { isLoading }] = useAddPipelineMutation();

  const handleSubmit = async (values) => {
    try {
      await addPipeline({ pipeline_name: values.name });
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Failed to add pipeline:", error);
    }
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={520}
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
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
          padding: "24px",
          color: "#ffffff",
          position: "relative",
        }}
      >
        <Button
          type="text"
          onClick={onClose}
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
          }}
        >
          <FiX style={{ fontSize: "20px" }} />
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
            <FiGitBranch style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Add Pipeline
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create pipeline
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        style={{ padding: "24px" }}
      >
        <Form.Item
          name="name"
          label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Pipeline Name</span>}
          rules={[{ required: true, message: "Please enter the pipeline name" }]}
        >
          <Input
            placeholder="Enter pipeline name"
            style={{
              borderRadius: "10px",
              padding: "8px 16px",
              height: "48px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
            }}
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <Button
            onClick={onClose}
            style={{
              padding: "8px 24px",
              height: "44px",
              borderRadius: "10px",
              border: "1px solid #e6e8eb",
              fontWeight: "500",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            style={{
              padding: "8px 32px",
              height: "44px",
              borderRadius: "10px",
              fontWeight: "500",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
            }}
          >
            Add Pipeline
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddPipelineModal;
