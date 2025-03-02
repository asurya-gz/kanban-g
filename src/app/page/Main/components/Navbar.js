import React, { useState, useRef, useEffect } from "react";
import {
  LogOut,
  User,
  KeyRound,
  ChevronDown,
  X,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import axios from "axios";
import Image from "next/image";

const Navbar = ({ isViewOnly = false }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordModal(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);

    try {
      const userEmail = userData?.email;
      if (!userEmail) {
        throw new Error("User email not found!");
      }

      const response = await axios.post(
        "http://localhost:4000/api/change-password",
        {
          email: userEmail,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }
      );

      if (response.status === 200) {
        alert("Password updated successfully!");
        resetForm();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="h-8">
              <Image
                src="/image.png"
                alt="Project Board Logo"
                width={120}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-center space-x-4">
              {isViewOnly ? (
                // View-only mode navigation options
                <div className="flex items-center space-x-2">
                  <Link href="/page/Login">
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                  </Link>
                  <Link href="/page/Register">
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                      <UserPlus className="w-4 h-4" />
                      <span>Register</span>
                    </button>
                  </Link>
                </div>
              ) : (
                // Logged-in user navigation options
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {userData?.username || "User"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                        showProfileMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showProfileMenu && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {userData?.username || "Loading..."}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userData?.email || "Loading..."}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowPasswordModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <KeyRound className="w-4 h-4 mr-2 text-gray-500" />
                        Change Password
                      </button>
                      <Link href="/page/Logout">
                        <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center">
                          <LogOut className="w-4 h-4 mr-2" />
                          Log Out
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Password Change Modal - only render if not in view-only mode */}
      {!isViewOnly && showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative animate-fadeIn"
          >
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Change Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors font-medium ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
