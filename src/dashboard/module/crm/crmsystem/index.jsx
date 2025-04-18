import React, { useState } from "react";
import {
  FiList,
  FiLayers,
  FiDatabase,
  FiTag,
  FiBookmark,
  FiFileText,
} from "react-icons/fi";
import Pipeline from "./pipeline";
import LeadStages from "./leadstage/index";
import DealStages from "./dealstage/index";
import "./crmsystem.scss";
import Source from "./souce/index";
import Lable from "./lable/index";
import ContractType from "./contractType";
export default function Crmsystem() {
  const [activeSection, setActiveSection] = useState("Pipeline");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const menuItems = [
    { title: "Pipeline", icon: <FiList /> },
    { title: "Lead Stages", icon: <FiLayers /> },
    { title: "Deal Stages", icon: <FiLayers /> },
    { title: "Sources", icon: <FiDatabase /> },
    { title: "Labels", icon: <FiTag /> },
    { title: "Contract Type", icon: <FiFileText /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "Pipeline":
        return (
          <Pipeline isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        );
      case "Lead Stages":
        return (
          <LeadStages
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        );
      case "Deal Stages":
        return (
          <DealStages
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        );
      case "Sources":
        return (
          <Source isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        );
      case "Labels":
        return (
          <Lable isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        );
      case "Contract Type":
        return (
          <ContractType
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        );
      default:
        return <div>Content for {activeSection} will be implemented soon.</div>;
    }
  };

  return (
    <div className="crm-system-setup">
      <div className="crm-sidebar">
        <div className="sidebar-content">
          {menuItems.map((item) => (
            <div
              key={item.title}
              className={`sidebar-item ${activeSection === item.title ? "active" : ""
                }`}
              onClick={() => setActiveSection(item.title)}
            >
              <span className="icon">{item.icon}</span>
              <span className="title">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="content-area">
        <div className="content-header">
          <h2>{activeSection}</h2>
          {/* <button className="add-button" onClick={() => setIsModalOpen(true)}>
            +
          </button> */}
        </div>
        <div className="content-body">{renderContent()}</div>
      </div>
    </div>
  );
}
