import { Mail, Eye, EyeOff, RefreshCw, Loader } from 'lucide-react';

const PasswordModal = ({ 
  isOpen, 
  onClose, 
  selectedUser, 
  generatedPassword, 
  setGeneratedPassword, 
  showPassword, 
  setShowPassword, 
  regeneratePassword, 
  savePassword,
  isProcessing = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Assign Password</h3>
                <p className="mb-4 text-sm text-gray-600">
                    Set a password for <span className="font-medium">{selectedUser?.fullName || selectedUser?.name || selectedUser?.email}</span>
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auto-generated Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={generatedPassword}
                            onChange={(e) => setGeneratedPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Password"
                            disabled={isProcessing}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-primary"
                            disabled={isProcessing}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <button
                        onClick={regeneratePassword}
                        className="mt-2 flex items-center text-sm text-primary hover:text-accent"
                        disabled={isProcessing}
                    >
                        <RefreshCw size={14} className="mr-1" /> Generate new password
                    </button>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={savePassword}
                        className={`px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md flex items-center ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                          <>
                            <Loader size={16} className="mr-2 animate-spin" /> 
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <Mail size={16} className="mr-1" /> 
                            Create & Approve Account
                          </>
                        )}
                    </button>
                </div>

                <p className="mt-4 text-xs text-gray-500 italic">
                    Note: An email with login credentials will be sent to the user.
                </p>
            </div>
        </div>
    );
};

export default PasswordModal;