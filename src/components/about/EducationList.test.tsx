import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { education } from '@/content/education'

import { EducationList } from './EducationList'

describe('EducationList', () => {
  it('shows both degrees with year range and CGPA', () => {
    render(<EducationList entries={education} />)
    expect(screen.getByText('2022 to 2025 · CGPA 9.1')).toBeTruthy()
    expect(screen.getByText('2019 to 2022 · CGPA 8.8')).toBeTruthy()
  })

  it('renders an open range as present', () => {
    const [first] = education
    if (!first) throw new Error('education is empty')
    render(<EducationList entries={[{ ...first, period: { start: '2025-01', end: null } }]} />)
    expect(screen.getByText('2025 to present · CGPA 9.1')).toBeTruthy()
  })
})
