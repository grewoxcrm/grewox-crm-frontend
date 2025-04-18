import { createBrowserRouter } from "react-router-dom";
import Login from "../auth/login";
import AuthRedirect from "./AuthRedirect/index.jsx";
import DashboardLayout from "../dashboard/layout";
import Dashboard from "../dashboard";
import SuperAdminLayout from "../superadmin/layout";
import SuperAdminDashboard from "../superadmin/module/dashboard";
import Company from "../superadmin/module/company";
import Policy from "../superadmin/module/policy";
import Profile from "../superadmin/module/profile/index.jsx";
import SuperAdminCurrencies from "../superadmin/module/settings/currencies/index.jsx";
import SuperAdminCountries from "../superadmin/module/settings/countries/index.jsx";
import SuperAdminESignature from "../superadmin/module/settings/eSignature/index.jsx";
import Currencies from "../dashboard/module/settings/currencies/index.jsx";
import Countries from "../dashboard/module/settings/countries/index.jsx";
import ESignature from "../dashboard/module/settings/eSignature/index.jsx";
import Plans from "../superadmin/module/plans/index.jsx";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "../auth/forgot-password";
import Branch from "../dashboard/module/hrm/Branch";
import OTPVerification from "../auth/otp";
import ResetPassword from "../auth/resend";
import RoleBasedRoute from "./RoleBasedRoute";
import Notes from "../superadmin/module/notes/index.jsx";
import Inquiry from "../superadmin/module/inquary/index.jsx";
import FormSubmitted from "../dashboard/module/crm/generate-link/FormSubmitted.jsx";
import Designation from "../dashboard/module/hrm/Designation";
import Department from "../dashboard/module/hrm/Department";
import Training from "../dashboard/module/hrm/Training";
import Document from "../dashboard/module/hrm/Document";
import Announcement from "../dashboard/module/hrm/Announcement";
import Role from "../dashboard/module/hrm/role";
import Users from "../dashboard/module/user-management/users/index.jsx";
import Employee from "../dashboard/module/hrm/Employee/index.jsx";
import Job from "../dashboard/module/job/jobs/index.jsx";
import JobCandidates from "../dashboard/module/job/job candidates/index.jsx";
import JobOnboarding from "../dashboard/module/job/job onboarding/index.jsx";
import JobApplications from "../dashboard/module/job/job applications/index.jsx";
import OfferLetters from "../dashboard/module/job/offer letters/index.jsx";
import Interviews from "../dashboard/module/job/interviews/index.jsx";
import Lead from "../dashboard/module/crm/lead/index.jsx";
import Deal from "../dashboard/module/crm/deal/index.jsx";
import CompanyLinkGenerator from "../dashboard/module/crm/generate-link/index.jsx";
import PublicFormView from "../dashboard/module/crm/generate-link/PublicFormView.jsx";
import Crmsystem from "../dashboard/module/crm/crmsystem/index.jsx";
import Task from "../dashboard/module/crm/task/index.jsx";
import Customer from "../dashboard/module/sales/customer/index.jsx";
import Invoice from "../dashboard/module/sales/invoice/index.jsx";
import ProductServices from "../dashboard/module/sales/product&services/index.jsx";
import Meeting from "../dashboard/module/hrm/Meeting/index.jsx";
import Revenue from "../dashboard/module/sales/revenue/index.jsx";
import CreditNotes from "../dashboard/module/sales/creditnotes/index.jsx";
import Calendar from "../dashboard/module/communication/calendar/index.jsx";
import TaskCalendar from "../dashboard/module/crm/taskcalendar/index.jsx";
import SubscribedUser from "../superadmin/module/SubscribedUser/index.jsx";
import Tickets from "../dashboard/module/support/ticket/index.jsx";
import Proposal from "../dashboard/module/crm/proposal/index.jsx";
import Tax from "../dashboard/module/settings/tax/index.jsx";
import Attendance from "../dashboard/module/hrm/Attendance/index.jsx";
import Leave from "../dashboard/module/hrm/leave/index.jsx";
import DealDetail from "../dashboard/module/crm/deal/DealDetail.jsx";
import LeadOverview from "../dashboard/module/crm/lead/overview/index.jsx";
import Holiday from "../dashboard/module/hrm/Holiday/index.jsx";
import Salary from "../dashboard/module/hrm/payRoll/index.jsx";
import Chat from "../dashboard/module/communication/chat/index.jsx";
import Vendor from "../dashboard/module/purchase/vendor/index.jsx";
import Billing from "../dashboard/module/purchase/billing/index.jsx";
import DebitNote from "../dashboard/module/purchase/debitnote/index.jsx";
import Mail from "../dashboard/module/communication/mail/mail.jsx";
import Profiles from "../dashboard/module/profile/index.jsx";
import CompanyAccount from "../dashboard/module/crm/companyacoount/index.jsx";
import Contact from "../dashboard/module/crm/contact/index.jsx";
import CompanyAccountDetails from "../dashboard/module/crm/companyacoount/CompanyAccountDetails.jsx";
import ContactDetailsOverview from "../dashboard/module/crm/contact/ContactDetails.jsx";
import FormSubmissions from "../dashboard/module/crm/generate-link/FormSubmissions.jsx";
import GeneralSettings from "../superadmin/module/settings/general/index.jsx";
import Payment from "../dashboard/module/settings/payment/index.jsx";
import Storage from "../superadmin/module/storage/index.jsx";

const PermissionRoute = ({ children, permissionKey }) => {
  const userRole = useSelector(selectUserRole);
  const permissions = parsePermissions(userRole?.permissions);

  if (!hasPermission(permissions, permissionKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/form-submitted",
    element: <FormSubmitted />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/otp",
    element: <OTPVerification />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/auth-redirect",
    element: (
      <ProtectedRoute>
        <AuthRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <RoleBasedRoute>
          <DashboardLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      // {
      //   path: "/dashboard/clients",
      //   element: <SubClient />,
      // },
      {
        path: "/dashboard/profile",
        element: <Profiles />,
      },
      {
        path: "customers",
        element: <div>Customers Page</div>,
      },
      {
        path: "products",
        element: <div>Products Page</div>,
      },
      {
        path: "analytics",
        element: <div>Analytics Page</div>,
      },
      {
        path: "hrm",
        children: [
          {
            path: "employee",
            element: <Employee />,
          },
          {
            path: "payroll",
            element: <Salary />,
          },
          {
            path: "leave",
            element: <Leave />,
          },
          {
            path: "branch",
            element: <Branch />,
          },
          {
            path: "designation",
            element: <Designation />,
          },
          {
            path: "department",
            element: <Department />,
          },
          {
            path: "training",
            element: <Training />,
          },
          {
            path: "document",
            element: <Document />,
          },
          {
            path: "announcement",
            element: <Announcement />,
          },
          {
            path: "role",
            element: <Role />,
          },
          {
            path: "meeting",
            element: <Meeting />,
          },
          {
            path: "attendance",
            element: <Attendance />
          },
          {
            path: "holiday",
            element: <Holiday />
          }
        ],
      },
      {
        path: "job",
        children: [
          {
            path: "jobs",
            element: <Job />,
          },
          {
            path: "job-candidates",
            element: <JobCandidates />,
          },
          {
            path: "job-onboarding",
            element: <JobOnboarding />,
          },
          {
            path: "job-applications",
            element: <JobApplications />,
          },
          {
            path: "offer-letters",
            element: <OfferLetters />,
          },
          {
            path: "interviews",
            element: <Interviews />,
          },
        ],
      },
      {
        path: "crm",
        children: [
          {
            path: "lead",
            children: [
              {
                path: "",
                element: <Lead />,
              },
              {
                path: ":leadId",
                element: <LeadOverview />,
              },
            ],
          },
          {
            path: "deals",
            children: [
              {
                path: "",
                element: <Deal />,
              },
              {
                path: ":dealId",
                element: <DealDetail />,
              },
            ],
          },
          // {
          //   path: "project",
          //   children: [
          //     {
          //       path: "",
          //       element: <Project />,
          //     },
          //     {
          //       path: ":projectId",
          //       element: <ProjectDetail />,
          //     },
          //   ],
          // },
          {
            path: "company-account",
            children: [
              {
                path: "",
                element: <CompanyAccount />,
              },
              {
                path: ":accountId",
                element: <CompanyAccountDetails />,
              },
            ],
          },
          {
            path: "contact",
            children: [
              {
                path: "",
                element: <Contact />,
              },
              {
                path: ":contactId",
                element: <ContactDetailsOverview />,
              },
            ],
          },
          // {
          //   path: "company-inquiry",
          //   element: <CompanyInquiry />,
          // },
          {
            path: "custom-form",
            children: [
              {
                path: "",
                element: <CompanyLinkGenerator />,
              },
              {
                path: ":formId/submissions",
                element: <FormSubmissions />,
              },
            ],
          },
          {
            path: "proposal",
            element: <Proposal />,
          },
          {
            path: "proposal",
            element: <Proposal />,
          },
          {
            path: "tasks",
            element: <Task />,
          },
          {
            path: "task-calendar",
            element: <TaskCalendar />,
          },
        ],
      },
      {
        path: "purchase",
        children: [
          {
            path: "vendor",
            element: <Vendor />,
          },
          {
            path: "billing",
            element: <Billing />,
          },
          {
            path: "debit-note",
            element: <DebitNote />
          }
        ]
      },
      {
        path: "sales",
        children: [
          {
            path: "product-services",
            element: <ProductServices />,
          },

          {
            path: "customer",
            element: <Customer />,
          },
          {
            path: "invoice",
            element: <Invoice />,
          },
          {
            path: "revenue",
            element: <Revenue />,
          },
          {
            path: "credit-notes",
            element: <CreditNotes />,
          },
        ],
      },
      {
        path: "communication",
        children: [
          {
            path: "chat",
            element: <Chat />,
          },
          {
            path: "mail",
            element: <Mail />,
          },
          {
            path: "calendar",
            element: <Calendar />,
          },
        ],
      },
      {
        path: "user-management/users",
        element: <Users />,
      },
      {
        path: "support",
        children: [
          {
            path: "ticket",
            element: <Tickets />,
          },
        ],
      },
      {
        path: "settings/general",
        element: <GeneralSettings />,
      },
      {
        path: "settings/payment",
        element: <Payment />,
      },
      {
        path: "settings/currencies",
        element: <Currencies />,
      },
      {
        path: "settings/countries",
        element: <Countries />,
      },
      {
        path: "settings/esignature",
        element: <ESignature />,
      },
      {
        path: "settings/tax",
        element: <Tax />,
      },
      {
        path: "help",
        element: <div>Help & Support Page</div>,
      },
      {
        path: "crm-setup",
        element: <Crmsystem />,
      },
    ],
  },
  {
    path: "/superadmin",
    element: (
      <ProtectedRoute>
        <RoleBasedRoute>
          <SuperAdminLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <SuperAdminDashboard />,
      },
      {
        path: "dashboard",
        element: <SuperAdminDashboard />,
      },
      {
        path: "company",
        element: <Company />,
      },
      {
        path: "notes",
        element: <Notes />,
      },
      {
        path: "policy",
        element: <Policy />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "plans",
        element: <Plans />,
      },
      {
        path: "storage",
        element: <Storage />,
      },
      {
        path: "subscribed-user",
        element: <SubscribedUser />,
      },
      {
        path: "settings/currencies",
        element: <SuperAdminCurrencies />,
      },
      {
        path: "settings/countries",
        element: <SuperAdminCountries />,
      },
      {
        path: "settings/esignature",
        element: <SuperAdminESignature />,
      },
      {
        path: "inquiry",
        element: <Inquiry />,
      },
      // {
      //   path: "notes",
      //   element: <Notes />,
      // },
      // {
      //   path: "policy",
      //   element: <Policy />,
      // },
      // {
      //   path: "profile",
      //   element: <Profile />,
      // },
      // {
      //   path: "plans",
      //   element: <Plans />,
      // },
      // {
      //   path: "settings/currencies",
      //   element: <Currencies />,
      // },
      // {
      //   path: "settings/countries",
      //   element: <Countries />,
      // },
      // {
      //   path: "settings/esignature",
      //   element: <ESignature />,
      // },
      // {
      //   path: "inquiry",
      //   element: <Inquiry />,
      // },
    ],
  },
  {
    path: "/superadmin/storage",
    element: (
      <RoleBasedRoute allowedRoles={["super-admin"]}>
        <Storage />
      </RoleBasedRoute>
    ),
  },
  {
    path: "/forms/:formId",
    element: <PublicFormView />,
  },
]);

export default routes;
