import React, { useState, useEffect, useRef } from 'react';
import { X, GraduationCap, CheckCircle, Sparkles } from 'lucide-react';
import { updateUserProfile } from '../utils/firebase';
import { loadColleges, searchColleges, College } from '../utils/loadColleges';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    photoURL?: string;
  };
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen, onClose, user }) => {
  const [institution, setInstitution] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [institutionResults, setInstitutionResults] = useState<College[]>([]);
  const [showInstitutionList, setShowInstitutionList] = useState(false);
  const [selectedCollegeIndex, setSelectedCollegeIndex] = useState(-1);
  const [collegesData, setCollegesData] = useState<College[]>([]);
  const searchDebounceRef = useRef<number | undefined>(undefined);

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

  const handleInstitutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInstitution(value);
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
          setInstitution(selectedCollege.name);
          setInstitutionId(selectedCollege.name);
          setShowInstitutionList(false);
          setSelectedCollegeIndex(-1);
        }
        break;
      case 'Escape':
        setShowInstitutionList(false);
        setSelectedCollegeIndex(-1);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!institution.trim()) {
      setError('Please select your college/institution');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await updateUserProfile(user.uid, {
        institution: institution.trim(),
        institutionId: institutionId || institution.trim(),
        role: role
      });
      
      if (result.success) {
        setIsSuccess(true);
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-50 duration-300">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-6 text-center">
            <CheckCircle className="w-16 h-16 text-white mx-auto mb-4 animate-in zoom-in-50 duration-500" />
            <h2 className="text-2xl font-bold text-white mb-2">Profile Complete!</h2>
            <p className="text-green-100">Your profile is now 100% complete</p>
          </div>
          <div className="p-6 text-center">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-full animate-pulse"></div>
            </div>
            <p className="text-gray-600">Welcome to AI-EduDigest, {user.firstName}!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in zoom-in-50 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#9b0101] to-red-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Complete Your Profile</h2>
                <p className="text-red-100 text-sm">Just one more step!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Profile Completion</span>
            <span>90%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-[#9b0101] to-red-600 h-2 rounded-full w-[90%] transition-all duration-500"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.firstName}
                  className="w-16 h-16 rounded-full border-4 border-[#9b0101]/20"
                />
              ) : (
                <div className="w-16 h-16 bg-[#9b0101]/10 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-[#9b0101]" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hi {user.firstName}! 👋
            </h3>
            <p className="text-gray-600">
              Your profile is 90% complete. Just add your college name to get 100%!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Institution Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-[#9b0101]" />
                College/Institution <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={institution}
                onChange={handleInstitutionChange}
                onKeyDown={handleInstitutionKeyDown}
                onFocus={() => setShowInstitutionList(true)}
                onBlur={() => setTimeout(() => setShowInstitutionList(false), 200)}
                autoComplete="off"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] transition-all duration-300 bg-white"
                placeholder="Search your college (Hyderabad)"
                required
              />
              {showInstitutionList && (
                <div className="mt-1 max-h-56 overflow-auto border border-gray-200 rounded-lg bg-white shadow-lg">
                  {institutionResults.length === 0 && institution.length >= 3 && (
                    <div className="px-4 py-3 text-sm text-gray-500">No colleges found</div>
                  )}
                  {institutionResults.length === 0 && institution.length < 3 && (
                    <div className="px-4 py-3 text-sm text-gray-500">Type at least 3 characters to search colleges</div>
                  )}
                  {institutionResults.length > 0 && (
                    <div>
                      {institutionResults.map((college, index) => (
                        <button
                          type="button"
                          key={`${college.name}-${index}`}
                          onClick={() => {
                            setInstitution(college.name);
                            setInstitutionId(college.name);
                            setShowInstitutionList(false);
                            setSelectedCollegeIndex(-1);
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
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9b0101] focus:border-[#9b0101] transition-all duration-300 bg-white"
                required
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Administrator</option>
                <option value="leaders">Leaders</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !institution.trim()}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:scale-105 ${
                isLoading || !institution.trim()
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#9b0101] to-red-600 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl'
              } flex items-center justify-center`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Completing Profile...
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Complete Profile (100%)
                </div>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This information helps us personalize your AI-EduDigest experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
