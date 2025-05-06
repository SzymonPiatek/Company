import extractNumericSuffix from '../extractNumericSuffix';

describe('extractNumericSuffix', () => {
  it('should extract and pad numeric suffix', () => {
    expect(extractNumericSuffix('ABC-42')).toBe('000042');
  });

  it('should fallback to default if no match', () => {
    expect(extractNumericSuffix('INVALID')).toBe('000001');
  });

  it('should fallback to default if no code', () => {
    expect(extractNumericSuffix(undefined)).toBe('000001');
  });

  it('should handle already padded code', () => {
    expect(extractNumericSuffix('CODE-000123')).toBe('000123');
  });
});
