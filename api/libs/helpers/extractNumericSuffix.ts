const extractNumericSuffix = (code?: string): string => {
  const match = code?.match(/-(\d+)$/);
  if (!match || !match[1]) return '000001';
  return match[1].padStart(6, '0');
};

export default extractNumericSuffix;
