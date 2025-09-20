import { useState } from 'react';
import { X, DollarSign, CreditCard, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const BankDetailsModal = ({ isOpen, onClose, booking, mode, onStatusUpdate }) => {
  const [copying, setCopying] = useState(false);
  const [loading, setLoading] = useState(false);
  const db = getFirestore();

  // Early return if modal should not be shown or booking is null
  if (!isOpen || !booking) return null;

  const formatCurrency = (amount) => {
    return `$${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopying(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopying(false), 2000);
  };

  const handleMarkAsDone = async () => {
    try {
      setLoading(true);
      
      // Update in Firestore
      await updateDoc(doc(db, 'bookings', booking.id), {
        paymentStatus: 'marked_done'
      });
      
      // Notify parent component about the status change
      if (typeof onStatusUpdate === 'function') {
        onStatusUpdate({...booking, paymentStatus: 'marked_done'});
      }
      
      toast.success('Payment marked as done');
      onClose();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const bankDetails = {
    accountName: 'DJO Ride Services',
    accountNumber: '1234567890',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001234',
    swiftCode: 'HDFCINBB',
    reference: `DJO-${booking.id.slice(-6).toUpperCase()}`
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {mode === 'payment' ? (
          <>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-primary flex items-center">
                <CreditCard size={18} className="mr-2" />
                Make Payment
              </h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-primary/10 p-4 rounded-lg mb-4">
                <p className="text-sm text-primary font-medium">Amount Due</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(booking.totalAmount)}</p>
                <p className="text-xs text-gray-600 mt-1">Booking ID: {booking.id.slice(-6).toUpperCase()}</p>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Please make a payment to the following bank account and click "Mark as Done" once completed.
              </p>
              
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-700">Account Name</p>
                  <div className="flex items-center">
                    <p className="text-sm text-primary">{bankDetails.accountName}</p>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.accountName)}
                      className="ml-2 text-gray-400 hover:text-primary"
                    >
                      {copying ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-700">Account Number</p>
                  <div className="flex items-center">
                    <p className="text-sm text-primary">{bankDetails.accountNumber}</p>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.accountNumber)}
                      className="ml-2 text-gray-400 hover:text-primary"
                    >
                      {copying ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-700">Bank Name</p>
                  <div className="flex items-center">
                    <p className="text-sm text-primary">{bankDetails.bankName}</p>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.bankName)}
                      className="ml-2 text-gray-400 hover:text-primary"
                    >
                      {copying ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-700">IFSC Code</p>
                  <div className="flex items-center">
                    <p className="text-sm text-primary">{bankDetails.ifscCode}</p>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.ifscCode)}
                      className="ml-2 text-gray-400 hover:text-primary"
                    >
                      {copying ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-700">SWIFT Code</p>
                  <div className="flex items-center">
                    <p className="text-sm text-primary">{bankDetails.swiftCode}</p>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.swiftCode)}
                      className="ml-2 text-gray-400 hover:text-primary"
                    >
                      {copying ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Payment Reference</p>
                  <div className="flex items-center">
                    <p className="text-sm font-bold text-primary">{bankDetails.reference}</p>
                    <button 
                      onClick={() => copyToClipboard(bankDetails.reference)}
                      className="ml-2 text-gray-400 hover:text-primary"
                    >
                      {copying ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsDone}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary/90 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Mark as Done
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-primary flex items-center">
                <AlertTriangle size={18} className="mr-2" />
                Payment Under Review
              </h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-yellow-50 p-4 rounded-full">
                  <AlertTriangle size={32} className="text-yellow-500" />
                </div>
              </div>
              
              <p className="text-center text-gray-700 mb-2">
                Your payment is currently under review or has not been received.
              </p>
              
              <p className="text-center text-sm text-gray-600 mb-4">
                Please contact our support team to resolve this issue.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="font-medium text-primary">Contact Support</p>
                <p className="text-sm text-gray-700 mt-1">Email: support@djoride.com</p>
                <p className="text-sm text-gray-700">Phone: +1-234-567-8900</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BankDetailsModal;