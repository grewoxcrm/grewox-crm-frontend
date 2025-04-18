import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../../auth/services/authSlice';
import {
  FiHome,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiFolder,
  FiDollarSign,
  FiShoppingBag,
  FiShoppingCart,
  FiTarget,
  FiFileText,
  FiCalendar,
  FiMail,
  FiMessageSquare,
  FiUser,
  FiHelpCircle,
  FiGrid,
  FiCheckSquare,
  FiBriefcase,
  FiTrendingUp,
  FiUserCheck,
  FiShield,
  FiMapPin,
  FiTag,
  FiClock,
  FiVideo,
  FiBell,
  FiFile,
  FiEdit3,
  FiBookOpen,
  FiPackage,
  FiGlobe,
  FiPercent,
  FiCreditCard,
  FiTruck,
  FiSliders,
} from "react-icons/fi";
import "./sidebar.scss";
import { useLogout } from "../../../hooks/useLogout";

const Sidebar = ({ collapsed = false, onCollapsedChange = () => { }, rolesData, loggedInUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommunicationOpen, setCommunicationOpen] = useState(false);
  const [isCrmOpen, setCrmOpen] = useState(false);
  const [isUserManagementOpen, setUserManagementOpen] = useState(false);
  const [isHrmOpen, setHrmOpen] = useState(false);
  const [isSupportOpen, setSupportOpen] = useState(false);
  const [isJobOpen, setJobOpen] = useState(false);
  const [isSalesOpen, setSalesOpen] = useState(false);
  const [isPurchaseOpen, setPurchaseOpen] = useState(false);


  const handleLogout = useLogout();

  const userRole = useSelector(selectUserRole);


  // Find user's role data if not client
  const userRoleData = userRole?.toLowerCase() !== 'client' ?
    rolesData?.data?.find(role => role.id === loggedInUser?.role_id) : null;

  // Parse permissions if they exist
  const userPermissions = userRoleData?.permissions ? JSON.parse(userRoleData.permissions) : null;

  const checkPermission = (moduleKey) => {
    // Always allow settings, communication and support modules
    const alwaysAllowedModules = ['settings', 'communication', 'support'];
    if (alwaysAllowedModules.includes(moduleKey?.toLowerCase())) {
      return true;
    }

    // If user is client, show everything
    if (userRole?.toLowerCase() === 'client') {
      return true;
    }

    // For other roles, check specific permissions
    if (!userPermissions) return false;

    // Check if the permission exists and has at least view access
    const modulePermissions = userPermissions[moduleKey];
    if (modulePermissions && modulePermissions.length > 0) {
      return modulePermissions[0].permissions.includes('view');
    }

    return false;
  };

  const shouldShowMenuItem = (item) => {
    // Always show Settings, Communication and Support
    const alwaysShowItems = ['Setting', 'Communication', 'Support'];
    if (alwaysShowItems.includes(item.title)) {
      return true;
    }

    // If role is client, show everything
    if (userRole?.toLowerCase() === 'client') {
      return true;
    }

    if (!item.permission) return true;

    if (item.subItems?.length > 0) {
      // If it's an always shown item, show all its subitems
      if (alwaysShowItems.includes(item.title)) {
        return true;
      }
      // Show if any child has permission
      return item.subItems.some(subItem =>
        !subItem.permission || checkPermission(subItem.permission)
      );
    }

    return checkPermission(item.permission);
  };

  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapsedChange(newCollapsedState);
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <FiHome />,
      path: "/dashboard",
    },
    {
      title: "CRM",
      icon: <FiUsers />,
      isDropdown: true,
      permission: 'dashboards-crm',
      subItems: [
        {
          title: "Leads",
          icon: <FiTarget />,
          path: "/dashboard/crm/lead",
          permission: "dashboards-lead"
        },
        {
          title: "Deals",
          icon: <FiShoppingBag />,
          path: "/dashboard/crm/deals",
          permission: "dashboards-deal"
        },
        // {
        //   title: "Project",
        //   icon: <FiFolder />,
        //   path: "/dashboard/crm/project",
        //   permission: "dashboards-project-list"
        // },
        {
          title: "Company",
          icon: <FiBriefcase />,
          path: "/dashboard/crm/company-account",
          permission: "dashboards-crm-company-account"
        },
        {
          title: "Contact",
          icon: <FiFileText />,
          path: "/dashboard/crm/contact",
          permission: "dashboards-crm-contact"
        },
        {
          title: "Custom Form",
          icon: <FiFileText />,
          path: "/dashboard/crm/custom-form",
          permission: "dashboards-custom-form"
        },
        // {
        //   title: "Inquiry",
        //   icon: <FiMessageSquare />,
        //   path: "/dashboard/crm/company-inquiry",
        //   permission: "dashboards-inquiry"
        // },
        {
          title: "Proposal",
          icon: <FiFileText />,
          path: "/dashboard/crm/proposal",
          permission: "dashboards-proposal"
        },
        {
          title: "Task",
          icon: <FiCheckSquare />,
          path: "/dashboard/crm/tasks",
          permission: "dashboards-task"
        },
        {
          title: "Task Calendar",
          icon: <FiCalendar />,
          path: "/dashboard/crm/task-calendar",
          permission: "dashboards-TaskCalendar"
        },
        {
          title: "CRM System Setup",
          icon: <FiSettings />,
          path: "/dashboard/crm-setup",
          permission: "dashboards-systemsetup"
        }
      ].filter(item => shouldShowMenuItem(item)),
    },
    {
      title: "Sales",
      icon: <FiShoppingCart />,
      isDropdown: true,
      permission: 'dashboards-sales',
      subItems: [
        {
          title: "Product & Services",
          icon: <FiPackage />,
          path: "/dashboard/sales/product-services",
          permission: "dashboards-sales-product-services"
        },
        {
          title: "Customer",
          icon: <FiUsers />,
          path: "/dashboard/sales/customer",
          permission: "dashboards-sales-customer"
        },

        {
          title: "Invoice",
          icon: <FiFileText />,
          path: "/dashboard/sales/invoice",
          permission: "dashboards-sales-invoice"
        },
        {
          title: "Revenue",
          icon: <FiTrendingUp />,
          path: "/dashboard/sales/revenue",
          permission: "dashboards-sales-revenue"
        },
        {
          title: "Credit Notes",
          icon: <FiFile />,
          path: "/dashboard/sales/credit-notes",
          permission: "dashboards-sales-credit-notes"
        }
      ].filter(item => shouldShowMenuItem(item)),
    },
    {
      title: "Purchase",
      icon: <FiShoppingBag />,
      isDropdown: true,
      permission: 'dashboards-purchase',
      subItems: [
        {
          title: "Vendor",
          icon: <FiTruck />,
          path: "/dashboard/purchase/vendor",
          permission: "dashboards-purchase-vendor"
        },
        {
          title: "Billing",
          icon: <FiCreditCard />,
          path: "/dashboard/purchase/billing",
          permission: "dashboards-purchase-billing"
        },
        {
          title: "Debit Note",
          icon: <FiFileText />,
          path: "/dashboard/purchase/debit-note",
          permission: "dashboards-purchase-debit-note"
        }
      ].filter(item => shouldShowMenuItem(item)),
    },
    {
      title: "User Management",
      icon: <FiUsers />,
      isDropdown: true,
      permission: 'extra-users',
      subItems: [
        {
          title: "Users",
          icon: <FiUser />,
          path: "/dashboard/user-management/users",
          permission: "extra-users-list"
        },
        // {
        //   title: "Clients",
        //   icon: <FiBriefcase />,
        //   path: "/dashboard/clients",
        //   permission: "extra-users-client-list"
        // }
      ].filter(item => shouldShowMenuItem(item)),
    },
    {
      title: "Communication",
      icon: <FiMessageSquare />,
      isDropdown: true,
      subItems: [
        {
          title: "Mail",
          icon: <FiMail />,
          path: "/dashboard/communication/mail",

        },
        {
          title: "Chat",
          icon: <FiMessageSquare />,
          path: "/dashboard/communication/chat",

        },
        {
          title: "Calendar",
          icon: <FiCalendar />,
          path: "/dashboard/communication/calendar",

        },
      ].filter(item => shouldShowMenuItem(item)),
    },
    {
      title: "HRM",
      icon: <FiUsers />,
      isDropdown: true,
      permission: 'extra-hrm',
      subItems: [
        {
          title: "Employee",
          icon: <FiUsers />,
          path: "/dashboard/hrm/employee",
          permission: "extra-hrm-employee"
        },
        {
          title: "PayRoll",
          icon: <FiDollarSign />,
          path: "/dashboard/hrm/payroll",
          permission: "extra-hrm-payroll"
        },
        {
          title: "Role",
          icon: <FiShield />,
          path: "/dashboard/hrm/role",
          permission: "extra-hrm-role"
        },
        {
          title: "Branch",
          icon: <FiMapPin />,
          path: "/dashboard/hrm/branch",
          permission: "extra-hrm-branch"
        },
        {
          title: "Designation",
          icon: <FiTag />,
          path: "/dashboard/hrm/designation",
          permission: "extra-hrm-designation"
        },
        {
          title: "Department",
          icon: <FiGrid />,
          path: "/dashboard/hrm/department",
          permission: "extra-hrm-department"
        },
        {
          title: "Attendance",
          icon: <FiClock />,
          path: "/dashboard/hrm/attendance",
          permission: "extra-hrm-attendance-attendancelist"
        },
        {
          title: "Holiday",
          icon: <FiCalendar />,
          path: "/dashboard/hrm/holiday",
          permission: "extra-hrm-holiday"
        },
        {
          title: "Leave Management",
          icon: <FiCalendar />,
          path: "/dashboard/hrm/leave",
          permission: "extra-hrm-leave-leavelist"
        },
        {
          title: "Meeting",
          icon: <FiVideo />,
          path: "/dashboard/hrm/meeting",
          permission: "extra-hrm-meeting"
        },
        {
          title: "Announcement",
          icon: <FiBell />,
          path: "/dashboard/hrm/announcement",
          permission: "extra-hrm-announcement"
        },
        {
          title: "Document",
          icon: <FiFile />,
          path: "/dashboard/hrm/document",
          permission: "extra-hrm-document"
        },
        {
          title: "Training Setup",
          icon: <FiBookOpen />,
          path: "/dashboard/hrm/training",
          permission: "extra-hrm-trainingSetup"
        },
      ].filter(item => shouldShowMenuItem(item)),
    },
    {
      title: "Job",
      icon: <FiBriefcase />,
      isDropdown: true,
      permission: "extra-hrm-jobs-joblist",
      subItems: [
        {
          title: "Jobs",
          icon: <FiBriefcase />,
          path: "/dashboard/job/jobs",
          permission: "extra-hrm-jobs-joblist"
        },
        {
          title: "Job Candidates",
          icon: <FiUsers />,
          path: "/dashboard/job/job-candidates",
          permission: "extra-hrm-jobs-jobcandidate"
        },
        {
          title: "Job On-Boarding",
          icon: <FiUserCheck />,
          path: "/dashboard/job/job-onboarding",
          permission: "extra-hrm-jobs-jobonbording"
        },
        {
          title: "Job Applications",
          icon: <FiFileText />,
          path: "/dashboard/job/job-applications",
          permission: "extra-hrm-jobs-jobapplication"
        },
        {
          title: "Offer Letters",
          icon: <FiFile />,
          path: "/dashboard/job/offer-letters",
          permission: "extra-hrm-jobs-jobofferletter"
        },
        {
          title: "Interviews",
          icon: <FiCalendar />,
          path: "/dashboard/job/interviews",
          permission: "extra-hrm-jobs-interview"
        },
      ].filter(item => shouldShowMenuItem(item)),
    },
    {
      title: 'Setting',
      icon: <FiSettings />,
      isDropdown: true,
      subItems: [
        {
          title: 'General',
          icon: <FiSliders />,
          path: '/dashboard/settings/general'
        },
        {
          title: 'Payment',
          icon: <FiDollarSign />,
          path: '/dashboard/settings/payment'
        },
        {
          title: 'Countries',
          icon: <FiGlobe />,
          path: '/dashboard/settings/countries'
        },
        {
          title: 'Currencies',
          icon: <FiCreditCard />,
          path: '/dashboard/settings/currencies'
        },
        {
          title: 'Tax',
          icon: <FiPercent />,
          path: '/dashboard/settings/tax'
        },
        {
          title: 'ESignature',
          icon: <FiEdit3 />,
          path: '/dashboard/settings/esignature'
        }
      ]
    },
    {
      title: "Support",
      icon: <FiHelpCircle />,
      isDropdown: true,
      subItems: [
        {
          title: "Ticket",
          icon: <FiMessageSquare />,
          path: "/dashboard/support/ticket",

        },
      ],
    },
  ].filter(item => shouldShowMenuItem(item));

  const renderNavItem = (item) => (
    <NavLink
      to={item.path}
      className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
    >
      <div className="nav-item-content">
        <span className="icon">{item.icon}</span>
        {!isCollapsed && <span className="title">{item.title}</span>}
      </div>
    </NavLink>
  );

  const renderDropdown = (item, isOpen, setIsOpen) => (
    <div className={`nav-dropdown ${isOpen ? "open" : ""}`}>
      <div
        className={`nav-item dropdown-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="nav-item-content">
          <span className="icon">{item.icon}</span>
          {!isCollapsed && (
            <>
              <span className="title">{item.title}</span>
              <FiChevronRight className="arrow" />
            </>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <motion.div
          className="dropdown-menu"
          initial={false}
          animate={
            isOpen
              ? {
                opacity: 1,
                height: "auto",
                marginTop: "4px",
                marginBottom: "4px",
                y: 0,
              }
              : {
                opacity: 0,
                height: 0,
                marginTop: 0,
                marginBottom: 0,
                y: -5,
              }
          }
          transition={{
            height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.25, ease: "easeInOut" },
          }}
        >
          {item.subItems.map((subItem, index) => (
            <NavLink
              key={subItem.path || `${item.title}-${index}`}
              to={subItem.path}
              className={({ isActive }) =>
                `nav-item sub-item ${isActive ? "active" : ""}`
              }
            >
              <div className="nav-item-content">
                <span className="icon">{subItem.icon}</span>
                <span className="title">{subItem.title}</span>
              </div>
            </NavLink>
          ))}
        </motion.div>
      )}
    </div>
  );

  return (
    <motion.aside
      className={`superadmin-sidebar ${isCollapsed ? "collapsed" : ""}`}
      initial={false}
    >
      <div className="sidebar-header">
        <div className="logo">{!isCollapsed && <span>Grewox CRM</span>}</div>
        <button className="collapse-btn" onClick={handleToggleCollapse}>
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <motion.div key={item.path || index} initial={false}>
            {!item.isDropdown
              ? renderNavItem(item)
              : item.title === "CRM"
                ? renderDropdown(item, isCrmOpen, setCrmOpen)
                : item.title === "Sales"
                  ? renderDropdown(item, isSalesOpen, setSalesOpen)
                  : item.title === "Purchase"
                    ? renderDropdown(item, isPurchaseOpen, setPurchaseOpen)
                    : item.title === "User Management"
                      ? renderDropdown(
                        item,
                        isUserManagementOpen,
                        setUserManagementOpen
                      )
                      : item.title === "Communication"
                        ? renderDropdown(item, isCommunicationOpen, setCommunicationOpen)
                        : item.title === "HRM"
                          ? renderDropdown(item, isHrmOpen, setHrmOpen)
                          : item.title === "Setting"
                            ? renderDropdown(item, isSettingsOpen, setIsSettingsOpen)
                            : item.title === "Support"
                              ? renderDropdown(item, isSupportOpen, setSupportOpen)
                              : item.title === "Job"
                                ? renderDropdown(item, isJobOpen, setJobOpen)
                                : renderDropdown(item, false, () => { })}
          </motion.div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/dashboard/profile" className="nav-item profile-btn">
          <div className="nav-item-content">
            <span className="icon">
              <FiUser />
            </span>
            {!isCollapsed && <span className="title">Profile</span>}
          </div>
        </NavLink>
        <NavLink
          to="/logout"
          onClick={handleLogout}
          className="nav-item logout-btn"
        >
          <div className="nav-item-content">
            <span className="icon">
              <FiLogOut />
            </span>
            {!isCollapsed && <span className="title">Logout</span>}
          </div>
        </NavLink>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

