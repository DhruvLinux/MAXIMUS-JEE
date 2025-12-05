export const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  // Create date using local time constructor
  return new Date(y, m - 1, d);
};

export const getLocalISOString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayISOString = (): string => {
  return getLocalISOString(new Date());
};

export const getDateNDaysAgoISO = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return getLocalISOString(date);
};

export const formatDateDDMMYY = (dateStr: string): string => {
  const date = parseLocalDate(dateStr);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear()).slice(-2);
  return `${d}/${m}/${y}`;
};

export const getDaysDifference = (d1: Date, d2: Date): number => {
  // Use setHours to ignore time components completely for difference calculation
  const date1 = new Date(d1);
  date1.setHours(0, 0, 0, 0);
  const date2 = new Date(d2);
  date2.setHours(0, 0, 0, 0);
  
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getWeekStartDate = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    // Assuming Sunday is the first day (0), adjust if Monday start is needed
    const diff = d.getDate() - day; 
    return new Date(d.setDate(diff));
};