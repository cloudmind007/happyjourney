import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import api from "../utils/axios";

type RegisterFormInputs = {
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
};

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<RegisterFormInputs>();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState("");

  const email = watch("email");

  const validateEmailOrPhone = () => {
    if (!email && !phoneValue) {
      return "Either email or phone number is required";
    }
    return true;
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value)) {
      setPhoneValue(value);
      setValue("phoneNumber", value ? "+91" + value : ""); // Sync with react-hook-form
      setPhoneError(null);
    } else {
      setPhoneError("Only digits are allowed");
      // Remove non-numeric characters
      const sanitizedValue = value.replace(/[^0-9]/g, "");
      setPhoneValue(sanitizedValue);
      setValue("phoneNumber", sanitizedValue ? "+91" + sanitizedValue : "");
    }
  };

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const res = await api.post("/auth/register", { ...data, role: "ROLE_ADMIN" });

      if (res.status === 200) {
        navigate("/verify-otp", {
          state: {
            email: data.email || data.phoneNumber,
            message: "OTP sent successfully",
          },
        });
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError("email", {
          type: "manual",
          message: error.response.data.message,
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Register as Admin
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email", {
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email format",
                },
                validate: validateEmailOrPhone,
              })}
              className={`w-full px-4 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                +91
              </span>
              <input
                type="tel"
                value={phoneValue}
                {...register("phoneNumber", {
                  validate: validateEmailOrPhone,
                  pattern: {
                    value: /^\+91[0-9]{10}$/,
                    message: "Phone number must be exactly 10 digits after +91",
                  },
                })}
                onChange={handlePhoneInput}
                className={`w-full pl-12 pr-4 py-2 border ${
                  errors.phoneNumber || phoneError ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {phoneError && (
              <p className="text-sm text-red-500 mt-1">{phoneError}</p>
            )}
            {errors.phoneNumber && !phoneError && (
              <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              {...register("username", { required: "Username is required" })}
              className={`w-full px-4 py-2 border ${
                errors.username ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                className={`w-full px-4 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                ) : (
                  <AiOutlineEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Already have an account?
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;