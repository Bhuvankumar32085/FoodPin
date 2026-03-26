import { Link, useParams } from "react-router-dom";

const PaymentSuccess = () => {
  // URL se payment ID extract kar rahe hain
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-500 mb-6">
          Thank you for your order. We are processing it right away.
        </p>

        {/* Transaction Details Box */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
          <p className="font-mono text-gray-800 font-medium break-all">{id}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full py-3 px-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;