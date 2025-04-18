import React from "react";
import { Card, Button, Typography, Space, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";

const { Text, Paragraph } = Typography;

const PolicyCard = ({ policy, onEdit, onDelete, onView }) => {
  return (
    <Card
      className="policy-card"
      actions={[
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(policy)}
          />
        </Tooltip>,
        <Tooltip title="Edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(policy)}
          />
        </Tooltip>,
        <Tooltip title="Delete">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(policy)}
          />
        </Tooltip>,
      ]}
    >
      <div className="policy-card-content">
        <Space direction="vertical" size={2} style={{ width: "100%" }}>
          <Text strong>{policy.branch}</Text>
          <Text type="secondary">{policy.title}</Text>
          <Paragraph ellipsis={{ rows: 2 }} type="secondary">
            {policy.description || "No description"}
          </Paragraph>
          <Text type="secondary">Created by: {policy.created_by || "N/A"}</Text>
          <Text type="secondary">
            Created: {moment(policy.createdAt).format("YYYY-MM-DD")}
          </Text>
          {policy.file && (
            <Text type="secondary" ellipsis>
              File: {policy.file.split("/").pop()}
            </Text>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default PolicyCard;
