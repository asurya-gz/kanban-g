import React from "react";
import { Lock, Mail, ArrowRight, User } from "lucide-react";
import Link from "next/link";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full transform transition-all">
        {/* Glass effect container */}
        <div className="backdrop-blur-lg bg-white/80 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] space-y-6">
          {/* Header section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 text-center">
              Create Account
            </h1>
            <p className="text-sm text-center text-gray-500">
              Join us to start managing your projects
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-4">
              {/* Username Input */}
              <div className="group">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl 
                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 
                    bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="group">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl 
                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 
                    bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl 
                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 
                    bg-white/50 backdrop-blur-sm"
                    placeholder="Create a password"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent 
              text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
              transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              <span>Create Account</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
