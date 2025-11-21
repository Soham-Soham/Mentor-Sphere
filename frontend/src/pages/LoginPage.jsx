import React, { useEffect } from 'react';
import {Link, useNavigate} from "react-router-dom";
import { useState } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sun, Moon, Lock, Mail } from 'lucide-react';
import loginImage from "../assets/login.png";
import axios from 'axios';

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setisDarkMode] = useState(true)
    const [errorMsg,setErrorMsg] = useState();

    const user = useSelector((state)=> state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // theme(dark/light)
    useEffect(()=>{
      if(isDarkMode){
        document.documentElement.classList.add("dark")
      }else{
        document.documentElement.classList.remove("dark")
      }
    },[isDarkMode])

    useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/me`, { withCredentials: true });
        dispatch(setUser(res.data.user));
        navigate("/dashboard")
      } catch (error) {
        console.log(error);
        setErrorMsg(error?.message)
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (!user) {
      checkAuth();
    }else{
      navigate("/dashboard");
    }
  }, [user,dispatch,navigate]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormError("");
      setIsLoading(true);

      if (!email || !password) {
        setFormError("Please enter both email and password.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/login`, { email, password }, {
          withCredentials: true
        });
        // console.log(res.data);
        dispatch(setUser(res.data.user));
        navigate("/dashboard");
      } catch (error) {
        console.log("Login error:", error);
        setFormError(error?.response?.data?.message || "Login failed. Please check your credentials.");
      } finally {
        setIsLoading(false);
      }
    };

    const toggleTheme = ()=>{
        setisDarkMode(!isDarkMode);
    }

    return (
      <div className="min-h-screen flex items-center justify-center gap-5 bg-gray-100 dark:bg-teal-900 transition-colors duration-500 p-4">
        <div className=' hidden md:block'>
          <img src={loginImage} alt="login image" />
        </div>
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-500">
          
          {/* Back and Theme buttons */}
          <div className="absolute top-6 left-6">
            <button
              onClick={() => navigate('/')} // This is a placeholder for a real back function
              className="p-2 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
          <div className="absolute top-6 right-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              aria-label="Toggle dark/light mode"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          {/* Login Form */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please log in to continue to your dashboard.
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
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {formError && (
                <motion.p
                  className="text-sm text-red-500 text-center -mt-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {formError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white bg-teal-500 hover:bg-teal-600 font-semibold py-3 rounded-xl shadow-lg dark:bg-teal-700 dark:hover:bg-teal-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-col items-center mt-6 text-sm">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-indigo-600 dark:text-indigo-400 hover:underline mb-2"
            >
              Forgot Password?
            </button>
            <p className="text-gray-600 dark:text-gray-400">
              Don’t have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    );
}

export default LoginPage