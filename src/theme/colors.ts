export const colors = {
  primary: '#137c62',
  ink: '#172b28',
  green: '#137c62',
  muted: '#74827e',
  background: '#f7f8f4',
  canvas: '#f7f8f4',
  surface: '#ffffff',
  border: '#e3e8e2',
  accent: '#e6a348',
} as const;

export const formatRupees = (value: number): string => `₹${value}`;
