import { createArticle, createSponsor } from './firebase';

export const addSampleArticles = async () => {
  const sampleArticles = [
    {
      title: "ChatGPT's New 'Lunch' Feature: Personalized Meal Recommendations",
      content: "OpenAI introduces a new Lunch feature in ChatGPT, allowing users to get personalized meal recommendations based on their dietary preferences, location, and time of day. This innovative feature uses AI to suggest restaurants, recipes, and meal plans tailored to individual needs. The feature integrates with popular food delivery services and provides nutritional information for each recommendation. Users can specify dietary restrictions, budget constraints, and taste preferences to receive highly customized suggestions. This development represents a significant step forward in AI-powered lifestyle assistance, making meal planning more convenient and personalized than ever before.",
      excerpt: "OpenAI introduces a new Lunch feature in ChatGPT, allowing users to get personalized meal recommendations based on their dietary preferences, location, and time of day.",
      author: "Sufiyan",
      published: true
    },
    {
      title: "AI Revolution in Education: How Machine Learning is Transforming Learning",
      content: "Artificial Intelligence is revolutionizing the education sector by providing personalized learning experiences, automated grading systems, and intelligent tutoring. Machine learning algorithms can now adapt to individual student learning styles, pace, and preferences, creating customized educational pathways. AI-powered tools are helping educators identify struggling students early and provide targeted interventions. Virtual reality and augmented reality technologies, combined with AI, are creating immersive learning environments that make complex concepts more accessible. The integration of AI in education is not replacing teachers but enhancing their capabilities and allowing them to focus on what they do best - inspiring and mentoring students.",
      excerpt: "Artificial Intelligence is revolutionizing the education sector by providing personalized learning experiences, automated grading systems, and intelligent tutoring.",
      author: "AI EduDigest Team",
      published: true
    },
    {
      title: "The Future of AI in Healthcare: Predictive Analytics and Patient Care",
      content: "Healthcare is experiencing a transformation through AI-powered predictive analytics, diagnostic tools, and personalized treatment plans. Machine learning algorithms can now analyze medical images with accuracy comparable to or exceeding human radiologists. AI systems are being used to predict patient outcomes, identify potential health risks, and recommend preventive measures. Natural language processing is helping healthcare providers extract insights from patient records and medical literature. The integration of AI in healthcare is improving patient outcomes, reducing costs, and enabling more efficient resource allocation. However, challenges remain in ensuring data privacy, addressing bias in AI systems, and maintaining the human touch in patient care.",
      excerpt: "Healthcare is experiencing a transformation through AI-powered predictive analytics, diagnostic tools, and personalized treatment plans.",
      author: "Dr. Sarah Johnson",
      published: true
    }
  ];

  try {
    for (const article of sampleArticles) {
      await createArticle(article);
      console.log(`Created article: ${article.title}`);
    }
    console.log('All sample articles created successfully!');
  } catch (error) {
    console.error('Error creating sample articles:', error);
  }
};

export const addSampleSponsors = async () => {
  const sampleSponsors = [
    {
      name: "TechEdu Solutions",
      description: "Leading provider of AI-powered educational technology solutions for universities and colleges worldwide.",
      website: "https://techedu-solutions.com",
      logo: "https://via.placeholder.com/200x100/9b0101/ffffff?text=TechEdu",
      active: true
    },
    {
      name: "AI Learning Hub",
      description: "Comprehensive platform for AI education, offering courses, certifications, and hands-on projects.",
      website: "https://ai-learning-hub.com",
      logo: "https://via.placeholder.com/200x100/0066cc/ffffff?text=AI+Hub",
      active: true
    },
    {
      name: "EduTech Innovations",
      description: "Pioneering the future of education with cutting-edge AI tools and personalized learning experiences.",
      website: "https://edutech-innovations.com",
      logo: "https://via.placeholder.com/200x100/00aa44/ffffff?text=EduTech",
      active: true
    }
  ];

  try {
    for (const sponsor of sampleSponsors) {
      await createSponsor(sponsor);
      console.log(`Created sponsor: ${sponsor.name}`);
    }
    console.log('All sample sponsors created successfully!');
  } catch (error) {
    console.error('Error creating sample sponsors:', error);
  }
};
