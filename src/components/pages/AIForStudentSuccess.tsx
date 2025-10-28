import React from 'react';
import { Target } from 'lucide-react';

const AIForStudentSuccess: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">

      {/* Main Content */}
      <div className="space-y-6">
        
        {/* Section 1: Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Introduction
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Student success is the cornerstone of any college or university. With growing class sizes and diverse learning needs, 
              it is challenging for educators to provide personalized support to every student. AI (Artificial Intelligence) has 
              emerged as a powerful tool to enhance learning, track progress, and offer timely interventions, ensuring that 
              students achieve their academic goals.
            </p>
          </div>
        </div>

        {/* Section 2: How AI Supports Students */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How AI Supports Students
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            
            {/* Real-time Performance Monitoring */}
            <div className="border-l-4 border-[#9b0101] pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Performance Monitoring</h3>
              <p>
                AI helps colleges monitor and understand student performance in real time. By analyzing grades, attendance, 
                engagement in online platforms, and assignment submissions, AI can identify students who may be at risk of 
                falling behind. For example, predictive analytics can flag students struggling with specific courses or 
                concepts, allowing advisors and teachers to provide extra support before problems escalate.
              </p>
            </div>

            {/* Personalized Learning Experiences */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Personalized Learning Experiences</h3>
              <p>
                AI also enables personalized learning experiences. Adaptive learning platforms adjust content based on each 
                student's knowledge and pace, providing additional exercises or tutorials when needed. This ensures that 
                learners remain challenged without feeling overwhelmed. For instance, a student struggling in mathematics 
                can receive tailored problem sets or interactive tutorials that focus specifically on their weak areas.
              </p>
            </div>

            {/* 24/7 AI-powered Support */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">24/7 AI-powered Support</h3>
              <p>
                Another important application is 24/7 AI-powered support. Chatbots and virtual assistants can answer 
                student questions regarding coursework, deadlines, campus services, or study resources anytime. This instant 
                support helps students stay engaged and reduces reliance on faculty for routine queries.
              </p>
            </div>

            {/* Career Guidance and Skill Development */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Career Guidance and Skill Development</h3>
              <p>
                AI further enhances career guidance and skill development. By analyzing student interests, performance, 
                and market trends, AI tools can recommend suitable courses, internships, and career paths, helping students 
                make informed decisions about their futures.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Benefits and Impact */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Benefits and Impact
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p>
              The use of AI improves student retention, engagement, and overall academic performance. It allows educators 
              to focus more on meaningful interactions, mentoring, and creative teaching rather than spending time tracking 
              data manually. Students gain a more supportive and responsive learning environment tailored to their needs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Improved Retention</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI helps identify at-risk students early and provides timely interventions</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Enhanced Engagement</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Personalized learning experiences keep students motivated and engaged</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Better Performance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Adaptive learning and instant support improve academic outcomes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Key AI Features for Student Success
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">Predictive analytics for early intervention</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">Adaptive learning platforms</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">24/7 chatbot support</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">Personalized study recommendations</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">Career guidance and pathway planning</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">Real-time progress tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gradient-to-r from-[#9b0101]/10 to-red-50 dark:from-[#9b0101]/20 dark:to-red-900/20 rounded-lg p-6 border border-[#9b0101]/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Transform Your Student Success Program
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            AI technology empowers colleges to provide personalized, data-driven support that helps every student succeed. 
            By implementing AI tools for monitoring, personalization, and support, institutions can create a more engaging 
            and effective learning environment that adapts to each student's unique needs and goals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIForStudentSuccess;
