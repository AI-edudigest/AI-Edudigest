import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const PromptToContextPage: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">

      {/* Introduction Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Introduction</h2>
        
        {/* What is Prompt Engineering */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            What is Prompt Engineering?
          </h3>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p>
              Prompt engineering is the art of asking AI the right questions so it gives useful, accurate, and meaningful answers. Think of AI like a smart assistant — the better you ask, the better the result.
            </p>
            <p>For colleges, <strong className="text-gray-900 dark:text-white">prompt engineering</strong> helps in:</p>
            <ul className="space-y-2 ml-6">
              <li className="list-disc">Creating lesson plans and quizzes quickly.</li>
              <li className="list-disc">Generating administrative summaries and reports.</li>
            </ul>
          </div>
        </div>

        {/* Why Prompt to Context Engineering */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Why Prompt to Context Engineering?
          </h3>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            <p>
              Prompt to Context Engineering is about moving from just <em>asking AI questions</em> (Prompting) to <em>guiding AI with the right background</em> (Context).
            </p>
            <p>Think of it like this:</p>
            <ul className="space-y-2 ml-6">
              <li className="list-disc">
                <strong className="text-gray-900 dark:text-white">Prompt Engineering</strong> = <em>What to ask?</em>
              </li>
              <li className="list-disc">
                <strong className="text-gray-900 dark:text-white">Context Engineering</strong> = <em>How to ask with details?</em>
              </li>
            </ul>
            <p>
              For colleges, this series helps <strong className="text-gray-900 dark:text-white">leaders, educators, and admins</strong> use AI smarter — saving time, improving decisions, and boosting student learning — all without coding skills.
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {/* For Leaders Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('leaders')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              For Leaders (Principals, Directors, Management)
            </h3>
            {expandedSection === 'leaders' ? (
              <ChevronUp className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'leaders' && (
            <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
                
                {/* Prompt Engineering for Leaders */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Prompt Engineering For Leaders</h4>
                  <p className="mb-3"><strong>Goal:</strong> Use AI to make decisions and plan college work easily.</p>
                  
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Easy Ways to Use AI:</p>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">1. Plan AI projects for your college</p>
                      <ul className="ml-6 space-y-1 text-sm">
                        <li><strong>Prompt:</strong> "Give simple steps for using AI in a small college for teaching and administration."</li>
                        <li><strong>Result:</strong> A clear, easy roadmap for leaders.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">2. Check student performance</p>
                      <ul className="ml-6 space-y-1 text-sm">
                        <li><strong>Prompt:</strong> "Summarize student attendance and suggest ways to help students who miss classes."</li>
                        <li><strong>Result:</strong> Quick insights to take action.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Zero-Shot Example for Leaders */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Zero-Shot Prompting Example:</h5>
                  <p className="text-sm">"Prepare a 5-year strategic growth plan for our college covering student admissions, teacher training, infrastructure, and digital learning adoption."</p>
                </div>

                {/* One-Shot Example for Leaders */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">One-Shot Prompting Example:</h5>
                  <p className="text-sm mb-2"><strong>Example:</strong> "Report Format: 1. Academic Progress, 2. Student Achievements, 3. Challenges."</p>
                  <p className="text-sm"><strong>Prompt:</strong> "Now prepare a quarterly report on staff performance in the same format."</p>
                </div>

                {/* Few-Shot Example for Leaders */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Few-Shot Prompting Example:</h5>
                  <p className="text-sm">"Policy Draft: Title – Student Attendance | Rule – 75% compulsory attendance | Action – Warning after 3 absences"</p>
                </div>

                {/* Context Engineering for Leaders */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Context Engineering For Leaders</h4>
                  <p className="mb-3"><strong>Why it matters:</strong> Leaders are responsible for vision, strategy, and policy-making. Using context ensures AI provides realistic plans tailored to their college.</p>
                  
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">How to Apply Context:</p>
                  <ul className="list-disc ml-6 space-y-1 mb-4">
                    <li>Define the institution: Mention size, type (government/private), and budget.</li>
                    <li>State the goal: Is it improving academics, reducing workload, or modernizing operations?</li>
                    <li>Set timeframe: Short-term vs. long-term plan.</li>
                  </ul>

                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm mb-2"><strong>❌ Weak Prompt:</strong> "How to use AI in college?"</p>
                    <p className="text-sm"><strong>✅ Strong Prompt:</strong> "We are a government college in India with 2,000 students and limited funding. Suggest a 1-year roadmap to adopt AI for administration and student support."</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* For Educators Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('educators')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              For Educators (Teachers, Lecturers)
            </h3>
            {expandedSection === 'educators' ? (
              <ChevronUp className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'educators' && (
            <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
                
                {/* Prompt Engineering for Educators */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Prompt Engineering For Educators</h4>
                  <p className="mb-3"><strong>Goal:</strong> Use AI to save time and help students learn better.</p>
                  
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Easy Ways to Use AI:</p>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">1. Prepare lessons and quizzes</p>
                      <ul className="ml-6 space-y-1 text-sm">
                        <li><strong>Prompt:</strong> "Create a simple 5-day lesson plan for Class 12 chemistry on Solid state."</li>
                        <li><strong>Prompt:</strong> "Make a 10-question quiz on Algebra for Class 12 students."</li>
                        <li><strong>Result:</strong> Teachers get ready-to-use content they can quickly edit.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">2. Suggest extra practice for students</p>
                      <ul className="ml-6 space-y-1 text-sm">
                        <li><strong>Prompt:</strong> "Give simple exercises for a student struggling in Calculus."</li>
                        <li><strong>Result:</strong> Personalized help for students easily.</li>
                      </ul>
                    </div>
                  </div>
                  <p className="mt-3 italic text-sm">💡 Tip: AI helps you do the hard work faster, but you still guide the students.</p>
                </div>

                {/* Zero-Shot Example for Educators */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Zero-Shot Prompting Example:</h5>
                  <p className="text-sm">"Design a full semester curriculum for Data Science that includes weekly topics, practical labs, and assessments, aligned with industry skills."</p>
                </div>

                {/* One-Shot Example for Educators */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">One-Shot Prompting Example:</h5>
                  <p className="text-sm mb-2"><strong>Example:</strong> "Lesson Plan: Topic – Newton's Laws | Time – 60 mins | Method – Experiment + Discussion | Homework – Write applications in real life."</p>
                  <p className="text-sm"><strong>Prompt:</strong> "Now create a lesson plan for Quantum Mechanics in the same format."</p>
                </div>

                {/* Context Engineering for Educators */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Context Engineering For Educators</h4>
                  <p className="mb-3"><strong>Why it matters:</strong> Teachers need AI to support lesson planning, assessments, and student engagement. Context ensures AI generates content that matches syllabus, level, and teaching style.</p>
                  
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">How to Apply Context:</p>
                  <ul className="list-disc ml-6 space-y-1 mb-4">
                    <li>Specify grade/class.</li>
                    <li>Mention board/syllabus (CBSE, ICSE, State Board, etc.).</li>
                    <li>Describe student need (remedial, advanced, engagement).</li>
                  </ul>

                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm mb-2"><strong>❌ Weak Prompt:</strong> "Make a history lesson plan."</p>
                    <p className="text-sm"><strong>✅ Strong Prompt:</strong> "Create a 5-day lesson plan for Class 12 CBSE History, Chapter: Revolt of 1857, with daily activities, short quizzes, and a reflection question."</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* For Administration Staff Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('admin')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              For Administration Staff (Office/Academic Admin)
            </h3>
            {expandedSection === 'admin' ? (
              <ChevronUp className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'admin' && (
            <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
                
                {/* Prompt Engineering for Administration */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Prompt Engineering For Administration</h4>
                  <p className="mb-3"><strong>Goal:</strong> Use AI to make office work faster and easier.</p>
                  
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">Easy Ways to Use AI:</p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">1. Generate reports quickly</p>
                      <p className="ml-6 text-sm"><strong>Prompt:</strong> "Summarize monthly student attendance and highlight students with many absences."</p>
                    </div>
                    <div>
                      <p className="font-medium">2. Write emails</p>
                      <p className="ml-6 text-sm"><strong>Prompt:</strong> "Draft a polite email reminding students about fee submission deadlines."</p>
                    </div>
                    <div>
                      <p className="font-medium">3. Improve work processes</p>
                      <p className="ml-6 text-sm"><strong>Prompt:</strong> "Suggest simple ways to make library management faster using AI."</p>
                    </div>
                    <div>
                      <p className="font-medium">4. Keep student data safe</p>
                      <p className="ml-6 text-sm"><strong>Prompt:</strong> "List easy ways to store student information securely and safely."</p>
                    </div>
                  </div>
                </div>

                {/* Zero-Shot Example for Administration */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Zero-Shot Prompting Example:</h5>
                  <p className="text-sm">"Generate a detailed annual financial report with monthly income, expenses, surplus/deficit, and recommendations for cost optimization."</p>
                </div>

                {/* One-Shot Example for Administration */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">One-Shot Prompting Example:</h5>
                  <p className="text-sm mb-2"><strong>Example:</strong> "Budget Table: Category – Library | Planned – ₹50,000 | Spent – ₹45,000 | Balance – ₹5,000."</p>
                  <p className="text-sm"><strong>Prompt:</strong> "Now prepare a budget table for Laboratory expenses in the same format."</p>
                </div>

                {/* Few-Shot Example for Administration */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Few-Shot Prompting Example:</h5>
                  <p className="text-sm">"Timetable Entry: Room 101 | Subject – Physics | Time – 9:00–10:00 | Teacher – Mr. Sharma"</p>
                  <p className="text-sm mt-2"><strong>Prompt:</strong> "Now add an entry for Computer Science in Room 103, 11:00–12:00 with Dr. Reddy in the same format."</p>
                </div>

                {/* Context Engineering for Administration */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Context Engineering For Administration</h4>
                  <p className="mb-3"><strong>Why it matters:</strong> Admins handle records, communication, and operations. Context ensures AI-generated reports and emails are accurate and relevant.</p>
                  
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">How to Apply Context:</p>
                  <ul className="list-disc ml-6 space-y-1 mb-4">
                    <li>Specify department or student group.</li>
                    <li>Add timeframe (monthly, semester, annual).</li>
                    <li>State the purpose (report, email, policy).</li>
                  </ul>

                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm mb-2"><strong>❌ Weak Prompt:</strong> "Make attendance report."</p>
                    <p className="text-sm"><strong>✅ Strong Prompt:</strong> "Generate a monthly attendance report for Class 11 Commerce (60 students), highlight those below 70% attendance, and suggest actions for improvement."</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptToContextPage;