import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/Home/index.jsx'
import Signin from '../pages/Auth/Signin.jsx'
import Signup from '../pages/Auth/Signup.jsx'
import OTPVerification from '../pages/Auth/OTPVerification.jsx'
import ForgotPassword from '../pages/Auth/ForgotPassword.jsx'
import ResetPassword from '../pages/Auth/ResetPassword.jsx'
import PublicPricing from '../pages/Pricing/index.jsx'

import ProtectedRoute from '../components/Auth/ProtectedRoute.jsx'
import PersistLogin from '../components/Auth/PersistLogin.jsx'
import DashboardLayout from '../components/Layout/DashboardLayout.jsx'
import Overview from '../pages/Dashboard/Overview.jsx'
import Profile from '../pages/Dashboard/Profile.jsx'
import MonthlyTarget from '../pages/Dashboard/MonthlyTarget.jsx'
import DailyInput from '../pages/Dashboard/DailyInput.jsx'
import TargetAnalysis from '../pages/Dashboard/TargetAnalysis.jsx'
import DailyReport from '../pages/Dashboard/Insights/DailyReport.jsx'
import MonthlyReport from '../pages/Dashboard/Insights/MonthlyReport.jsx'
import AnnualReport from '../pages/Dashboard/Insights/AnnualReport.jsx'
import Workspace from '../pages/Dashboard/Workspace/index.jsx'
import Plans from '../pages/Dashboard/Plans/index.jsx'
import Success from '../pages/Dashboard/Plans/Success.jsx'
import PlansManager from '../pages/Admin/PlansManager.jsx'
import UsersManager from '../pages/Admin/UsersManager.jsx'
import ExpertsManager from '../pages/Admin/ExpertsManager.jsx'
import ExpertCalendar from '../pages/Expert/ExpertCalendar.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pricing" element={<PublicPricing />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<OTPVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Dashboard Routes */}
      <Route element={<PersistLogin />}>
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="target/monthly" element={<MonthlyTarget />} />
            <Route path="target/daily" element={<DailyInput />} />
            <Route path="target/analysis" element={<TargetAnalysis />} />
            <Route path="insights/daily" element={<DailyReport />} />
            <Route path="insights/monthly" element={<MonthlyReport />} />
            <Route path="insights/annual" element={<AnnualReport />} />
            <Route path="workspace" element={<Workspace />} />
            <Route path="plans" element={<Plans />} />
            <Route path="plans/success" element={<Success />} />
            {/* Admin Management Routes */}
            <Route path="plans-manager" element={<PlansManager />} />
            <Route path="users-manager" element={<UsersManager />} />
            <Route path="experts-manager" element={<ExpertsManager />} />
            {/* Expert Management Routes */}
            <Route path="expert-calendar" element={<ExpertCalendar />} />
            {/* <Route path="settings" element={<Settings />} /> */}
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
