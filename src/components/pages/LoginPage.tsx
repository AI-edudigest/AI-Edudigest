import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { signIn } from '../../utils/firebase';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onShowSignUp: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onShowSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const { user, error } = await signIn(email, password);
      
      if (error) {
        // Check if it's a "no account found" error and show it as a general message
        if (error.includes('No account found')) {
          setErrors({ email: error });
        } else {
          setErrors({ password: error });
        }
      } else if (user) {
        onLoginSuccess();
      }
    } catch (error) {
      setErrors({ password: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#9b0101]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#9b0101]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#9b0101]/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Sparkles */}
      <div className="absolute top-20 left-20 animate-bounce delay-300">
        <Sparkles className="w-6 h-6 text-[#9b0101]/30" />
      </div>
      <div className="absolute top-40 right-32 animate-bounce delay-700">
        <Sparkles className="w-4 h-4 text-[#9b0101]/20" />
      </div>
      <div className="absolute bottom-32 left-32 animate-bounce delay-1000">
        <Sparkles className="w-5 h-5 text-[#9b0101]/25" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-8 animate-in fade-in-50 duration-700">
          
          {/* Header */}
          <div className="text-center mb-8 animate-in slide-in-from-top-10 duration-700 delay-200">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/AI-Edu_Digest__logo_-removebg-preview.png" 
                alt="AI-EduDigest Logo" 
                className="w-24 h-24 animate-in zoom-in-50 duration-700 delay-300"
              />
            </div>
            <h1 
              className="text-4xl font-bold mb-2 animate-in slide-in-from-top-10 duration-700 delay-400"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <span style={{ color: '#000000' }}>AI-Edu</span>
              <span style={{ color: '#9b0101' }}>App</span>
            </h1>
            <p className="text-gray-600 text-lg animate-in fade-in-50 duration-700 delay-500">
              AI for Colleges
            </p>
            <div className="mt-4 h-1 w-20 bg-gradient-to-r from-[#9b0101] to-red-600 mx-auto rounded-full animate-in slide-in-from-left-10 duration-700 delay-600"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-10 duration-700 delay-700">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-[#9b0101]" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] transition-all duration-300 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } bg-white/70 backdrop-blur-sm`}
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm animate-in slide-in-from-left-10 duration-300">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-[#9b0101]" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pl-10 pr-10 border rounded-xl focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] transition-all duration-300 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } bg-white/70 backdrop-blur-sm`}
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#9b0101] transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm animate-in slide-in-from-left-10 duration-300">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300 text-[#9b0101] focus:ring-[#9b0101] mr-2" />
                Remember me
              </label>
              <a href="#" className="text-sm text-[#9b0101] hover:text-red-700 transition-colors duration-200">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:scale-105 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#9b0101] to-red-600 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl'
              } flex items-center justify-center`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center animate-in fade-in-50 duration-700 delay-1000">
            {errors.email && errors.email.includes('No account found') ? (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm font-medium">
                    New to AI-EduDigest? Create your account to get started!
                  </p>
                </div>
                <button
                  onClick={onShowSignUp}
                  className="bg-[#9b0101] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 flex items-center mx-auto"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={onShowSignUp}
                  className="text-[#9b0101] hover:text-red-700 font-semibold transition-colors duration-200"
                >
                  Sign up here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -z-10 -top-4 -right-4 w-24 h-24 bg-[#9b0101]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -z-10 -bottom-4 -left-4 w-32 h-32 bg-red-100 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default LoginPage;
