import { createResourceTab } from './firebase';

export const seedResourceTabs = async () => {
  const defaultResourceTabs = [
    {
      name: 'Upcoming Events',
      description: 'Discover upcoming AI and education events',
      icon: '📅',
      color: 'text-green-500',
      link: '/resources/upcomingEvents',
      category: 'events',
      active: true,
      order: 0
    },
    {
      name: 'Recommended Books',
      description: 'Curated list of AI and education books',
      icon: '📚',
      color: 'text-purple-500',
      link: '/resources/recommendedBooks',
      category: 'books',
      active: true,
      order: 1
    },
    {
      name: 'Prompt Templates',
      description: 'Ready-to-use AI prompt templates',
      icon: '💡',
      color: 'text-yellow-500',
      link: '/resources/promptTemplates',
      category: 'templates',
      active: true,
      order: 2
    },
    {
      name: 'Free Courses',
      description: 'Free AI and education courses',
      icon: '🎓',
      color: 'text-indigo-500',
      link: '/resources/freeCourses',
      category: 'courses',
      active: true,
      order: 3
    },
    {
      name: 'Feedback & Recommendation',
      description: 'Share feedback and get recommendations',
      icon: '💬',
      color: 'text-pink-500',
      link: '/resources/feedback',
      category: 'feedback',
      active: true,
      order: 4
    }
  ];

  try {
    console.log('Seeding default Resource Tabs...');
    for (const tab of defaultResourceTabs) {
      await createResourceTab(tab);
    }
    console.log('Default Resource Tabs seeded successfully.');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error seeding Resource Tabs:', error);
    return { success: false, error: error.message };
  }
};
