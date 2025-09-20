import React, { useState } from "react";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { toast } from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, Loader } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://djo-ride-backend.vercel.app";

const UserCredentialsModal = ({ isOpen, onClose, userId, userEmail }) => {
  const [mode, setMode] = useState("email"); // 'email' or 'password'
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!adminPassword) {
      toast.error("Please enter your admin password for authentication");
      return;
    }

    if (mode === "email" && !newEmail) {
      toast.error("Please enter a new email address");
      return;
    }

    if (mode === "password" && !newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (mode === "password" && newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    try {
      // Re-authenticate admin
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        adminPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Call backend API to update user credentials
      const response = await fetch(
        `${API_URL}/api/update-user-credentials.js`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            newEmail: mode === "email" ? newEmail : undefined,
            newPassword: mode === "password" ? newPassword : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user credentials");
      }

      toast.success(
        mode === "email"
          ? `Email updated to ${newEmail}`
          : "Password updated successfully"
      );

      onClose();
    } catch (error) {
      console.error("Error updating credentials:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">
          {mode === "email" ? "Change Email Address" : "Change Password"}
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Update credentials for{" "}
          <span className="font-medium">{userEmail}</span>
        </p>

        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <button
              type="button"
              onClick={() => setMode("email")}
              className={`py-2 px-3 rounded-md flex items-center text-sm ${
                mode === "email"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Mail size={16} className="mr-1" /> Email
            </button>
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`py-2 px-3 rounded-md flex items-center text-sm ${
                mode === "password"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Lock size={16} className="mr-1" /> Password
            </button>
          </div>

          {mode === "email" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter new email address"
                disabled={loading}
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter new password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-primary"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Admin Password
          </label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Enter your password to authorize"
            disabled={loading}
            required
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md flex items-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                {mode === "email" ? (
                  <>
                    <Mail size={16} className="mr-1" />
                    Update Email
                  </>
                ) : (
                  <>
                    <Lock size={16} className="mr-1" />
                    Update Password
                  </>
                )}
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500 italic">
          Note: The user will need to use the new credentials for their next
          login.
        </p>
      </div>
    </div>
  );
};

export default UserCredentialsModal;
