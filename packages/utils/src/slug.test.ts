import { describe, expect, it } from '@jest/globals';
import { slugify } from './slug.js';

describe('slugify', () => {
  it('converts spaces and casing to a kebab slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips accents and diacritics', () => {
    expect(slugify('Crème brûlée')).toBe('creme-brulee');
  });

  it('collapses repeated separators and trims edges', () => {
    expect(slugify('  --hello---world  ')).toBe('hello-world');
  });

  it('caps the length to 60 characters', () => {
    const result = slugify('a'.repeat(120));
    expect(result.length).toBe(60);
  });
});
