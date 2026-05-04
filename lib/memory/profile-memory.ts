/**
 * Profile Memory Management
 * Stores structured teacher profile data in Convex
 */

import { Id } from '../../convex/_generated/dataModel';

export interface TeacherProfile {
  userId: string;
  name: string;
  yearLevels: string[];
  subjects: string[];
  state?: string;
  teachingGoals: string[];
  schoolContext: string;
  communicationStyle: string;
  memoryLearningEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ProfileMemory {
  // Core identity
  name: string;
  yearLevels: string[];
  subjects: string[];
  state: string;
  
  // Extracted/derived
  teachingGoals: string[];
  schoolContext: string;
  communicationStyle: string;
  
  // Preferences
  memoryLearningEnabled: boolean;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Build a context string from profile memory for system prompt injection
 */
export function buildProfileContext(profile: ProfileMemory): string {
  const parts: string[] = [];
  
  parts.push(`Teacher: ${profile.name}`);
  parts.push(`Year levels: ${profile.yearLevels.join(', ')}`);
  parts.push(`Subjects: ${profile.subjects.join(', ')}`);
  
  if (profile.state) {
    const stateContext = getStateContext(profile.state);
    parts.push(`State: ${profile.state} — ${stateContext}`);
  }
  
  if (profile.teachingGoals.length > 0) {
    parts.push(`Teaching goals: ${profile.teachingGoals.join(', ')}`);
  }
  
  if (profile.schoolContext) {
    parts.push(`School context: ${profile.schoolContext}`);
  }
  
  if (profile.communicationStyle) {
    parts.push(`Communication style: ${profile.communicationStyle}`);
  }
  
  return parts.join('\n');
}

function getStateContext(state: string): string {
  const contexts: Record<string, string> = {
    WA: 'Western Australia — SCSA guidelines, WA Department of Education priorities',
    NSW: 'New South Wales — NESA syllabus, NSW DoE resources, literacy/numeracy focus',
    VIC: 'Victoria — Victorian Curriculum F-10, DE Victoria resources, FISO improvement framework',
    QLD: 'Queensland — QCAA AC9 implementation, Queensland Department of Education',
    SA: 'South Australia — SACE framework, Department for Education SA',
    TAS: 'Tasmania — Tasmanian Curriculum Standards, Department for Education Tasmania',
    NT: 'Northern Territory — NT Department of Education, local Indigenous cultural contexts',
    ACT: 'ACT — ACT Education Directorate, BSSS framework',
  };
  return contexts[state] || state;
}

/**
 * Extract communication style from chat messages
 */
export function extractCommunicationStyle(messages: { role: string; content: string }[]): string | null {
  const stylePatterns = [
    { pattern: /prefer.*concise|keep.*short|brief/i, style: 'concise' },
    { pattern: /explain.*thoroughly|detailed|in-depth/i, style: 'detailed' },
    { pattern: /use.*examples|practical|classroom/i, style: 'practical examples' },
    { pattern: /formal|professional/i, style: 'formal' },
    { pattern: /casual|friendly| relaxed/i, style: 'casual and friendly' },
  ];
  
  const fullText = messages.map(m => m.content).join(' ');
  
  for (const { pattern, style } of stylePatterns) {
    if (pattern.test(fullText)) {
      return style;
    }
  }
  
  return null;
}

/**
 * Default empty profile
 */
export function getDefaultProfile(userId: string): ProfileMemory {
  return {
    name: 'Teacher',
    yearLevels: [],
    subjects: [],
    state: '',
    teachingGoals: [],
    schoolContext: '',
    communicationStyle: '',
    memoryLearningEnabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
