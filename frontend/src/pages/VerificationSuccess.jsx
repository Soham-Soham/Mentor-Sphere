import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Moon, Sun, XCircle } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react'

const VerificationSuccess = () => {
    const [verified, setVerified] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDark] = useState(false);

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const checkVerified = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/verify/${params.token}`, { withCredentials: true });

                setVerified(true);
                setErrorMsg(null);
            } catch (error) {
                setVerified(false);
                setErrorMsg(error?.response?.data?.message || "Something went wrong. The link may have expired or is invalid.");
            } finally {
                setIsLoading(false);
            }
        };
        checkVerified();
    }, [params.token]);

    const toggleTheme = () => {

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-500 px-4">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 text-center transition-all duration-500">
                <div className="absolute top-6 right-6">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                        aria-label="Toggle dark/light mode"
                    >
                        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                </div>

                <div className="mt-8">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-16 h-16 border-4 border-t-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your email...</p>
                            </motion.div>
                        ) : verified ? (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="flex flex-col items-center"
                            >
                                <CheckCircle className="text-green-500 w-20 h-20 mb-4" />
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Email Verified!</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Your email has been successfully verified. You can now log in and start using the app.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="failure"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="flex flex-col items-center"
                            >
                                <XCircle className="text-red-500 w-20 h-20 mb-4" />
                                <h2 className="text-3xl font-bold text-red-500 mb-2">Email Not Verified!</h2>
                                <p className="text-red-600 dark:text-red-400 mb-6">
                                    {errorMsg}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.button
                    onClick={() => navigate('/login')}
                    className={`w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                >
                    Go to Login
                </motion.button>
            </div>
        </div>
    );
};

export default VerificationSuccess;
