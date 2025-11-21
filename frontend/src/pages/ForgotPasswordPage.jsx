import { useState,useEffect } from "react";
import {useNavigate} from "react-router-dom";
import {ArrowLeft,Sun,Moon,Mail} from 'lucide-react'
import {motion,AnimatePresence} from 'motion/react'
import axios from 'axios';

function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isDarkMode,setIsDarkMode] = useState(true);

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
      e.preventDefault();
      setMessage("");
      setIsSuccess(false);
      setIsLoading(true);

      try {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/forgot-password`, { email },{withCredentials:true});
        console.log(`Sending reset link to: ${email}`);
        setMessage("A password reset link has been sent to your email.");
        setIsSuccess(true);
      } catch (error) {
        console.log(error);
        
        setMessage("Failed to send reset link. Please check your email and try again.");
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };

     useEffect(()=>{
          if(isDarkMode){
            document.documentElement.classList.add("dark")
          }else{
            document.documentElement.classList.remove("dark")
          }
     },[isDarkMode])

    const toggleTheme = ()=>{
      setIsDarkMode(!isDarkMode)
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-teal-900 transition-colors duration-500">
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-500 text-center">
          
          {/* Back and Theme buttons */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/login')}
              className="p-2 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              aria-label="Toggle dark/light mode"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          {/* Form and Message */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-2">
              Forgot Password
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email to receive a password reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 duration-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {/* Message Display */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`mt-6 text-sm ${isSuccess ? 'text-green-500' : 'text-red-500'}`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    );
}

export default ForgotPasswordPage