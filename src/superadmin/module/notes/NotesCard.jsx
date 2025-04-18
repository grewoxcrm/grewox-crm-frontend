import React, { useState } from "react";
import {
  Card,
  Button,
  Dropdown,
  Avatar,
  Typography,
  Modal,
  Descriptions,
} from "antd";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiLogIn,
  FiArrowUp,
  FiMoreVertical,
  FiPhone,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiMapPin,
  FiGlobe,
  FiDollarSign,
  FiCreditCard,
  FiUser,
} from "react-icons/fi";
import moment from "moment";
import EditCompany from "./EditNotes";

const { Text } = Typography;

const CompanyCard = ({ company, onView, onEdit, onDelete }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
  };

  // Menu items for the dropdown
  const actionItems = [
    {
      key: "view",
      icon: <FiEye />,
      label: "View Details",
      onClick: () => setDetailsModalVisible(true),
    },
    {
      key: "edit",
      icon: <FiEdit2 />,
      label: "Edit Company",
      onClick: handleEdit,
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      icon: <FiTrash2 />,
      label: "Delete Company",
      danger: true,
      onClick: () => onDelete(company),
    },
  ];

  // Determine status color and icon
  const statusConfig = {
    active: {
      color: "#52c41a",
      icon: <FiCheckCircle style={{ marginRight: 5 }} />,
    },
    inactive: {
      color: "#ff4d4f",
      icon: <FiXCircle style={{ marginRight: 5 }} />,
    },
  };

  const status = company.status || "inactive";
  const statusInfo = statusConfig[status];

  return (
    <>
      <Card
        className="company-card"
        hoverable
        bodyStyle={{ padding: 0 }}
        style={{
          width: "100%",
          height: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
        extra={
          <Dropdown
            menu={{
              items: actionItems,
              style: {
                borderRadius: "8px",
                padding: "4px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
              },
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<FiMoreVertical style={{ fontSize: "20px" }} />}
              className="more-actions-button"
              style={{
                width: "32px",
                height: "32px",
                color: "rgba(255, 255, 255, 0.95)",
                padding: 0,
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                border: "none",
                position: "absolute",
                right: "16px",
                top: "16px",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            />
          </Dropdown>
        }
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            borderRadius: "8px 8px 0 0",
            padding: "24px",
            position: "relative",
            overflow: "hidden",
            minHeight: "120px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)",
              zIndex: 1,
            }}
          />
          <div
            className="company-card-header"
            style={{ position: "relative", zIndex: 2 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Avatar
                size={64}
                src={company.profilePic}
                style={{
                  border: "3px solid rgba(255, 255, 255, 0.8)",
                  backgroundColor: "#1677ff",
                  fontSize: "24px",
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  flexShrink: 0,
                }}
              >
                {company.firstName
                  ? `${company.firstName[0]}${company.lastName[0]}`
                  : company.name[0]}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#fff",
                    display: "block",
                    marginBottom: "4px",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {company.firstName
                    ? `${company.firstName} ${company.lastName}`
                    : company.name}
                </Text>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    color: "#fff",
                  }}
                >
                  {statusInfo.icon}
                  <span style={{ marginLeft: "4px" }}>
                    {status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {[
              {
                icon: <FiUser size={14} />,
                label: "Username",
                value: company.name,
              },
              {
                icon: <FiPhone size={14} />,
                label: "Phone",
                value: `+${company.phoneCode} ${company.phone}`,
              },
              {
                icon: <FiMail size={14} />,
                label: "Email",
                value: company.email,
                span: 2,
                isLink: true,
              },
              {
                icon: <FiMapPin size={14} />,
                label: "Location",
                value: `${company.city}, ${company.state}`,
              },
              {
                icon: <FiCalendar size={14} />,
                label: "Created",
                value: moment(company.created_at).format("MMM DD, YYYY"),
              },
            ].map((item, index) => (
              <div
                key={index}
                className="info-card"
                style={{
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e6e8eb",
                  gridColumn: item.span ? `span ${item.span}` : "auto",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#1890ff",
                    background: "#f0f7ff",
                  },
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                    color: "#8c8c8c",
                  }}
                >
                  {item.icon}
                  <span style={{ fontSize: "12px" }}>{item.label}</span>
                </div>
                {item.isLink ? (
                  <a
                    href={`mailto:${item.value}`}
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#1890ff",
                      textDecoration: "none",
                      display: "block",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.value}
                  </a>
                ) : (
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.value}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              type="primary"
              icon={<FiEye style={{ fontSize: "16px" }} />}
              onClick={() => setDetailsModalVisible(true)}
              style={{
                flex: 1,
                height: "40px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                boxShadow: "0 2px 8px rgba(24, 144, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)";
              }}
            >
              View Details
            </Button>
            <Button
              onClick={handleEdit}
              icon={<FiEdit2 style={{ fontSize: "16px" }} />}
              style={{
                height: "40px",
                width: "40px",
                borderRadius: "8px",
                border: "1px solid #e6e8eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#1890ff";
                e.currentTarget.style.color = "#1890ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e6e8eb";
                e.currentTarget.style.color = "rgba(0, 0, 0, 0.88)";
              }}
            />
          </div>
        </div>
      </Card>

      <Modal
        title="Company Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={700}
        className="company-details-modal"
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Company Name" span={2}>
            {company.name}
          </Descriptions.Item>
          <Descriptions.Item label="First Name">
            {company.firstName}
          </Descriptions.Item>
          <Descriptions.Item label="Last Name">
            {company.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={2}>
            {company.email}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            +{company.phoneCode} {company.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <span style={{ color: statusInfo.color }}>
              {statusInfo.icon}
              {status.toUpperCase()}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Bank Details" span={2}>
            <div style={{ marginBottom: "8px" }}>
              <strong>Bank Name:</strong> {company.bankname}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Account Holder:</strong> {company.accountholder}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Account Number:</strong> {company.accountnumber}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Account Type:</strong> {company.accounttype}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>IFSC:</strong> {company.ifsc}
            </div>
            <div>
              <strong>Branch:</strong> {company.banklocation}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="GST Number" span={2}>
            {company.gstIn}
          </Descriptions.Item>
          <Descriptions.Item label="Website" span={2}>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {company.website}
              </a>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Address" span={2}>
            {company.address}
            <br />
            {company.city}, {company.state}
            <br />
            {company.country} - {company.zipcode}
          </Descriptions.Item>

          <Descriptions.Item label="Created At" span={2}>
            {moment(company.created_at).format("MMMM DD, YYYY, h:mm A")}
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      <EditCompany
        visible={editModalVisible}
        onCancel={handleEditCancel}
        initialValues={company}
        loading={false}
      />
    </>
  );
};

export default CompanyCard;
