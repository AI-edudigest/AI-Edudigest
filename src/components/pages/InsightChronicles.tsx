import React from 'react';
import { BookOpen } from 'lucide-react';

const InsightChronicles: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">

      {/* Main Content */}
      <div className="space-y-6">
        
        {/* Section 1: How Common Is AI in Indian Colleges? */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How Common Is AI in Indian Colleges?
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p>
              Today, nearly every student uses smartphones and online tools. Most students use AI—like study apps, 
              chatbots, and even automatic grammar checkers—to help with homework and projects. Teachers are starting 
              to use AI too, but many need more support.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-3 flex-shrink-0"></div>
                <p>Students enjoy learning from AI because it is quick, helpful, and available any time.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-3 flex-shrink-0"></div>
                <p>Studies show students using AI tools score better and learn concepts faster.</p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>In Indian higher education,</strong> AI is crucial because it helps bridge gaps in access and quality, 
                especially with millions of students enrolling each year. With government pushes like Digital India, 
                colleges need tools to handle large classes and diverse needs.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Practical applications</strong> include AI tools for personalized study plans, virtual helpers that 
                answer questions anytime, and systems that track student well-being. For instance, platforms like SWAYAM 
                use AI to suggest courses in local languages, helping rural students.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Teachers and Colleges: Using AI Together */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Teachers and Colleges: Using AI Together
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p>
              For AI to truly help, teachers should learn to use AI tools in their classrooms. Colleges can hold 
              simple training sessions on how to use AI apps, create question banks, and check assignments using technology.
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-[#9b0101] pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Encourage Teacher Adoption</h3>
                <p>Encourage teachers to try basic AI tools and let them share their experiences.</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Form AI Teams</h3>
                <p>Make a small team (teachers, students, admin staff) to plan how AI can be used across the college so everyone benefits.</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Set Clear Guidelines</h3>
                <p>Set clear rules—when students can use AI (for research/help) and when they shouldn't (during exams).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Why AI Is Good for Colleges */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Why AI Is Good for Colleges
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p className="mb-4">Colleges that use AI can:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Attract & Support Students</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get more students who are interested in their courses, help existing students more quickly, and get better academic results.</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Save Resources</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Save money and time, which can be spent improving classes or campus activities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Ethics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ethics: Use AI Responsibly
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Make sure students use AI to help—not to cheat. For example, allow AI for clearing doubts but not for 
              finishing exam papers. Also, protect student data and be open about how AI is used.
            </p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gradient-to-r from-[#9b0101]/10 to-red-50 dark:from-[#9b0101]/20 dark:to-red-900/20 rounded-lg p-6 border border-[#9b0101]/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Key Takeaway
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            AI is transforming Indian colleges by making education more accessible, personalized, and efficient. 
            Success comes from proper training, clear guidelines, and responsible implementation that enhances 
            learning while maintaining academic integrity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightChronicles;
