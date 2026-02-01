import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional')
    expect(cn('base', false && 'conditional')).toBe('base')
  })

  it('should handle undefined and null values', () => {
    expect(cn('class1', undefined, 'class2', null)).toBe('class1 class2')
  })

  it('should merge Tailwind classes properly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle empty input', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })

  it('should handle object syntax', () => {
    expect(cn({ active: true, disabled: false })).toBe('active')
  })

  it('should handle mixed syntax', () => {
    expect(cn('base', { active: true }, ['array-class'])).toBe('base active array-class')
  })
})
