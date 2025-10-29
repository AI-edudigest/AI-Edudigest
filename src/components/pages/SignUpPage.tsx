import React, { useRef, useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { signUp, signInWithGoogle, handleGoogleRedirectResult } from '../../utils/firebase';
import { loadColleges, searchColleges, College } from '../../utils/loadColleges';

interface SignUpPageProps {
  onSignUpSuccess: () => void;
  onBackToLogin: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUpSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [institutionId, setInstitutionId] = useState<string>('');
  const [institutionResults, setInstitutionResults] = useState<College[]>([]);
  const [showInstitutionList, setShowInstitutionList] = useState(false);
  const searchDebounceRef = useRef<number | undefined>(undefined);
  const [collegesData, setCollegesData] = useState<College[]>([]);
  const [selectedCollegeIndex, setSelectedCollegeIndex] = useState(-1);

  // Load colleges data on component mount
  useEffect(() => {
    const loadCollegesData = async () => {
      try {
        const colleges = await loadColleges();
        setCollegesData(colleges);
      } catch (error) {
        console.error('Error loading colleges:', error);
      }
    };
    loadCollegesData();
  }, []);

  // Handle Google redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      setIsGoogleLoading(true);
      const { user, error } = await handleGoogleRedirectResult();
      
      if (error) {
        setErrors({ google: error });
      } else if (user) {
        setIsSuccess(true);
        setTimeout(() => {
          onSignUpSuccess();
        }, 2000);
      }
      setIsGoogleLoading(false);
    };
    
    checkRedirectResult();
  }, [onSignUpSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Special handling for institution typeahead
    if (name === 'institution') {
      setInstitutionId(''); // reset until user selects from list
      setShowInstitutionList(true);
      setSelectedCollegeIndex(-1);

      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = window.setTimeout(() => {
        if (value.trim().length < 3) {
          setInstitutionResults([]);
          return;
        }
        
        // Search in CSV data
        const results = searchColleges(collegesData, value.trim(), 10);
        setInstitutionResults(results);
      }, 250);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[A-Za-z][A-Za-z\s'.-]{1,}$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'Enter a valid first name';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[A-Za-z][A-Za-z\s'.-]{1,}$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Enter a valid last name';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i.test(formData.email)) {
      newErrors.email = 'Use a valid Gmail address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Za-z])(?=.*\d).{8,}/.test(formData.password)) {
      newErrors.password = 'Include letters and numbers';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.institution.trim()) {
      newErrors.institution = 'Institution name is required';
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
      const { user, error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        institution: formData.institution,
        institutionId,
        role: formData.role
      });
      
      if (error) {
        setErrors({ password: error });
      } else if (user) {
        setIsSuccess(true);
        // Show success for 2 seconds, then redirect to login
        setTimeout(() => {
          onSignUpSuccess();
        }, 2000);
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
        setIsSuccess(true);
        setTimeout(() => {
          onSignUpSuccess();
        }, 2000);
      }
    } catch (error) {
      setErrors({ google: 'An unexpected error occurred with Google sign-in' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle keyboard navigation for college suggestions
  const handleInstitutionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showInstitutionList || institutionResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedCollegeIndex(prev => 
          prev < institutionResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedCollegeIndex(prev => 
          prev > 0 ? prev - 1 : institutionResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedCollegeIndex >= 0 && selectedCollegeIndex < institutionResults.length) {
          const selectedCollege = institutionResults[selectedCollegeIndex];
          setFormData(prev => ({ ...prev, institution: selectedCollege.name }));
          setInstitutionId(selectedCollege.name); // Use name as ID for CSV data
          setShowInstitutionList(false);
          setSelectedCollegeIndex(-1);
          setErrors(prev => ({ ...prev, institution: '' }));
        }
        break;
      case 'Escape':
        setShowInstitutionList(false);
        setSelectedCollegeIndex(-1);
        break;
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Animation Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#9b0101]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#9b0101]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Success Card */}
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-8 text-center animate-in fade-in-50 duration-500">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-in zoom-in-50 duration-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-in slide-in-from-top-10 duration-500 delay-200">
              Account Created!
            </h2>
            <p className="text-gray-600 mb-6 animate-in fade-in-50 duration-500 delay-300">
              Your AI-EduDigest account has been successfully created. Redirecting to login...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#9b0101] to-red-600 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Sign Up Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-8 animate-in fade-in-50 duration-700">
          
          {/* Header */}
          <div className="text-center mb-8 animate-in slide-in-from-top-10 duration-700 delay-200">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/AI-Edu app logo  .png" 
                alt="AI-EduApp Logo" 
                className="w-24 h-24 animate-in zoom-in-50 duration-700 delay-300"
              />
            </div>
            <h1 
              className="text-4xl font-bold mb-2 animate-in slide-in-from-top-10 duration-700 delay-400"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <span style={{ color: '#000000' }}>AI-Edu</span>
              <span style={{ color: '#9b0101' }}>Digest</span>
            </h1>
            <p className="text-gray-600 text-lg animate-in fade-in-50 duration-700 delay-500">
              Create Your Account
            </p>
            <div className="mt-4 h-1 w-20 bg-gradient-to-r from-[#9b0101] to-red-600 mx-auto rounded-full animate-in slide-in-from-left-10 duration-700 delay-600"></div>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-10 duration-700 delay-700">
            
            {/* Google Sign-In Button */}
            <div className="space-y-4">
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
                    Signing up with Google...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </div>
                )}
              </button>

              {/* Google Error Message */}
              {errors.google && (
                <p className="text-red-500 text-sm text-center animate-in slide-in-from-top-10 duration-300">
                  {errors.google}
                </p>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 text-gray-500 font-medium">Or sign up with email</span>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-[#9b0101]" />
                First Name <span className="text-red-600 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] transition-all duration-300 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  } bg-white/70 backdrop-blur-sm`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm animate-in slide-in-from-left-10 duration-300">
                    {errors.firstName}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-[#9b0101]" />
                Last Name <span className="text-red-600 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] transition-all duration-300 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  } bg-white/70 backdrop-blur-sm`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm animate-in slide-in-from-left-10 duration-300">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-[#9b0101]" />
                Email Address <span className="text-red-600 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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

            {/* Institution Field - Typeahead for Indian colleges */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Institution/College <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                onKeyDown={handleInstitutionKeyDown}
                onFocus={() => setShowInstitutionList(true)}
                onBlur={() => setTimeout(() => setShowInstitutionList(false), 200)}
                autoComplete="off"
                aria-label="College suggestions"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] transition-all duration-300 ${
                  errors.institution ? 'border-red-500' : 'border-gray-300'
                } bg-white/70 backdrop-blur-sm`}
                placeholder="Search your college (Hyderabad)"
              />
              {errors.institution && (
                <p className="text-red-500 text-sm animate-in slide-in-from-left-10 duration-300">
                  {errors.institution}
                </p>
              )}
              {showInstitutionList && (
                <div className="mt-1 max-h-56 overflow-auto border border-gray-200 rounded-lg bg-white shadow-lg">
                  {institutionResults.length === 0 && formData.institution.length >= 3 && (
                    <div className="px-4 py-3 text-sm text-gray-500">No colleges found</div>
                  )}
                  {institutionResults.length === 0 && formData.institution.length < 3 && (
                    <div className="px-4 py-3 text-sm text-gray-500">Type at least 3 characters to search colleges</div>
                  )}
                  {institutionResults.length > 0 && (
                    <div>
                      {institutionResults.map((college, index) => (
                        <button
                          type="button"
                          key={`${college.name}-${index}`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, institution: college.name }));
                            setInstitutionId(college.name);
                            setShowInstitutionList(false);
                            setSelectedCollegeIndex(-1);
                            setErrors(prev => ({ ...prev, institution: '' }));
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            index === selectedCollegeIndex 
                              ? 'bg-[#9b0101]/10 text-[#9b0101]' 
                              : 'hover:bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="font-medium">{college.name}</div>
                          {college.shortName && (
                            <div className="text-xs text-gray-500 mt-1">{college.shortName}</div>
                          )}
                          {college.type && (
                            <div className="text-xs text-gray-400 mt-1">{college.type}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Role <span className="text-red-600">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] transition-all duration-300 bg-white/70 backdrop-blur-sm"
              >
                <option value="leaders">Leaders</option>
                <option value="faculty">Faculty</option>
                <option value="college-admin">College Administration Staff</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-[#9b0101]" />
                Password <span className="text-red-600 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pl-10 pr-10 border rounded-xl focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] transition-all duration-300 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } bg-white/70 backdrop-blur-sm`}
                    placeholder="Create password"
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
              
              <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-[#9b0101]" />
                Confirm Password <span className="text-red-600 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pl-10 pr-10 border rounded-xl focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] transition-all duration-300 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } bg-white/70 backdrop-blur-sm`}
                    placeholder="Confirm password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#9b0101] transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm animate-in slide-in-from-left-10 duration-300">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input type="checkbox" className="mt-1 rounded border-gray-300 text-[#9b0101] focus:ring-[#9b0101]" required />
              <label className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-[#9b0101] hover:text-red-700 transition-colors duration-200">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#9b0101] hover:text-red-700 transition-colors duration-200">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Sign Up Button */}
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
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center">
                  Create Account
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </div>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center animate-in fade-in-50 duration-700 delay-1000">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onBackToLogin}
                className="text-[#9b0101] hover:text-red-700 font-semibold transition-colors duration-200"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -z-10 -top-4 -right-4 w-24 h-24 bg-[#9b0101]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -z-10 -bottom-4 -left-4 w-32 h-32 bg-red-100 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default SignUpPage;
