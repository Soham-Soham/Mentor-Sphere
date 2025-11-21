import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {Code,MonitorPlay,LogIn,LinkIcon,Sun,Moon,Twitter,Instagram,Linkedin} from "lucide-react";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/password.png";
import roomImage from "../assets/multiple-user.png";
import collabrateImage from "../assets/negotiation.png";

function LandingPage() {
  const [isDarkMode, setIsDarkmode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkmode(!isDarkMode);

  };

  return (
    <motion.div
      className="min-h-screen transition-colors duration-500 bg-gradient-to-br dark:from-black dark:to-teal-900 dark:text-white from-white to-gray-300 text-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto space-y-20 p-12 font-sans">
        <motion.button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded-full shadow-lg transition-colors duration-300 bg-teal-400 dark:bg-white/10 dark:text-white bg-gray-800/10 text-gray-800"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </motion.button>

        {/* Hero Section */}
        <div className=" text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Collaborate and Create, in Real-Time.
          </motion.h1>
          <motion.p
            className="text-xl md:text-3xl mb-8 font-imFellFrench dark:text-gray-300 text-gray-600"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            MentorSphere is a real-time collaborative code editor that brings
            your team together, no matter where they are.
          </motion.p>
          <motion.button
            onClick={() => navigate("login")}
            className="px-8 py-3 rounded-full font-quintessential font-semibold text-lg shadow-lg transition-all duration-300 transform text-white hover:scale-105 dark:bg-teal-700 dark:text-black dark:hover:bg-teal-300 dark:hover:shadow-teal-300/50 bg-teal-500 hover:bg-teal-600 hover:shadow-teal-600"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Get Started
          </motion.button>
        </div>

        {/* Features Section */}
        <section className="rounded-3xl p-8 lg:p-16 shadow-xl border dark:bg-white/10 backdrop-blur-md dark:border-white/20 bg-white/50 border-gray-300">
          <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 text-center">
            {/* Feature 1 */}
            <motion.div
              className="flex flex-col items-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-4 rounded-full ring-8 ring-teal-500 ring-opacity-20 dark:bg-teal-500/30 bg-teal-500/10 dark:ring-8 dark:ring-teal-200 dark:ring-opacity-5 ">
                <Code
                  size={48}
                  className="dark:text-teal-300 text-teal-600"
                />
              </div>
              <h3 className="text-xl font-semibold">Real-time Code</h3>
              <p className="dark:text-gray-300 text-gray-600 md:text-xl font-imFellFrench">
                Write, edit, and debug code with your team simultaneously. See
                changes instantly as they happen.
              </p>
            </motion.div>

            {/* Feature 2*/}
            <motion.div
              className="flex flex-col items-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="p-4 rounded-full ring-8 ring-teal-500 ring-opacity-20 dark:bg-teal-500/30 bg-teal-500/10 dark:ring-8 dark:ring-teal-200 dark:ring-opacity-5">
                <MonitorPlay
                  size={48}
                  className="dark:text-teal-300 text-teal-600"
                />
              </div>
              <h3 className="text-2xl font-semibold">Live Communication</h3>
              <p className="dark:text-gray-300 md:text-xl text-gray-600 font-imFellFrench">
                Hold video and audio calls right within the editor. Discuss and
                solve problems without leaving your workspace.
              </p>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="text-center">
          <h2 className="text-4xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/*Sign Up */}
            <motion.div
              className=" flex flex-col justify-center items-center space-y-4 rounded-2xl p-8 shadow-lg border dark:bg-white/10 dark:border-white/20 bg-white/50 border-gray-300"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-5 rounded-full ring-8 ring-teal-500 ring-opacity-20 dark:bg-teal-500/30 bg-teal-500/10 dark:ring-8 dark:ring-teal-200 dark:ring-opacity-5 ">
                  <LogIn
                    size={40}
                    className="dark:text-teal-300 text-teal-600"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-semibold">1. Sign Up and Log In</h3>
              <p className="dark:text-gray-300 text-gray-600 md:text-xl font-imFellFrench">
                Quickly create an account or log in with your existing
                credentials. It's fast, secure, and gets you coding in no time.
              </p>
              <div className="h-48 w-48 rounded-lg overflow-hidden text-sm dark:text-gray-400 text-gray-500">
                <img
                  src={loginImage}
                  alt=""
                  className=" w-full h-full"
                />
              </div>
            </motion.div>

            {/*Create or Join */}
            <motion.div
              className=" flex flex-col justify-center items-center space-y-4 rounded-2xl p-8 shadow-lg border dark:bg-white/10 dark:border-white/20 bg-white/50 border-gray-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-5 rounded-full ring-8 ring-teal-500 ring-opacity-20 dark:bg-teal-500/30 bg-teal-500/10 dark:ring-8 dark:ring-teal-200 dark:ring-opacity-5 ">
                  <LinkIcon
                    size={40}
                    className="dark:text-teal-300 text-teal-600"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-semibold">2. Create a Room</h3>
              <p className="dark:text-gray-300 text-gray-600 md:text-xl font-imFellFrench">
                Start a new collaborative session by creating a private coding
                room. Share the unique link with your team members.
              </p>
              <div className="h-48 w-48 rounded-lg flex items-center justify-center overflow-hidden text-sm dark:text-gray-400 text-gray-500">
                <img
                  src={roomImage}
                  alt=""
                  className=" w-full h-full"
                />
              </div>
            </motion.div>

            {/*Start Coding */}
            <motion.div
              className=" flex flex-col justify-center items-center space-y-4 rounded-2xl p-8 shadow-lg border dark:bg-white/10 dark:border-white/20 bg-white/50 border-gray-300"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-5 rounded-full ring-8 ring-teal-500 ring-opacity-20 dark:bg-teal-500/30 bg-teal-500/10 dark:ring-8 dark:ring-teal-200 dark:ring-opacity-5 ">
                  <Code
                    size={40}
                    className="dark:text-teal-300 text-teal-600"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-semibold">3. Collaborate</h3>
              <p className="dark:text-gray-300 text-gray-600 md:text-xl font-imFellFrench">
                Your team joins the room and you can all start coding in a
                shared editor. Use the built-in video and audio to communicate.
              </p>
              <div className="h-48 w-48 rounded-lg flex items-center justify-center overflow-hidden text-sm  dark:text-gray-400 text-gray-500">
                <img
                  src={collabrateImage}
                  alt=""
                  className=" w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <motion.footer
          className=" shadow-lg dark:bg-white/10 rounded-lg bg-white/50 py-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="container mx-auto px-6 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-xl font-bold">MentorSphere</div>
              <div className="flex space-x-6 md:text-xl ">
                <a
                  href="#"
                  className="hover:text-teal-200 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="hover:text-teal-200 transition-colors duration-200"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="hover:text-teal-200 transition-colors duration-200"
                >
                  Contact
                </a>
              </div>
              <div className="flex space-x-4">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="hover:text-teal-200 transition-colors duration-200"
                >
                  <Twitter size={24} />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="hover:text-teal-200 transition-colors duration-200"
                >
                  <Instagram size={24} />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="hover:text-teal-200 transition-colors duration-200"
                >
                  <Linkedin size={24} />
                </a>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700 ">
              <p className="text-sm md:text-xl">
                &copy; {new Date().getFullYear()} MentorSphere. All rights
                reserved.
              </p>
            </div>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
}

export default LandingPage;
