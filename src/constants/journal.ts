import type { MoodPreset, PaperTexture, JournalMood } from '@/types'

export const MOODS: MoodPreset[] = [
  { key: 'happy', emoji: '😊', label: '开心' },
  { key: 'sad', emoji: '😢', label: '难过' },
  { key: 'anxious', emoji: '😰', label: '焦虑' },
  { key: 'peaceful', emoji: '😌', label: '平静' },
  { key: 'excited', emoji: '🎉', label: '兴奋' },
  { key: 'grateful', emoji: '🙏', label: '感恩' },
  { key: 'inspired', emoji: '💡', label: '灵感' },
  { key: 'thoughtful', emoji: '🤔', label: '思考' },
]

export const PAPER_OPTIONS: { key: PaperTexture; label: string }[] = [
  { key: 'grid', label: '方格' },
  { key: 'lined', label: '横线' },
  { key: 'dot', label: '点阵' },
  { key: 'blank', label: '做旧' },
]

export const PAPER_CSS: Record<PaperTexture, string> = {
  grid: 'paper-grid',
  lined: 'paper-lined',
  dot: 'paper-dot',
  blank: 'paper-blank',
}

export function getRandomPaper(): PaperTexture {
  return PAPER_OPTIONS[Math.floor(Math.random() * PAPER_OPTIONS.length)].key
}
