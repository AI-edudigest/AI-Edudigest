import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import ArticleTTS from '../common/ArticleTTS';

const AIAdoptionPage: React.FC = () => {
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
        
        {/* Section 1: What is AI Adoption */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              1. What is AI Adoption in Colleges?
            </h2>
            <ArticleTTS
              articleText="AI adoption in colleges refers to the process of integrating artificial intelligence technologies into academic, administrative, and student-support activities. This includes using AI to enhance teaching and learning, automate repetitive administrative tasks, support decision-making with data-driven insights, personalize student experiences, and improve institutional efficiency. It's not about replacing educators or staff but empowering them with AI to do their jobs better, faster, and smarter."
              articleTitle="What is AI Adoption in Colleges?"
              articleId="ai-adoption-section-1"
              isActive={playingArticleId === "ai-adoption-section-1"}
              onPlayStateChange={handleTTSPlayStateChange}
              className="absolute top-6 right-6"
            />
          </div>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p>
              AI adoption in colleges refers to the process of integrating artificial intelligence technologies into academic, administrative, and student-support activities. This includes using AI to:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="list-disc">Enhance teaching and learning.</li>
              <li className="list-disc">Automate repetitive administrative tasks.</li>
              <li className="list-disc">Support decision-making with data-driven insights.</li>
              <li className="list-disc">Personalize student experiences.</li>
              <li className="list-disc">Improve institutional efficiency.</li>
            </ul>
            <p className="italic bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              It's not about replacing educators or staff but empowering them with AI to do their jobs better, faster, and smarter.
            </p>
          </div>
        </div>

        {/* Section 2: Why Should Colleges Adopt AI */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            2. Why Should Colleges Adopt AI?
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p className="mb-4">The adoption of AI brings several benefits:</p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-[#9b0101] pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Personalized Learning:</h3>
                <p>AI adapts to each student's learning pace and style. For example, adaptive learning platforms recommend lessons based on performance.</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Efficiency in Administration:</h3>
                <p>Automating tasks like admissions, attendance, scheduling, and grading saves time and reduces errors.</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Data-Driven Insights:</h3>
                <p>AI can analyze student data to predict dropouts, identify struggling learners, and suggest timely interventions.</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Skill Development:</h3>
                <p>Exposure to AI tools prepares students for future careers where AI literacy is essential.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Areas Where Colleges Can Adopt AI */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            3. Areas Where Colleges Can Adopt AI
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p className="mb-4">Here are the major domains where AI can be implemented in a college ecosystem:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Teaching and Learning */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Teaching and Learning</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-[#9b0101] mr-2">•</span>
                    <span>Intelligent tutoring systems (e.g., AI chatbots answering student queries 24/7).</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#9b0101] mr-2">•</span>
                    <span>AI-powered content generation (summarizing articles, creating practice tests).</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#9b0101] mr-2">•</span>
                    <span>Automated grading for objective and short-answer questions.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#9b0101] mr-2">•</span>
                    <span>Personalized learning platforms that recommend study paths.</span>
                  </li>
                </ul>
              </div>

              {/* Administration */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Administration</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-[#9b0101] mr-2">•</span>
                    <span>Automating admission and enrollment processes.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#9b0101] mr-2">•</span>
                    <span>Facial recognition/AI for smart attendance tracking.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#9b0101] mr-2">•</span>
                    <span>Predictive analytics for resource allocation (faculty, classrooms, finances).</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Step-by-Step Roadmap */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            4. Step-by-Step Roadmap for AI Adoption
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p className="mb-4">AI adoption is not a one-time setup—it's a phased journey. Colleges can follow these steps:</p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#9b0101] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Awareness & Training:</h3>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>• Conduct workshops to familiarize faculty, staff, and students with AI basics.</li>
                    <li>• Offer short-term certification courses in AI literacy.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#9b0101] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Identify Needs & Use Cases:</h3>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>• Example: Automating fee payment reminders vs. implementing AI tutors.</li>
                    <li>• Prioritize based on institution's challenges.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#9b0101] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Infrastructure Setup:</h3>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>• Ensure reliable internet, cloud-based systems, and computing resources.</li>
                    <li>• Collaborate with EdTech companies for AI solutions.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#9b0101] text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pilot Projects:</h3>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>• Start small (e.g., AI chatbot for admissions).</li>
                    <li>• Gather feedback and measure success before scaling.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#9b0101] text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Policy & Ethics:</h3>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>• Ensure responsible AI use—avoid bias, protect data privacy, and promote transparency.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#9b0101] text-white rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Scaling & Integration:</h3>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>• Expand AI use to teaching, research, and full administration.</li>
                    <li>• Build AI labs and centers of excellence for student projects.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Challenges */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            5. Challenges in AI Adoption
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p className="mb-4">Colleges may face roadblocks, such as:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 dark:text-red-400 mb-2">⚠️ Lack of Awareness:</h3>
                <p className="text-sm">Faculty/staff may resist new technologies.</p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 dark:text-orange-400 mb-2">⚠️ Financial Constraints:</h3>
                <p className="text-sm">AI tools and infrastructure can be costly.</p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-400 mb-2">⚠️ Data Privacy Issues:</h3>
                <p className="text-sm">Handling student data responsibly is critical.</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-400 mb-2">⚠️ Skill Gaps:</h3>
                <p className="text-sm">Teachers and administrators need AI training to use tools effectively.</p>
              </div>

              <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg md:col-span-2">
                <h3 className="font-semibold text-pink-900 dark:text-pink-400 mb-2">⚠️ Over-dependence Risk:</h3>
                <p className="text-sm">Colleges must balance human judgment with AI outputs.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIAdoptionPage;