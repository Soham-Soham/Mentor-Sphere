import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import Dashboard from '../layout/Dashboard'
import CodeEditor from '../components/CodeEditor'
import Profile from '../components/Profile'
import Participants from '../components/Participants'
import JoinRoom from '../components/JoinRoom'
import CreateRoom from '../components/CreateRoom'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import VerificationSuccess from '../pages/VerificationSuccess'
import CodeHistory from '../components/CodeHistory'
import VideoRoom from '../components/VideoRoom'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/reset-password/:resetToken"
          element={<ResetPasswordPage />}
        />
        <Route
          path="/email-verification/:token"
          element={<VerificationSuccess />}
        />
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />}>
            <Route index element={<Navigate to="codeEditor" />} />
            <Route path="codeEditor" element={<CodeEditor />} />
            <Route path="videoRoom" element={<VideoRoom />} />
            <Route path="history" element={<CodeHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="participants" element={<Participants />} />
            <Route path="joinRoom" element={<JoinRoom />} />
            <Route path="createRoom" element={<CreateRoom />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}