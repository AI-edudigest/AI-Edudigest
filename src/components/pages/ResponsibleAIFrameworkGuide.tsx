import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import ArticleTTS from '../common/ArticleTTS';

const ResponsibleAIFrameworkGuide: React.FC = () => {
  const [playingArticleId, setPlayingArticleId] = useState<string | null>(null);

  const handleTTSPlayStateChange = (isPlaying: boolean, articleId: string) => {
    if (isPlaying) {
      setPlayingArticleId(articleId);
    } else {
      setPlayingArticleId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">

      {/* Main Content */}
      <div className="space-y-6">
        
        {/* Section 1: For Leaders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              1. Responsible AI Framework For Leaders (Principals, Directors)
            </h2>
            <ArticleTTS
              articleText="Leaders set the vision and policies that shape how AI is used across the institution. Principals need to create clear rules about how AI should be used in the college. For example, AI can be used for attendance tracking, but student data must not be shared outside the college system. Leaders should set a vision that AI must be fair to all students. For example, ensure AI admissions don't favor only city students while ignoring rural ones."
              articleTitle="Responsible AI Framework For Leaders"
              articleId="responsible-ai-leaders-section"
              isActive={playingArticleId === "responsible-ai-leaders-section"}
              onPlayStateChange={handleTTSPlayStateChange}
              className="absolute top-6 right-6"
            />
          </div>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Role in Responsible AI:</h3>
              <p>Leaders set the vision and policies that shape how AI is used across the institution.</p>
            </div>
            
            <div className="space-y-4">
              <div className="border-l-4 border-[#9b0101] pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Make policies for safe AI use:</h3>
                <p>Principals need to create clear rules about how AI should be used in the college. <strong>Example:</strong> "AI can be used for attendance tracking, but student data must not be shared outside the college system."</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Approve ethical guidelines (data safety, fairness, transparency):</h3>
                <p>Leaders should set a vision that AI must be fair to all students. <strong>Example:</strong> Ensure AI admissions don't favor only city students while ignoring rural ones.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: For Administration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            2. Responsible AI Framework For Administration (Office Staff, Academic Admin)
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Role in Responsible AI:</h3>
              <p>Administration ensures safe and fair implementation of AI in daily operations.</p>
            </div>
            
            <div className="space-y-4">
              <div className="border-l-4 border-[#9b0101] pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure data (don't leak student info):</h3>
                <p>Admin staff must keep sensitive details (marks, Aadhaar, phone numbers) safe. Data should only be in official college systems, not pen drives or WhatsApp groups.</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Test AI tools before scaling:</h3>
                <p>New AI systems (like exam checking software) should be tested in one department first to ensure accuracy and fairness.</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Keep transparency & documentation:</h3>
                <p>Always record how an AI system made a decision. <strong>Example:</strong> If an AI rejected a student's admission, the reason must be clear.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: For Educators */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            3. Responsible AI Framework For Educators (Lecturers, Professors, Teaching Staff)
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Role in Responsible AI:</h3>
              <p>Educators use AI responsibly in teaching, ensuring human guidance remains central.</p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="italic text-gray-700 dark:text-gray-300">
                <strong>AI is a helper, not a teacher.</strong> It should support your teaching, reduce workload, and enhance learning — while keeping human judgment and fairness at the center.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#9b0101] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Use AI as a Support Tool:</h3>
                  <p>Let AI generate lesson ideas, quizzes, or study material, but always review before use.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#9b0101] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Use AI responsibly (fact-check, cite):</h3>
                  <p>Teachers should not blindly trust AI answers. They must double-check facts before sharing with students. <strong>Example:</strong> If AI gives a historical date, confirm it before adding to a lesson.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#9b0101] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Maintain Academic Integrity:</h3>
                  <p>Remind students not to misuse AI for cheating or plagiarism.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#9b0101] text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Protect Privacy:</h3>
                  <p>Avoid uploading sensitive student data into open AI tools.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaways Section */}
        <div className="bg-gradient-to-br from-[#9b0101]/10 to-[#9b0101]/5 dark:from-[#9b0101]/20 dark:to-[#9b0101]/10 rounded-lg border border-[#9b0101]/30 dark:border-[#9b0101]/50 p-6">
          <h3 className="text-xl font-semibold text-[#9b0101] dark:text-[#9b0101] mb-4">Key Takeaways</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">For Leaders</h4>
              <p className="text-gray-600 dark:text-gray-300">Set clear policies and ethical guidelines for AI use across the institution.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">For Administration</h4>
              <p className="text-gray-600 dark:text-gray-300">Ensure data security, test AI tools thoroughly, and maintain transparency.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">For Educators</h4>
              <p className="text-gray-600 dark:text-gray-300">Use AI as a support tool while maintaining academic integrity and protecting privacy.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResponsibleAIFrameworkGuide;
