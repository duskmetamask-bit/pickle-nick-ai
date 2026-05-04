/**
 * Memory Extractor
 * Runs after each LLM response to extract and store new memories
 */

import { createSemanticMemory, extractMemoryTags } from './semantic-memory';
import type { SemanticMemory, MemoryType } from './semantic-memory';

interface ExtractionRule {
  condition: (content: string) => boolean;
  extract: (content: string) => { content: string; memoryType: MemoryType; importance: number } | null;
}

const EXTRACTION_RULES: ExtractionRule[] = [
  // Extract class names
  {
    condition: (c) => /\b(class|cohort|group)\s+[A-Z][a-z]+\b/i.test(c),
    extract: (c) => {
      const match = c.match(/\b(class|cohort|group)\s+([A-Z][a-z]+)\b/i);
      if (match) {
        return {
          content: `Teacher has a ${match[1]} named ${match[2]}`,
          memoryType: 'class_fact',
          importance: 0.6,
        };
      }
      return null;
    },
  },
  
  // Extract student needs
  {
    condition: (c) => /\b(struggling|needs|support|extra|EAL|D|gifted|extension)\b/i.test(c),
    extract: (c) => {
      const needMatch = c.match(/\b(struggling|needs support|EAL|D|gifted|needs extension|additional needs)\b.*?(?:in|with)\s+([^.!?]+)/i);
      if (needMatch) {
        return {
          content: `Student need identified: ${needMatch[0].slice(0, 150)}`,
          memoryType: 'student_need',
          importance: 0.8,
        };
      }
      return null;
    },
  },
  
  // Extract school context
  {
    condition: (c) => /\b(school|college|centre|center)\s+(name|called|is) [A-Z]/i.test(c),
    extract: (c) => {
      const match = c.match(/\b(school|college|centre|center)\s+(?:name|called|is)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|which|with)/i);
      if (match) {
        return {
          content: `Teacher works at ${match[2].trim()} school`,
          memoryType: 'school_info',
          importance: 0.5,
        };
      }
      return null;
    },
  },
  
  // Extract communication preferences
  {
    condition: (c) => /\b(prefer|preferred|like to|always|customary)\b.*?\b(conversational|concise|detailed|brief|formal|casual)\b/i.test(c),
    extract: (c) => {
      const match = c.match(/\b(prefer|preferred|like to)\b.*?\b(conversational|concise|detailed|brief|formal|casual)\b/i);
      if (match) {
        return {
          content: `Teacher prefers ${match[2]} responses`,
          memoryType: 'preference',
          importance: 0.7,
        };
      }
      return null;
    },
  },
];

/**
 * Extract memories from a user message
 */
export function extractMemoriesFromMessage(
  userId: string,
  message: string,
  existingMemories: SemanticMemory[] = []
): SemanticMemory[] {
  const newMemories: SemanticMemory[] = [];
  
  for (const rule of EXTRACTION_RULES) {
    if (rule.condition(message)) {
      const extracted = rule.extract(message);
      if (extracted) {
        // Check for duplicate content
        const isDuplicate = existingMemories.some(
          m => m.content.toLowerCase().includes(extracted.content.toLowerCase().slice(0, 50))
        );
        
        if (!isDuplicate) {
          const memory = createSemanticMemory({
            userId,
            content: extracted.content,
            memoryType: extracted.memoryType,
            importance: extracted.importance,
            tags: extractMemoryTags(extracted.content),
          });
          newMemories.push(memory);
        }
      }
    }
  }
  
  return newMemories;
}

/**
 * Generate session summary from conversation
 */
export function generateSessionSummary(
  messages: { role: string; content: string }[]
): string {
  if (messages.length === 0) return '';
  
  const firstMsg = messages[0]?.content?.slice(0, 100) || 'Empty conversation';
  const msgCount = messages.length;
  
  return `Session discussed: "${firstMsg}..." (${msgCount} messages)`;
}

/**
 * Check if content might contain PII that shouldn't be stored
 */
export function containsPII(content: string): boolean {
  const piiPatterns = [
    /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card
    /\b\d{2}\/\d{2}\/\d{4}\b/, // Date of birth
    /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/, // Full name (3 words)
    /address|phone|email/i, // Contact info keywords
  ];
  
  return piiPatterns.some(pattern => pattern.test(content));
}
