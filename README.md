# Frontend Project Structure and Conventions

## Directory Structure

```
frontend/
├── src/
│   ├── components/           # Reusable components
│   │   └── button/          # Example component
│   │       ├── index.jsx    # Component code
│   │       └── button.scss  # Component styles
│   │
│   ├── auth/               # Authentication related components and services
│   │   ├── services/      # Auth services directory
│   │   │   ├── authApi.js    # Auth API calls
│   │   │   └── authSlice.js  # Auth state management
│   │   │
│   │   ├── login/         # Login page component
│   │   │   ├── index.jsx
│   │   │   └── login.scss
│   │   │
│   │   ├── forgotPassword/  # Forgot password component
│   │   │   ├── index.jsx
│   │   │   └── forgotPassword.scss
│   │   │
│   │   └── otp/           # OTP verification component
│   │       ├── index.jsx
│   │       └── otp.scss
│   │
│   ├── superadmin/        # Super Admin section
│   │   ├── layout/        # Layout components for superadmin
│   │   │   ├── header/    # Header component
│   │   │   │   ├── index.jsx
│   │   │   │   └── header.scss
│   │   │   ├── sidebar/   # Sidebar component
│   │   │   │   ├── index.jsx
│   │   │   │   └── sidebar.scss
│   │   │   └── footer/    # Footer component
│   │   │       ├── index.jsx
│   │   │       └── footer.scss
│   │   │
│   │   ├── dashboard/     # Dashboard component
│   │   │   ├── index.jsx
│   │   │   └── dashboard.scss
│   │   │
│   │   └── components/    # Superadmin-specific components
│   │       └── stats/     # Example: Stats component
│   │           ├── index.jsx
│   │           └── stats.scss
│   │
│   ├── pages/              # Page components
│   │   └── dashboard/      # Example page
│   │       ├── index.jsx   # Page component
│   │       └── dashboard.scss  # Page styles
│   │
│   ├── services/          # Global services
│   │   └── user/         # User related services
│   │       ├── userApi.js
│   │       └── userSlice.js
│   │
│   ├── layouts/          # Layout components
│   ├── assets/          # Static assets (images, fonts)
│   ├── utils/           # Utility functions
│   └── constants/       # Constants and configurations
```

## Naming Conventions

### Files and Folders
1. Use lowercase for folder names
2. Use camelCase for multiple word folders
   - ✅ `forgotPassword/`
   - ❌ `ForgotPassword/` or `forgot-password/`

3. Component files should be named `index.jsx`
4. Style files should match the folder name: `folderName.scss`
   - Example: `login/login.scss`

### Feature-Based Organization (Example: Auth)
1. Group related features in their own directory
2. Keep services close to their features
3. Follow consistent naming patterns:

```
auth/
├── services/              # Auth-specific services
│   ├── authApi.js        # API calls for auth
│   └── authSlice.js      # Redux slice for auth state
│
├── login/                # Login feature
│   ├── index.jsx        # Login component
│   └── login.scss       # Login styles
│
├── forgotPassword/       # Forgot password feature
│   ├── index.jsx        # Forgot password component
│   └── forgotPassword.scss  # Forgot password styles
│
└── otp/                 # OTP verification feature
    ├── index.jsx        # OTP component
    └── otp.scss         # OTP styles
```

### Components
1. Use functional components with arrow functions
2. Export as default
3. Use PascalCase for component names

```jsx
// ✅ Correct - Auth Component Example
const Login = () => {
  return <div>Login Form</div>;
};

export default Login;

// ❌ Incorrect
function login() {
  return <div>Login Form</div>;
}
```

### Services
1. Place feature-specific services in the feature's services directory
2. Use clear, descriptive names for API and slice files
3. Follow the naming pattern:
   - API files: `featureApi.js` (e.g., `authApi.js`)
   - Redux slices: `featureSlice.js` (e.g., `authSlice.js`)

Example Auth Service Structure:
```javascript
// authApi.js
import { createApi } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  endpoints: (builder) => ({
    login: builder.mutation({
      // login implementation
    }),
    forgotPassword: builder.mutation({
      // forgot password implementation
    })
  })
});

// authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null
  },
  reducers: {
    // auth reducers
  }
});
```

## Code Style Guidelines

1. Use ES6+ features
2. Use destructuring for props
3. Use proper indentation (2 spaces)
4. Add JSDoc comments for complex functions
5. Use meaningful variable names

```jsx
// ✅ Correct
const LoginForm = ({ onSubmit, isLoading }) => {
  return (
    <div className="login-form">
      <h2>Login</h2>
      {/* form implementation */}
    </div>
  );
};

// ❌ Incorrect
const LoginForm = (props) => {
  return (
    <div>
      <h2>{props.title}</h2>
      {/* form implementation */}
    </div>
  );
};
