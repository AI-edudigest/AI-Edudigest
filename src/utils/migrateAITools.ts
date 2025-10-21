import { getAITools, createAITool, deleteAITool } from './firebase';

// All hardcoded AI Tools from ResourcePages
export const hardcodedAITools = [
  {
    name: 'ChatGPT',
    description: 'Advanced conversational AI for various tasks',
    category: 'Conversational AI',
    link: 'https://chat.openai.com',
    rating: 4.8,
    active: true
  },
  {
    name: 'Claude',
    description: 'AI assistant for analysis, writing, and coding',
    category: 'AI Assistant',
    link: 'https://claude.ai',
    rating: 4.7,
    active: true
  },
  {
    name: 'Midjourney',
    description: 'AI-powered image generation tool',
    category: 'Image Generation',
    link: 'https://midjourney.com',
    rating: 4.6,
    active: true
  },
  {
    name: 'GitHub Copilot',
    description: 'AI pair programmer for code completion',
    category: 'Development',
    link: 'https://github.com/features/copilot',
    rating: 4.5,
    active: true
  },
  {
    name: 'IBM Watson Assistant',
    description: 'Enterprise-grade AI chatbot for support and education',
    category: 'Conversational AI',
    link: 'https://www.ibm.com/watson/assistant',
    rating: 4.5,
    active: true
  },
  {
    name: 'Grammarly',
    description: 'AI writing assistant for clarity, tone, and grammar improvement',
    category: 'Writing Assistant',
    link: 'https://www.grammarly.com',
    rating: 4.7,
    active: true
  },
  {
    name: 'Otter.ai',
    description: 'AI-powered meeting and lecture transcription tool',
    category: 'Speech-to-Text',
    link: 'https://otter.ai',
    rating: 4.6,
    active: true
  },
  {
    name: 'Elicit.org',
    description: 'AI research assistant that automates literature reviews and summaries',
    category: 'Research',
    link: 'https://elicit.org',
    rating: 4.8,
    active: true
  },
  {
    name: 'Khanmigo (Khan Academy)',
    description: 'AI tutor designed for students and teachers',
    category: 'Education',
    link: 'https://www.khanacademy.org/khan-labs',
    rating: 4.5,
    active: true
  },
  {
    name: 'Power BI (with AI Insights)',
    description: 'Data visualization and analytics powered by Microsoft AI',
    category: 'Data Visualization',
    link: 'https://powerbi.microsoft.com',
    rating: 4.6,
    active: true
  },
  {
    name: 'Perplexity AI',
    description: 'AI search and reasoning engine with real-time citations',
    category: 'AI Research',
    link: 'https://www.perplexity.ai',
    rating: 4.8,
    active: true
  }
];

// Migrate hardcoded tools to Firebase
export const migrateHardcodedToolsToFirebase = async () => {
  try {
    console.log('🔄 Starting migration of hardcoded AI Tools to Firebase...');
    
    const { tools: existingTools, error } = await getAITools();
    if (error) {
      console.error('Error fetching existing tools:', error);
      return { success: false, error };
    }

    console.log(`📊 Found ${existingTools.length} existing tools in Firebase`);

    // Create a map of existing tool names
    const existingToolNames = new Set(existingTools.map((tool: any) => tool.name));

    let addedCount = 0;
    const skippedTools: string[] = [];

    for (const tool of hardcodedAITools) {
      if (existingToolNames.has(tool.name)) {
        console.log(`⏭️ Skipping "${tool.name}" - already exists`);
        skippedTools.push(tool.name);
        continue;
      }

      const { success, error } = await createAITool(tool);
      if (success) {
        console.log(`✅ Migrated: ${tool.name}`);
        addedCount++;
      } else {
        console.error(`❌ Failed to migrate "${tool.name}":`, error);
      }
    }

    console.log(`🎉 Migration complete! Added ${addedCount} tools, skipped ${skippedTools.length} existing tools`);
    
    return { 
      success: true, 
      addedCount,
      skippedCount: skippedTools.length,
      message: `Successfully migrated ${addedCount} AI Tools to Firebase!`
    };

  } catch (error: any) {
    console.error('❌ Error during migration:', error);
    return { success: false, error: error.message };
  }
};

// Remove duplicate AI Tools from Firebase
export const removeDuplicateAITools = async () => {
  try {
    console.log('🧹 Checking for duplicate AI Tools...');
    
    const { tools, error } = await getAITools();
    if (error) {
      return { success: false, error };
    }

    if (tools.length === 0) {
      return { success: true, message: 'No tools found' };
    }

    // Group tools by name
    const toolsByName: { [key: string]: any[] } = {};
    tools.forEach((tool: any) => {
      if (!toolsByName[tool.name]) {
        toolsByName[tool.name] = [];
      }
      toolsByName[tool.name].push(tool);
    });

    // Find and remove duplicates (keep the first one)
    let removedCount = 0;
    for (const name in toolsByName) {
      if (toolsByName[name].length > 1) {
        console.log(`🔄 Found ${toolsByName[name].length} instances of "${name}"`);
        // Keep the first, delete the rest
        for (let i = 1; i < toolsByName[name].length; i++) {
          const { success } = await deleteAITool(toolsByName[name][i].id);
          if (success) {
            console.log(`✅ Deleted duplicate: ${name}`);
            removedCount++;
          }
        }
      }
    }

    if (removedCount === 0) {
      return { success: true, message: 'No duplicates found' };
    }

    return { 
      success: true, 
      message: `Removed ${removedCount} duplicate AI Tools`,
      removedCount
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
