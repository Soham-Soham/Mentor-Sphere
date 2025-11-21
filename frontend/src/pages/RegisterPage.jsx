import React from 'react'
import { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ArrowLeft, Mail, Lock, User, Camera } from 'lucide-react';
import registerImage from "../assets/register.png";
import axios from 'axios';
 
function RegisterPage() {
 const [formData, setFormData] = useState({
      name: "", email: "", password: "", avatar: null,
    });
    const [formError, setFormError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode,setIsDark] = useState(true);

    const navigate = useNavigate();

    const handleChange = (e) => {
      const { name, value, files } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormError("");
      setIsLoading(true);

      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      if (formData.avatar) {
        data.append('avatar', formData.avatar);
      }

      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/register`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        console.log(res.data);
        // On success, navigate to the login page
        navigate("/login");
      } catch (error) {
        console.log("Registration error:", error);
        setFormError(error?.response?.data?.message || "Registration failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    // theme(dark/light)
        useEffect(()=>{
          if(isDarkMode){
            document.documentElement.classList.add("dark")
          }else{
            document.documentElement.classList.remove("dark")
          }
        },[isDarkMode])

    const toggleTheme = ()=>{
      setIsDark(!isDarkMode);
    }

    return (
      <div className="min-h-screen flex items-center justify-center gap-5 p-4 transition-colors duration-500 dark:bg-teal-900">
        <div className=' hidden md:block'>
          <img src={registerImage} alt="" />
        </div>
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transition-all duration-500">
          
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

          {/* Registration Form */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-2">
              Create an Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Join MentorSphere and start collaborating!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="relative">
              <label htmlFor="name" className="sr-only">Name</label>
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Email Input */}
            <div className="relative">
              <label htmlFor="email" className="sr-only">Email</label>
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Avatar Input */}
            <div className="relative">
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="avatar"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 transition-colors duration-300"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {formData.avatar ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold truncate w-32 text-center">
                        {formData.avatar.name}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Camera size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Click to upload
                        </p>
                      </div>
                    )}
                  </div>
                  <input id="avatar" type="file" name="avatar" onChange={handleChange} className="hidden" />
                </label>
              </div>
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

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-teal-700 dark:hover:bg-teal-500"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-col items-center mt-6 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    );
}

export default RegisterPage