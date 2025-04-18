import React from 'react';
import { Modal, Form, Input, Button, Select, Upload, Space, Checkbox, DatePicker, TimePicker, message } from 'antd';
import { FiFileText, FiPaperclip, FiClock, FiX, FiFile } from 'react-icons/fi';
import { emailTemplates } from '../templates/emailTemplates';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const ComposeModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  form,
  selectedTemplate,
  setSelectedTemplate,
  templateFields,
  setTemplateFields,
  attachments,
  setAttachments,
  isImportant,
  setIsImportant,
  handleSchedule
}) => {
  const handleTemplateSelect = (templateKey) => {
    const template = emailTemplates[templateKey];
    if (!template) return;

    setSelectedTemplate(template);
    setTemplateFields({});

    form.setFieldsValue({
      subject: template.subject,
      html: template.html,
      to: '',
      templateKey
    });
  };

  const handleFieldChange = (field, value) => {
    if (!selectedTemplate) return;

    // Format date and time values
    let formattedValue = value;
    if (value instanceof dayjs) {
      const fieldType = selectedTemplate.fields.find(f => f.name === field)?.type;
      if (fieldType === 'date') {
        formattedValue = value.format('YYYY-MM-DD');
      } else if (fieldType === 'time') {
        formattedValue = value.format('HH:mm');
      }
    }

    const newFields = { ...templateFields, [field]: formattedValue };
    setTemplateFields(newFields);

    let updatedSubject = selectedTemplate.subject;
    let updatedHtml = selectedTemplate.html;

    Object.entries(newFields).forEach(([key, val]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      updatedSubject = updatedSubject.replace(regex, val || `{{${key}}}`);
      updatedHtml = updatedHtml.replace(regex, val || `{{${key}}}`);
    });

    form.setFieldsValue({
      subject: updatedSubject,
      html: updatedHtml
    });
  };

  const handleAttachmentChange = ({ file, fileList }) => {
    // Validate file size (max 10MB)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
      return;
    }

    // Update file list with additional properties
    const updatedFileList = fileList.map(f => {
      if (f.uid === file.uid) {
        return {
          ...f,
          status: 'done',
          url: URL.createObjectURL(f.originFileObj), // Create URL for preview
        };
      }
      return f;
    });

    setAttachments(updatedFileList);
  };

  const renderFieldInput = (field) => {
    switch (field.type) {
      case 'date':
        return (
          <DatePicker
            style={{ width: '100%' }}
            onChange={(date) => handleFieldChange(field.name, date)}
            placeholder={`Select ${field.name.replace(/_/g, ' ')}`}
          />
        );
      case 'time':
        return (
          <TimePicker
            style={{ width: '100%' }}
            format="HH:mm"
            onChange={(time) => handleFieldChange(field.name, time)}
            placeholder={`Select ${field.name.replace(/_/g, ' ')}`}
          />
        );
      default:
        return (
          <Input
            value={templateFields[field.name]}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.name.replace(/_/g, ' ')}`}
          />
        );
    }
  };

  return (
    <Modal
      title={
        <div className="compose-header">
          <FiFileText className="header-icon" />
          <span>{selectedTemplate ? `Compose: ${selectedTemplate.name}` : 'New Message'}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      className="compose-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="compose-form"
      >
        <div className="compose-toolbar">
          <Space>
            <Select
              placeholder="Select email template"
              onChange={handleTemplateSelect}
              allowClear
              style={{ width: '200px' }}
              value={selectedTemplate?.name}
            >
              {Object.entries(emailTemplates).map(([key, template]) => (
                <Option key={key} value={key}>
                  {template.name}
                </Option>
              ))}
            </Select>
            <Upload
              multiple
              fileList={attachments}
              onChange={handleAttachmentChange}
              beforeUpload={() => false}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              showUploadList={false}
            >
              <Button icon={<FiPaperclip />}>
                Attach ({attachments.length})
              </Button>
            </Upload>
            <Button onClick={handleSchedule} icon={<FiClock />}>
              Schedule
            </Button>
            <Checkbox 
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
            >
              Mark as Important
            </Checkbox>
          </Space>
        </div>

        {selectedTemplate && (
          <div className="template-fields">
            {selectedTemplate.fields.map(field => (
              <Form.Item key={field.name} label={field.name.replace(/_/g, ' ').toUpperCase()}>
                {renderFieldInput(field)}
              </Form.Item>
            ))}
          </div>
        )}

        <Form.Item
          name="to"
          rules={[{ required: true, message: 'Please enter recipient email' }]}
        >
          <Input placeholder="To:" />
        </Form.Item>

        <Form.Item
          name="subject"
          rules={[{ required: true, message: 'Please enter subject' }]}
        >
          <Input placeholder="Subject" />
        </Form.Item>

        <Form.Item
          name="html"
          rules={[{ required: true, message: 'Please enter email content' }]}
        >
          <TextArea
            placeholder="Write your message here..."
            autoSize={{ minRows: 10 }}
          />
        </Form.Item>

        {attachments.length > 0 && (
          <div className="attachments-preview">
            {attachments.map(file => (
              <div key={file.uid} className="attachment-item">
                <Space>
                  <FiFile />
                  <span>{file.name}</span>
                  <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                  <Button
                    type="text"
                    icon={<FiX />}
                    onClick={() => {
                      setAttachments(prev => prev.filter(f => f.uid !== file.uid));
                      URL.revokeObjectURL(file.url); // Clean up the URL
                    }}
                  />
                </Space>
              </div>
            ))}
          </div>
        )}

        <Form.Item className="form-actions">
          <Space>
            <Button type="primary" htmlType="submit">
              Send
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <style jsx>{`
        .attachments-preview {
          margin-bottom: 16px;
          padding: 8px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        .attachment-item {
          padding: 8px;
          border-bottom: 1px solid #e8e8e8;
        }
        .attachment-item:last-child {
          border-bottom: none;
        }
        .file-size {
          color: #8c8c8c;
          font-size: 12px;
        }
      `}</style>
    </Modal>
  );
};

export default ComposeModal;