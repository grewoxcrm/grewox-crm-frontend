import React, { useEffect, useState, useRef } from "react";
import { Modal, Form, Input, Select, Button, Typography, Divider, message } from "antd";
import { FiX, FiLayers } from "react-icons/fi";
import { useUpdateLeadStageMutation } from "./services/leadStageApi";
import { useGetPipelinesQuery } from "../pipeline/services/pipelineApi";
import { PlusOutlined } from '@ant-design/icons';
import AddPipelineModal from "../pipeline/AddPipelineModal";

const { Text } = Typography;

const EditLeadStageModal = ({ isOpen, onClose, stage }) => {
  const [form] = Form.useForm();
  const [updateLeadStage, { isLoading }] = useUpdateLeadStageMutation();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const [isAddPipelineVisible, setIsAddPipelineVisible] = useState(false);
  const selectRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (stage) {
      form.setFieldsValue({
        name: stage.stageName,
        pipeline: stage.pipeline,
      });
    }
  }, [stage, form]);

  const handleSubmit = async (values) => {
    try {
      await updateLeadStage({
        id: stage.id,
        stageName: values.name,
        pipeline: values.pipeline,
        stageType: "lead",
      });
      message.success('Lead stage updated successfully');
      onClose();
    } catch (error) {
      message.error(error?.data?.message || 'Failed to update lead stage');
    }
  };

  const handleAddPipelineClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setDropdownOpen(false);
    setIsAddPipelineVisible(true);
  };

  return (
    <>
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
              <FiLayers style={{ fontSize: "24px", color: "#ffffff" }} />
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
                Edit Lead Stage
              </h2>
              <Text
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Update lead stage information
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
            label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Stage Name</span>}
            rules={[{ required: true, message: "Please enter stage name" }]}
          >
            <Input
              placeholder="Enter stage name"
              style={{
                borderRadius: "10px",
                padding: "8px 16px",
                height: "48px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
              }}
            />
          </Form.Item>

          <Form.Item
            name="pipeline"
            label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Pipeline</span>}
            rules={[{ required: true, message: "Please select a pipeline" }]}
          >
            <Select
              ref={selectRef}
              open={dropdownOpen}
              onDropdownVisibleChange={setDropdownOpen}
              placeholder="Select pipeline"
              style={{
                width: "100%",
                height: "48px",
              }}
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
                      onClick={handleAddPipelineClick}
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
                      Add Pipeline
                    </Button>
                  </div>
                </div>
              )}
            >
              {pipelines.map((pipeline) => (
                <Select.Option key={pipeline.id} value={pipeline.id}>
                  {pipeline.pipeline_name}
                </Select.Option>
              ))}
            </Select>
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
              Update Stage
            </Button>
          </div>
        </Form>
      </Modal>

      <AddPipelineModal
        isOpen={isAddPipelineVisible}
        onClose={() => setIsAddPipelineVisible(false)}
      />
    </>
  );
};

export default EditLeadStageModal;
