import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import sanitizeHtml from 'sanitize-html';
import api from '@/utils/axios';

// Define the form schema with Zod
const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces')
    .transform((val) => sanitizeHtml(val)),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters')
    .transform((val) => sanitizeHtml(val)),
  mobileNumber: z
    .string()
    .regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number')
    .transform((val) => sanitizeHtml(val)),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message cannot exceed 500 characters')
    .transform((val) => sanitizeHtml(val)),
});

// Infer the form data type from the schema
type FormData = z.infer<typeof formSchema>;

const ContactForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // Real-time validation
  });

  const [success, setSuccess] = React.useState<{ show: boolean; callbackId?: string }>({ show: false });
  const [apiError, setApiError] = React.useState<string | null>(null);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setApiError(null);
    try {
      const response = await api.post('/callbacks', data);
      if (response.status === 200 || response.status === 201) {
        setSuccess({ show: true, callbackId: response.data.callbackId });
        reset();
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (err: any) {
      let errorMessage = 'Failed to submit callback request. Please try again.';
      if (err.response) {
        const data = err.response.data;
        errorMessage =
          typeof data === 'string'
            ? data
            : data?.message || data?.error || err.response.statusText || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setApiError(errorMessage);
    }
  };

  if (success.show) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all duration-300 scale-100">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 animate-pulse">
            <CheckCircleIcon className="h-8 w-8 text-green-600" aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            Callback Request Submitted!
          </h2>
          <div className="mt-4 space-y-2">
            <p className="text-gray-600">
              We've received your request
              {success.callbackId && (
                <span className="font-semibold"> (ID: {success.callbackId})</span>
              )}.
              Our team will contact you shortly.
            </p>
            <p className="text-gray-500 text-sm">
              You'll receive a confirmation email with your request details.
            </p>
            <p className="text-gray-500 text-sm animate-pulse">Redirecting to home...</p>
          </div>
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full animate-[progress_3s_linear_forwards]"
                style={{ animationFillMode: 'forwards' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md animate-slide-up">
        <h2 className="text-2xl sm:text-3xl font-bold text-black-600 mb-6">
          Request a Callback
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className={`mt-1 w-full p-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Doe"
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`mt-1 w-full p-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your@email.com"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="mobileNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Mobile Number *
            </label>
            <input
              type="tel"
              id="mobileNumber"
              {...register('mobileNumber')}
              className={`mt-1 w-full p-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="9876543210"
              aria-invalid={errors.mobileNumber ? 'true' : 'false'}
              aria-describedby={errors.mobileNumber ? 'mobileNumber-error' : undefined}
            />
            {errors.mobileNumber && (
              <p id="mobileNumber-error" className="mt-1 text-sm text-red-600">
                {errors.mobileNumber.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message *
            </label>
            <textarea
              id="message"
              {...register('message')}
              className={`mt-1 w-full p-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Please provide details for your callback request..."
              rows={5}
              aria-invalid={errors.message ? 'true' : 'false'}
              aria-describedby={errors.message ? 'message-error' : undefined}
            />
            {errors.message && (
              <p id="message-error" className="mt-1 text-sm text-red-600">
                {errors.message.message}
              </p>
            )}
          </div>
          {apiError && (
            <div className="p-4 bg-red-50 rounded-lg flex items-start">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0"
                aria-hidden="true"
              />
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Submit callback request"
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="ml-2">Submitting...</span>
              </div>
            ) : (
              'Submit Callback Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;