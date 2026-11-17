import type { Achievement } from '@/types/content'

export const achievements: Achievement[] = [
  {
    id: 'aws-dva',
    kind: 'certification',
    title: 'AWS Certified Developer – Associate',
    detail: 'DVA-C02',
  },
  {
    id: 'leetcode-contest',
    kind: 'competitive',
    title: 'LeetCode weekly contest: rank 4,273 of 36,305',
  },
  {
    id: 'leetcode-solved',
    kind: 'competitive',
    title: '550+ LeetCode problems solved',
    detail: 'Arrays, strings, graphs, trees, dynamic programming',
  },
]
