import React, { useState } from "react";
import { register } from "../services/authService";
import { Eye, EyeOff, User, Mail, Lock, Chrome, Github } from "lucide-react"; 

const Register = ({ onSuccess, toggle }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register({ name, email, password });
      
      // ✅ Token aur User data save karein taake automatic login ho jaye
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data._id);
        localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));
        
        // Success Message
        alert("✅ Account created and logged in successfully!");
        onSuccess(); // Yeh App.js ko batayega ke user loggedIn hai
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#f3f4f6] dark:bg-[#0f172a] px-4 transition-colors duration-500">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
            <User className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Create Account</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Start your productivity journey.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm rounded-r-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name Field */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                className="w-full border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 pl-11 pr-4 py-2.5 rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all dark:text-white"
                placeholder="John Doe"
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="email" 
                className="w-full border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 pl-11 pr-4 py-2.5 rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all dark:text-white"
                placeholder="john@example.com"
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 pl-11 pr-12 py-2.5 rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all dark:text-white"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] ${
              loading ? 'bg-blue-400 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t dark:border-gray-800"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-900 px-2 text-gray-500 font-bold">Or sign up with</span></div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="flex items-center justify-center gap-2 py-2 border-2 border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-sm dark:text-white">
            <Chrome size={18} className="text-red-500" /> Google
          </button>
          <button className="flex items-center justify-center gap-2 py-2 border-2 border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-sm dark:text-white">
            <Github size={18} /> GitHub
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
          Already have an account?{" "}
          <span 
            onClick={toggle} 
            className="text-blue-600 font-bold cursor-pointer hover:text-blue-700 transition-colors hover:underline"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;