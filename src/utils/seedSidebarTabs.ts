import { createSidebarTab } from './firebase';

export const seedDefaultSidebarTabs = async () => {
  const defaultTabs = [
    {
      name: 'home',
      label: 'Home',
      icon: 'Home',
      section: 'home',
      order: 0,
      active: true
    },
    {
      name: 'aiToolsSeries',
      label: 'AI Tools Series',
      icon: 'Wrench',
      section: 'aiToolsSeries',
      order: 1,
      active: true
    },
    {
      name: 'promptToContextEngineeringSeries',
      label: 'Prompt to Context Engineering Series',
      icon: 'Sparkles',
      section: 'promptToContextEngineeringSeries',
      order: 2,
      active: true
    },
    {
      name: 'leadersCorner',
      label: 'Leaders\' Corner',
      icon: 'Users',
      section: 'leadersCorner',
      order: 3,
      active: true
    },
    {
      name: 'aiAdoptionGuideMain',
      label: 'AI Adoption Guide',
      icon: 'TrendingUp',
      section: 'aiAdoptionGuideMain',
      order: 4,
      active: true
    },
    {
      name: 'responsibleAIFrameworkGuide',
      label: 'Responsible AI Framework Guide',
      icon: 'Shield',
      section: 'responsibleAIFrameworkGuide',
      order: 5,
      active: true
    },
    {
      name: 'facultyFocus',
      label: 'Faculty Focus (Educators)',
      icon: 'GraduationCap',
      section: 'facultyFocus',
      order: 6,
      active: true
    },
    {
      name: 'managementMatters',
      label: 'Management Matters',
      icon: 'Briefcase',
      section: 'managementMatters',
      order: 7,
      active: true
    },
    {
      name: 'dataLiteracyTrack',
      label: 'Data Literacy Track',
      icon: 'Database',
      section: 'dataLiteracyTrack',
      order: 8,
      active: true
    },
    {
      name: 'insightChronicles',
      label: 'Insight Chronicles',
      icon: 'BookOpen',
      section: 'insightChronicles',
      order: 9,
      active: true,
      hasSubmenu: true,
      submenu: [
        { id: 'aiCollegeBrandBuilding', label: 'AI for College Brand Building', section: 'aiCollegeBrandBuilding' },
        { id: 'aiCostCutting', label: 'AI For Cost Cutting', section: 'aiCostCutting' }
      ]
    },
    {
      name: 'aiStudentSuccess',
      label: 'AI For Student Success',
      icon: 'Target',
      section: 'aiStudentSuccess',
      order: 10,
      active: true
    },
    {
      name: 'aiAccreditation',
      label: 'AI & Accreditation',
      icon: 'Award',
      section: 'aiAccreditation',
      order: 11,
      active: true
    },
    {
      name: 'aiStrategicGrowth',
      label: 'AI For Strategic Growth',
      icon: 'TrendingUp',
      section: 'aiStrategicGrowth',
      order: 12,
      active: true
    },
    {
      name: 'aiGlobalCompetitiveness',
      label: 'AI For Global Competitiveness',
      icon: 'Globe',
      section: 'aiGlobalCompetitiveness',
      order: 13,
      active: true
    },
    {
      name: 'eMagazine',
      label: 'E-Magazine',
      icon: 'BookOpen',
      section: 'eMagazine',
      order: 14,
      active: true
    },
    {
      name: 'learningDocs',
      label: 'Learning Docs',
      icon: 'FileText',
      section: 'learningDocs',
      order: 15,
      active: true
    }
  ];

  try {
    console.log('🌱 Seeding default sidebar tabs...');
    
    for (const tab of defaultTabs) {
      const { success, error } = await createSidebarTab(tab);
      if (success) {
        console.log(`✅ Created sidebar tab: ${tab.label}`);
      } else {
        console.error(`❌ Failed to create sidebar tab ${tab.label}:`, error);
      }
    }
    
    console.log('🎉 Default sidebar tabs seeded successfully!');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('❌ Error seeding default sidebar tabs:', error);
    return { success: false, error: error.message };
  }
};
