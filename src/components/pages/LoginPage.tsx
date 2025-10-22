import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { signIn, signInWithGoogle, handleGoogleRedirectResult } from '../../utils/firebase';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onShowSignUp: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onShowSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; google?: string }>({});

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

  // Handle Google redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      setIsGoogleLoading(true);
      const { user, error } = await handleGoogleRedirectResult();
      
      if (error) {
        setErrors({ google: error });
      } else if (user) {
        onLoginSuccess();
      }
      setIsGoogleLoading(false);
    };
    
    checkRedirectResult();
  }, [onLoginSuccess]);

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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrors({});
    
    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        setErrors({ google: result.error });
      } else if (result.user) {
        onLoginSuccess();
      }
      // If isPending is true, redirect is happening, keep loading state
    } catch (error) {
      setErrors({ google: 'An unexpected error occurred with Google sign-in' });
    } finally {
      // Don't set loading to false if redirect is happening
      setIsGoogleLoading(false);
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
              disabled={isLoading || isGoogleLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:scale-105 ${
                isLoading || isGoogleLoading
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

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold border-2 transition-all duration-300 transform hover:scale-105 focus:scale-105 ${
                isLoading || isGoogleLoading
                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed text-gray-400' 
                  : 'bg-white border-gray-300 hover:border-[#9b0101] hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg'
              } flex items-center justify-center`}
            >
              {isGoogleLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-[#9b0101] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in with Google...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </div>
              )}
            </button>

            {/* Google Error Message */}
            {errors.google && (
              <p className="text-red-500 text-sm text-center animate-in slide-in-from-top-10 duration-300 mt-2">
                {errors.google}
              </p>
            )}
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
