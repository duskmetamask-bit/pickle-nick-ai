/**
 * Semantic Memory Storage & Recall
 * Stores free-text memories with embeddings for semantic search
 */

export type MemoryType = 'class_fact' | 'student_need' | 'preference' | 'session_summary' | 'school_info';

export interface SemanticMemory {
  id: string;
  userId: string;
  content: string;
  memoryType: MemoryType;
  importance: number; // 0-1
  lastAccessedAt: number;
  createdAt: number;
  tags: string[];
}

/**
 * Create a new semantic memory entry
 */
export function createSemanticMemory(params: {
  userId: string;
  content: string;
  memoryType: MemoryType;
  importance?: number;
  tags?: string[];
}): SemanticMemory {
  const now = Date.now();
  return {
    id: `mem_${now}_${Math.random().toString(36).slice(2, 9)}`,
    userId: params.userId,
    content: params.content,
    memoryType: params.memoryType,
    importance: params.importance ?? 0.5,
    lastAccessedAt: now,
    createdAt: now,
    tags: params.tags ?? [],
  };
}

/**
 * Extract keywords from memory content for tagging
 */
export function extractMemoryTags(content: string): string[] {
  const words = content.toLowerCase().split(/\s+/);
  const significantWords = words.filter(w => w.length > 4);
  const unique = [...new Set(significantWords)];
  return unique.slice(0, 5);
}

/**
 * Score memory relevance for recall
 */
export function scoreMemoryRelevance(
  memory: SemanticMemory,
  queryEmbedding: number[],
  recencyWeight = 0.3,
  importanceWeight = 0.3
): number {
  // In production, compute cosine similarity with embedding
  // For now, use importance + recency as proxy
  const ageInDays = (Date.now() - memory.lastAccessedAt) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.exp(-ageInDays / 30); // Decay over 30 days
  const importanceScore = memory.importance;
  
  return (recencyWeight * recencyScore) + (importanceWeight * importanceScore) + ((1 - recencyWeight - importanceWeight) * 0.5);
}

/**
 * Compress memories that fall below threshold
 */
export function compressMemory(memory: SemanticMemory): string {
  // In production, use LLM to summarize
  // For now, truncate to first 100 chars
  if (memory.content.length <= 100) return memory.content;
  return memory.content.slice(0, 100).trim() + '...';
}
