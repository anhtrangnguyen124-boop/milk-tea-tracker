import type { InterviewRound, JobStatus } from '@/types'

export const JOB_STATUSES: { key: JobStatus; label: string }[] = [
  { key: 'wishlist', label: '待投递' },
  { key: 'applied', label: '已投递' },
  { key: 'assessment', label: '笔试/测评' },
  { key: 'interview', label: '面试中' },
  { key: 'offer', label: 'Offer' },
  { key: 'rejected', label: '已拒' },
]

export const JOB_CHANNELS = ['官网', '内推', 'Boss直聘', 'LinkedIn', '猎头', '其他']
export const JOB_INDUSTRIES = ['互联网', '金融', '教育', '医疗', '房地产', '零售', '制造业', '汽车', '游戏', 'AI/大模型', '新能源', '娱乐', '快消', '物流']
export const INTERVIEW_ROUNDS: InterviewRound[] = ['一面', '二面', '三面', 'HR面', '群面', '其他']
