/**
 * Resume Template Definitions
 * All templates are ATS-safe with plain text structure
 */

export type TemplateType = 'modern' | 'classic' | 'technical' | 'creative' | 'minimal';

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  icon: string;
  sectionSpacing: 'compact' | 'normal' | 'spacious';
  fontFamily: 'sans-serif' | 'serif';
  headingStyle: 'bold' | 'bold-uppercase' | 'bold-underline';
  bulletStyle: 'dash' | 'dot' | 'arrow';
  colors: {
    heading: string;
    text: string;
    accent: string;
  };
  atsScore: number; // 0-100, higher is better for ATS
}

export const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, contemporary design with subtle accents. Great for tech and creative roles.',
    icon: '✨',
    sectionSpacing: 'normal',
    fontFamily: 'sans-serif',
    headingStyle: 'bold-uppercase',
    bulletStyle: 'dash',
    colors: {
      heading: '#1e40af', // Blue
      text: '#1f2937', // Dark gray
      accent: '#3b82f6', // Light blue
    },
    atsScore: 92,
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional, professional format. Ideal for corporate and traditional industries.',
    icon: '📋',
    sectionSpacing: 'normal',
    fontFamily: 'serif',
    headingStyle: 'bold',
    bulletStyle: 'dot',
    colors: {
      heading: '#000000', // Black
      text: '#1f2937', // Dark gray
      accent: '#374151', // Medium gray
    },
    atsScore: 98, // Highest ATS compatibility
  },
  technical: {
    id: 'technical',
    name: 'Technical',
    description: 'Optimized for technical roles with prominent skills section. Perfect for engineers.',
    icon: '⚙️',
    sectionSpacing: 'compact',
    fontFamily: 'sans-serif',
    headingStyle: 'bold-uppercase',
    bulletStyle: 'arrow',
    colors: {
      heading: '#059669', // Green
      text: '#1f2937', // Dark gray
      accent: '#10b981', // Light green
    },
    atsScore: 95,
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Modern with distinctive styling. Suitable for design, marketing, and creative fields.',
    icon: '🎨',
    sectionSpacing: 'spacious',
    fontFamily: 'sans-serif',
    headingStyle: 'bold-uppercase',
    bulletStyle: 'dash',
    colors: {
      heading: '#7c3aed', // Purple
      text: '#1f2937', // Dark gray
      accent: '#a78bfa', // Light purple
    },
    atsScore: 88,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean, text-focused format. Maximum ATS compatibility and readability.',
    icon: '📄',
    sectionSpacing: 'compact',
    fontFamily: 'sans-serif',
    headingStyle: 'bold',
    bulletStyle: 'dash',
    colors: {
      heading: '#000000', // Black
      text: '#000000', // Black
      accent: '#4b5563', // Dark gray
    },
    atsScore: 100, // Perfect ATS score
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);

/**
 * Get template configuration by ID
 */
export function getTemplate(id: TemplateType): TemplateConfig {
  return TEMPLATES[id];
}

/**
 * Format section heading based on template style
 */
export function formatHeading(text: string, template: TemplateConfig): string {
  const upper = text.toUpperCase();
  switch (template.headingStyle) {
    case 'bold-uppercase':
      return upper;
    case 'bold-underline':
      return `${upper}\n${'='.repeat(upper.length)}`;
    case 'bold':
    default:
      return text;
  }
}

/**
 * Format bullet point based on template style
 */
export function formatBullet(text: string, template: TemplateConfig): string {
  const bullet = {
    dash: '–',
    dot: '•',
    arrow: '→',
  }[template.bulletStyle];

  return `${bullet} ${text}`;
}

/**
 * Get spacing multiplier for section gaps
 */
export function getSpacingMultiplier(template: TemplateConfig): number {
  switch (template.sectionSpacing) {
    case 'compact':
      return 0.5;
    case 'spacious':
      return 1.5;
    case 'normal':
    default:
      return 1;
  }
}
