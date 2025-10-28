import React from 'react';
import { Users } from 'lucide-react';

const ManagementMatters: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">

      {/* Main Content */}
      <div className="space-y-6">
        
        {/* Section 1: Why AI is Useful for College Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Why AI is Useful for College Management
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p>
              Managing a college involves lots of paperwork, phone calls, schedules, and keeping track of many students and teachers. 
              It's easy for staff to get overwhelmed or for things to fall through the cracks. AI—Artificial Intelligence—is like a 
              smart assistant that helps with daily work, making tasks faster and easier.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-3 flex-shrink-0"></div>
                <p>AI can take care of routine jobs like marking attendance, updating records, processing forms, and responding to student questions.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-3 flex-shrink-0"></div>
                <p>This leaves more time for staff and teachers to focus on helping students, planning events, or improving courses.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-3 flex-shrink-0"></div>
                <p>Colleges that use AI see fewer mistakes and faster completion of tasks.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Practical Ways to Use AI in Colleges */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Practical Ways to Use AI in Colleges
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p className="mb-4">
              Some simple examples of AI helping in college management:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-[#9b0101] pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Automatic Attendance Tracking</h3>
                <p>Using apps to automatically record student attendance whenever they enter the classroom.</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Student Query Chatbots</h3>
                <p>Setting up chatbots that reply to student queries about fees, exam dates, or hostel timings—even after office hours.</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Form Processing & Error Detection</h3>
                <p>Automatically sorting admission forms and highlighting any errors for the staff.</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Scheduling</h3>
                <p>Scheduling classes to avoid clashes and making sure classrooms are not double-booked.</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-6">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Result:</strong> With these tools, tasks that took hours before can be finished in minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: How to Start with AI */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How to Start with AI (Easy Steps)
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p className="mb-4">
              It's best to begin small:
            </p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Step 1: Choose One Area</h3>
                <p>Choose one area, like admissions or fee collection, and put a basic AI tool there (for example, an online chatbot, or automated SMS reminders).</p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Step 2: Train Staff</h3>
                <p>Train staff with simple hands-on workshops—showing clearly how the tool works and why it's useful.</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Step 3: Monitor & Expand</h3>
                <p>Monitor for a few months to check for improvements and collect feedback. As people become comfortable, spread the use of AI tools to other departments.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gradient-to-r from-[#9b0101]/10 to-red-50 dark:from-[#9b0101]/20 dark:to-red-900/20 rounded-lg p-6 border border-[#9b0101]/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Key Takeaway
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            AI in college management is not about replacing human staff, but about making their work more efficient and 
            allowing them to focus on what matters most—providing quality education and support to students. Start small, 
            train your team, and gradually expand AI implementation across your institution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManagementMatters;
