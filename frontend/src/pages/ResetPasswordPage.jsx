import axios from 'axios';
import { useState } from 'react' 
import {useParams,Link, useNavigate} from "react-router-dom"

function ResetPasswordPage() {
  const { resetToken } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message,setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match");

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/reset-password/${resetToken}`,{newPassword:password,confirmPassword:confirmPassword},{withCredentials:true})
      setMessage("Your Password has been reset successfully");
      setTimeout(() => {
        navigate("/login")
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage(error?.response?.data?.message)
    } 
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 shadow-xl rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Reset Password</h2>
        <p className=' text-red-500 font-semibold'>{message}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-2 border rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-2 border rounded mb-4"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
            Reset Password
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPasswordPage