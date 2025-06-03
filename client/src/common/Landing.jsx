import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginWithGoogle, signupWithGoogle } from "../redux/authSlice";
import { FcGoogle } from "react-icons/fc";
import { FaRegUser, FaRegEyeSlash } from "react-icons/fa";

const Landing = () => {
  const dispatch = useDispatch();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleGoogleAuth = () => {
    isSignUp ? dispatch(signupWithGoogle()) : dispatch(loginWithGoogle());
  };

  const handlePhoneAuth = () => {
    setShowPhoneAuth(true);
  };

  const handleGetOtp = () => {
    alert(`OTP sent to ${phoneNumber}`);
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp === "123456") {
      alert("OTP verified successfully!");
      handlePhoneSubmit();
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const handlePhoneSubmit = () => {
    alert(`Proceeding with ${isSignUp ? "Sign Up" : "Sign In"} using phone number: ${phoneNumber}`);
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setShowForgotPassword(false);
    setShowPhoneAuth(false);
  };

  const handleForgotPasswordSubmit = () => {
    alert(`Password reset link sent to ${forgotEmail}`);
    setForgotEmail("");
    setShowForgotPassword(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 font-sans">
      <div className="bg-white bg-opacity-90 p-10 rounded-3xl max-w-md w-full shadow-xl text-center">
        {showPhoneAuth ? (
          <>
            <div className="text-lg text-slate-700 mb-4">
              {isSignUp ? "Enter your phone number to Sign Up" : "Enter your phone number to Sign In"}
            </div>
            <div className="relative mb-5">
              <input
                type="text"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-3 rounded-full border border-gray-300 text-base"
              />
            </div>
            {!otpSent ? (
              <button onClick={handleGetOtp} className="w-full p-3 bg-cyan-400 text-white rounded-full font-semibold mb-4">
                Get OTP
              </button>
            ) : (
              <>
                <div className="relative mb-5">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 rounded-full border border-gray-300 text-base"
                  />
                </div>
                <button onClick={handleVerifyOtp} className="w-full p-3 bg-cyan-400 text-white rounded-full font-semibold mb-4">
                  Verify OTP
                </button>
              </>
            )}
            <div onClick={() => setShowPhoneAuth(false)} className="mt-3 text-sm text-gray-500 underline cursor-pointer">
              ← Back to Login / Sign Up
            </div>
          </>
        ) : showForgotPassword ? (
          <>
            <div className="text-lg text-slate-700 mb-4">Forgot Password</div>
            <div className="relative mb-5">
              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full p-3 rounded-full border border-gray-300 text-base"
              />
              <FaRegUser className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button onClick={handleForgotPasswordSubmit} className="w-full p-3 bg-cyan-400 text-white rounded-full font-semibold mb-4">
              Send Reset Link
            </button>
            <div onClick={() => setShowForgotPassword(false)} className="mt-3 text-sm text-gray-500 underline cursor-pointer">
              ← Back to Login
            </div>
          </>
        ) : (
          <>
            <div className="text-lg text-slate-700 mb-4">
              {isSignUp ? "Create your account" : "Sign In to HRMS Portal"}
            </div>

            <div className="relative mb-5">
              <input
                type="text"
                placeholder="Enter your email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-full border border-gray-300 text-base"
              />
              <FaRegUser className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative mb-5">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-full border border-gray-300 text-base"
              />
              <FaRegEyeSlash className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400" />
            </div>

            {!isSignUp && (
              <>
                <div onClick={() => setShowForgotPassword(true)} className="text-right text-sm text-blue-500 underline cursor-pointer mb-3">
                  Forgot Password?
                </div>
                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    className="mr-2"
                  />
                  <label className="text-sm text-slate-600">Remember me</label>
                </div>
              </>
            )}

            <button className="w-full p-3 bg-cyan-400 text-white rounded-full font-semibold mb-4">
              {isSignUp ? "Sign Up" : "Login"}
            </button>

            <div className="flex gap-3 mb-4">
              <button
                onClick={handleGoogleAuth}
                className={`flex-1 flex items-center justify-center gap-3 p-3 rounded-full font-semibold text-sm ${isSignUp ? "bg-green-600" : "bg-blue-600"} text-white`}
              >
                <FcGoogle className="bg-white rounded-full p-1 text-lg" />
                {isSignUp ? "Sign Up" : "Sign In"} Google
              </button>
              <button
                onClick={handlePhoneAuth}
                className={`flex-1 flex items-center justify-center gap-3 p-3 rounded-full font-semibold text-sm ${isSignUp ? "bg-green-500" : "bg-blue-500"} text-white`}
              >
                📱 {isSignUp ? "Sign Up" : "Sign In"} with Phone
              </button>
            </div>

            <div onClick={toggleMode} className="mt-3 text-sm text-gray-500 underline cursor-pointer">
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Landing;