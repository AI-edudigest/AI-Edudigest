import React from 'react';
import { BookOpen, Brain, Shield, Bot, FileText } from 'lucide-react';
import ArticleTTS from '../common/ArticleTTS';

interface GenericPageProps {
  title: string;
  description: string;
  section: string;
}

const GenericPage: React.FC<GenericPageProps> = ({ title, description, section }) => {
  const getIcon = (section: string) => {
    switch (section) {
      case 'learningModules':
      case 'aiFundamentals':
      case 'aiIntro':
      case 'aiInEducation':
      case 'whyCollegeAdoptAI':
        return BookOpen;
      case 'generativeAI':
        return Brain;
      case 'responsibleAI':
        return Shield;
      case 'aiAgent':
        return Bot;
      case 'promptEngineering':
        return FileText;
      case 'facultyFocus':
        return BookOpen;
      case 'dataLiteracyTrack':
        return Brain;
      case 'aiAccreditation':
        return Shield;
      case 'aiStrategicGrowth':
        return Bot;
      case 'aiGlobalCompetitiveness':
        return Brain;
      default:
        return BookOpen;
    }
  };

  const Icon = getIcon(section);

  const getContent = (section: string) => {
    switch (section) {
      case 'learningModules':
        return {
          content: [
            'Explore comprehensive AI learning modules designed for college students and educators.',
            'Our structured curriculum covers everything from basic AI concepts to advanced applications.',
            'Interactive lessons, practical exercises, and real-world case studies.'
          ],
          features: [
            'Interactive Learning Paths',
            'Hands-on Projects',
            'Assessment Tools',
            'Progress Tracking'
          ]
        };
      case 'aiFundamentals':
        return {
          content: [
            'Master the fundamental concepts of Artificial Intelligence.',
            'Learn about machine learning, neural networks, and AI algorithms.',
            'Build a solid foundation for advanced AI topics.'
          ],
          features: [
            'Core AI Concepts',
            'Mathematical Foundations',
            'Algorithm Understanding',
            'Practical Applications'
          ]
        };
      case 'aiIntro':
        return {
          content: [
            'Introduction to Artificial Intelligence for beginners.',
            'Understand what AI is, its history, and current applications.',
            'Perfect starting point for your AI journey.'
          ],
          features: [
            'AI History & Evolution',
            'Types of AI Systems',
            'Current Applications',
            'Future Prospects'
          ]
        };
      case 'aiInEducation':
        return {
          content: [
            'Discover how AI is transforming education.',
            'Learn about AI-powered learning tools and platforms.',
            'Understand the impact of AI on teaching and learning.'
          ],
          features: [
            'AI-Powered Learning Tools',
            'Personalized Education',
            'Automated Assessment',
            'Educational Analytics'
          ]
        };
      case 'whyCollegeAdoptAI':
        return {
          content: [
            'Understand why colleges are adopting AI technologies.',
            'Explore the benefits and challenges of AI in higher education.',
            'Learn about successful AI implementation strategies.'
          ],
          features: [
            'Strategic Benefits',
            'Implementation Challenges',
            'Success Stories',
            'Best Practices'
          ]
        };
      case 'generativeAI':
        return {
          content: [
            'Explore the world of Generative Artificial Intelligence.',
            'Learn about GPT models, image generation, and creative AI.',
            'Understand the capabilities and limitations of generative models.'
          ],
          features: [
            'Large Language Models',
            'Image Generation',
            'Creative Applications',
            'Ethical Considerations'
          ]
        };
      case 'responsibleAI':
        return {
          content: [
            'Learn about responsible AI development and deployment.',
            'Understand AI ethics, bias, and fairness.',
            'Develop skills for creating trustworthy AI systems.'
          ],
          features: [
            'AI Ethics Framework',
            'Bias Detection & Mitigation',
            'Fairness in AI',
            'Transparency & Explainability'
          ]
        };
      case 'aiAgent':
        return {
          content: [
            'Build and deploy intelligent AI agents.',
            'Learn about autonomous systems and decision-making.',
            'Understand agent architectures and communication.'
          ],
          features: [
            'Agent Architectures',
            'Decision Making Systems',
            'Multi-Agent Systems',
            'Real-world Applications'
          ]
        };
      case 'promptEngineering':
        return {
          content: [
            'Master the art of prompt engineering for AI models.',
            'Learn techniques for effective AI communication.',
            'Optimize AI outputs through strategic prompting.'
          ],
          features: [
            'Prompt Design Principles',
            'Advanced Techniques',
            'Model-Specific Strategies',
            'Performance Optimization'
          ]
        };
      case 'facultyFocus':
        return {
          content: [
            'Comprehensive resources and tools for educators to integrate AI into their teaching practices.',
            'Learn how to effectively incorporate AI technologies in your classroom and curriculum.',
            'Access practical guides, lesson plans, and best practices for AI-enhanced education.'
          ],
          features: [
            'Teaching Resources',
            'Lesson Plans',
            'Best Practices',
            'AI Tools for Educators'
          ]
        };
      case 'dataLiteracyTrack':
        return {
          content: [
            'Building data literacy skills and understanding for the AI-driven educational landscape.',
            'Develop essential skills to work with data, understand AI systems, and make informed decisions.',
            'Learn to interpret, analyze, and communicate data effectively in educational contexts.'
          ],
          features: [
            'Data Analysis Skills',
            'AI System Understanding',
            'Data Visualization',
            'Critical Thinking'
          ]
        };
      case 'aiAccreditation':
        return {
          content: [
            'AI integration strategies that support and enhance institutional accreditation processes.',
            'Learn how AI can help meet accreditation standards and improve institutional quality.',
            'Explore frameworks for implementing AI while maintaining compliance and quality assurance.'
          ],
          features: [
            'Accreditation Standards',
            'Quality Assurance',
            'Compliance Frameworks',
            'Institutional Excellence'
          ]
        };
      case 'aiStrategicGrowth':
        return {
          content: [
            'Strategic AI implementation for sustainable institutional growth and development.',
            'Develop long-term AI strategies that align with your institution\'s mission and goals.',
            'Learn to plan, implement, and scale AI initiatives for maximum impact and sustainability.'
          ],
          features: [
            'Strategic Planning',
            'Growth Strategies',
            'Implementation Roadmaps',
            'Sustainability Planning'
          ]
        };
      case 'aiGlobalCompetitiveness':
        return {
          content: [
            'Global AI strategies to position your institution competitively in the international education market.',
            'Learn how to leverage AI to enhance your institution\'s global reputation and competitiveness.',
            'Explore international best practices and strategies for AI adoption in higher education.'
          ],
          features: [
            'Global Positioning',
            'International Best Practices',
            'Competitive Advantage',
            'Market Leadership'
          ]
        };
      default:
        return {
          content: [
            'Welcome to this section of the AI-EduDigest platform.',
            'Explore comprehensive resources and learning materials.',
            'Enhance your understanding of artificial intelligence.'
          ],
          features: [
            'Comprehensive Resources',
            'Interactive Content',
            'Expert Guidance',
            'Practical Applications'
          ]
        };
    }
  };

  const { content, features } = getContent(section);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h2>
              <ArticleTTS
                articleText={content.join(' ')}
                articleTitle={`${title} - Overview`}
                articleId={`generic-${section}-overview`}
                isActive={false}
                className="absolute top-6 right-6"
              />
            </div>
            <div className="space-y-4">
              {content.map((paragraph, index) => (
                <p key={index} className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Learning Objectives</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-2"></div>
                  <p className="text-gray-600 dark:text-gray-300">Understand core concepts and principles</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-2"></div>
                  <p className="text-gray-600 dark:text-gray-300">Apply knowledge to real-world scenarios</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-2"></div>
                  <p className="text-gray-600 dark:text-gray-300">Develop practical skills and expertise</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#9b0101] rounded-full mt-2"></div>
                  <p className="text-gray-600 dark:text-gray-300">Build confidence in AI technologies</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Features</h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#9b0101]/10 to-[#9b0101]/5 dark:from-[#9b0101]/20 dark:to-[#9b0101]/10 rounded-lg border border-[#9b0101]/30 dark:border-[#9b0101]/50 p-6">
            <h3 className="text-lg font-semibold text-[#9b0101] dark:text-[#9b0101] mb-3">Get Started</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
              Ready to dive deeper into this topic? Start with our interactive lessons and hands-on exercises.
            </p>
            <button className="w-full bg-[#9b0101] hover:bg-[#7a0101] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Start Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericPage;