import React, { useState } from 'react';
import { List, Avatar, Space, Button, Tooltip, Modal, Typography, Divider, message } from 'antd';
import { FiStar, FiAlertCircle, FiTrash2, FiCornerUpLeft, FiPaperclip, FiDownload, FiFile } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const EmailList = ({ 
  emails, 
  handleStarEmail, 
  handleImportant, 
  handleDelete, 
  handleRestore 
}) => {
  const [selectedEmail, setSelectedEmail] = useState(null);

  const renderEmailActions = (email) => {
    if (email.type === 'trash') {
      return (
        <Space>
          <Tooltip title="Restore">
            <Button
              icon={<FiCornerUpLeft />}
              className="restore-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRestore(email);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete permanently">
            <Button
              danger
              icon={<FiTrash2 />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(email);
              }}
            />
          </Tooltip>
        </Space>
      );
    }

    return (
      <Space>
        <Tooltip title={email.isStarred ? 'Unstar' : 'Star'}>
          <Button
            icon={<FiStar />}
            className={email.isStarred ? 'starred' : ''}
            onClick={(e) => {
              e.stopPropagation();
              handleStarEmail(email);
            }}
          />
        </Tooltip>
        <Tooltip title={email.isImportant ? 'Not important' : 'Mark as important'}>
          <Button
            icon={<FiAlertCircle />}
            className={email.isImportant ? 'important' : ''}
            onClick={(e) => {
              e.stopPropagation();
              handleImportant(email);
            }}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Button
            icon={<FiTrash2 />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(email);
            }}
          />
        </Tooltip>
      </Space>
    );
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleCloseModal = () => {
    setSelectedEmail(null);
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to download attachment');
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'file'; // Default icon if no filename

    try {
      const extension = fileName.split('.').pop().toLowerCase();
      switch (extension) {
        case 'pdf':
          return 'pdf';
        case 'doc':
        case 'docx':
          return 'word';
        case 'xls':
        case 'xlsx':
          return 'excel';
        case 'jpg':
        case 'jpeg':
        case 'png':
          return 'image';
        default:
          return 'file';
      }
    } catch (error) {
      console.error('Error getting file icon:', error);
      return 'file'; // Return default icon if there's an error
    }
  };

  return (
    <>
      <List
        className="mail-list"
        dataSource={emails}
        renderItem={(email) => (
          <List.Item
            className={`mail-item ${email.isRead ? '' : 'unread'} ${email.type === 'trash' ? 'trash' : ''}`}
            actions={[renderEmailActions(email)]}
            onClick={() => handleEmailClick(email)}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta
              avatar={
                <Avatar src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email.from)}&background=1890ff&color=fff`} />
              }
              title={
                <Space size={16}>
                  <Text strong={!email.isRead}>{email.subject}</Text>
                  {email.attachments && email.attachments !== '[]' && (() => {
                    try {
                      // Parse double stringified JSON
                      const firstParse = JSON.parse(email.attachments);
                      const attachments = JSON.parse(firstParse);
                      
                      return (
                        <Space>
                          <FiPaperclip style={{ color: '#8c8c8c' }} />
                          {attachments.map((attachment, index) => (
                            <Text
                              key={index}
                              type="secondary"
                              style={{ cursor: 'pointer', fontSize: '12px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(attachment.url, '_blank');
                              }}
                            >
                              {attachment.name}
                            </Text>
                          ))}
                        </Space>
                      );
                    } catch (error) {
                      console.error('Error parsing attachments:', error);
                      return <FiPaperclip style={{ color: '#8c8c8c' }} />;
                    }
                  })()}
                </Space>
              }
              description={
                <div className="mail-item-content">
                  <Space>
                    <Text type="secondary">{email.from}</Text>
                    <Text type="secondary">→</Text>
                    <Text type="secondary">{email.to}</Text>
                  </Space>
                  <Text type="secondary" className="mail-date">
                    {dayjs(email.createdAt).format('MMM D, YYYY h:mm A')}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title={null}
        open={!!selectedEmail}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        className="email-view-modal"
      >
        {selectedEmail && (
          <div className="email-view">
            <Title level={4}>{selectedEmail.subject}</Title>
            <Space className="email-meta" split={<Divider type="vertical" />}>
              <Text>From: {selectedEmail.from}</Text>
              <Text>To: {selectedEmail.to}</Text>
              <Text>{dayjs(selectedEmail.createdAt).format('MMM D, YYYY h:mm A')}</Text>
            </Space>
            <Divider />
            <div 
              className="email-content"
              dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
            />
            {selectedEmail.attachments && selectedEmail.attachments !== '[]' && (
              <>
                <Divider />
                <div className="email-attachments">
                  <Title level={5}>Attachments</Title>
                  <div className="attachments-list">
                    {(() => {
                      try {
                        // Parse double stringified JSON
                        const firstParse = JSON.parse(selectedEmail.attachments);
                        const attachments = JSON.parse(firstParse);
                        
                        if (!Array.isArray(attachments)) {
                          console.error('Attachments is not an array:', attachments);
                          return null;
                        }

                        return attachments.map((attachment, index) => (
                          <div key={index} className="attachment-item">
                            <Space>
                              <FiFile className={`file-icon ${getFileIcon(attachment.name)}`} />
                              <span 
                                className="attachment-name"
                                style={{ cursor: 'pointer', color: '#1890ff' }}
                                onClick={() => window.open(attachment.url, '_blank')}
                              >
                                {attachment.name}
                              </span>
                              {attachment.size && (
                                <span className="file-size">
                                  ({(attachment.size / 1024).toFixed(1)} KB)
                                </span>
                              )}
                              {/* <Button
                                type="link"
                                icon={<FiDownload />}
                                onClick={() => handleDownloadAttachment(attachment)}
                              >
                                Download
                              </Button> */}
                            </Space>
                          </div>
                        ));
                      } catch (error) {
                        console.error('Error parsing attachments:', error);
                        return null;
                      }
                    })()}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <style jsx>{`
        .email-view {
          padding: 24px;
        }
        .email-meta {
          margin: 16px 0;
        }
        .email-content {
          margin: 16px 0;
          white-space: pre-wrap;
        }
        .attachments-list {
          margin-top: 16px;
        }
        .attachment-item {
          padding: 12px;
          border-radius: 4px;
          background-color: #f8f9fa;
          margin-bottom: 8px;
        }
        .attachment-name {
          font-weight: 500;
        }
        .file-size {
          color: #8c8c8c;
          font-size: 12px;
        }
        .file-icon {
          font-size: 20px;
        }
        .file-icon.pdf {
          color: #ff4d4f;
        }
        .file-icon.word {
          color: #1890ff;
        }
        .file-icon.excel {
          color: #52c41a;
        }
        .file-icon.image {
          color: #722ed1;
        }
      `}</style>
    </>
  );
};

export default EmailList;