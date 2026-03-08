import { describe, it, expect } from 'vitest'
import { getSmi60, getSmi85, SMI_85 } from './smi.ts'

describe('getSmi60', () => {
  it('returns correct values for household sizes 1-8', () => {
    expect(getSmi60(1)).toBe(3061)
    expect(getSmi60(2)).toBe(4003)
    expect(getSmi60(3)).toBe(4945)
    expect(getSmi60(4)).toBe(5887)
    expect(getSmi60(5)).toBe(6829)
    expect(getSmi60(6)).toBe(7771)
    expect(getSmi60(7)).toBe(8713)
    expect(getSmi60(8)).toBe(9655)
  })

  it('extrapolates for household size > 8', () => {
    expect(getSmi60(9)).toBe(9655 + 942)
    expect(getSmi60(10)).toBe(9655 + 942 * 2)
  })
})

describe('getSmi85', () => {
  it('returns correct values for household sizes 2-8', () => {
    expect(getSmi85(2)).toBe(5671)
    expect(getSmi85(3)).toBe(7005)
    expect(getSmi85(4)).toBe(8340)
    expect(getSmi85(5)).toBe(9674)
    expect(getSmi85(6)).toBe(11008)
    expect(getSmi85(7)).toBe(12342)
    expect(getSmi85(8)).toBe(13676)
  })

  it('clamps household size 1 to size 2', () => {
    expect(getSmi85(1)).toBe(SMI_85[2])
  })

  it('extrapolates for household size > 8', () => {
    expect(getSmi85(9)).toBe(13676 + 1334)
    expect(getSmi85(10)).toBe(13676 + 1334 * 2)
  })
})
