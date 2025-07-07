import { useCallback } from 'react';

export const useFormatDate = () => {
  const formatDate = useCallback((isoDate: string): string => {
    const date = new Date(isoDate);
    const vietnamDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    const day = vietnamDate.getUTCDate().toString().padStart(2, '0');
    const month = (vietnamDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = vietnamDate.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }, []);

  const formatDateYYMMDD = useCallback((isoDate: string): string => {
    const date = new Date(isoDate);
    const vietnamDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    const day = vietnamDate.getUTCDate().toString().padStart(2, '0');
    const month = (vietnamDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = vietnamDate.getUTCFullYear();

    return `${year}-${month}-${day}`;
  }, []);

  const formatDateDDMMYYYYHHMM = useCallback((isoDate: string): string => {
    const date = new Date(isoDate);
    const vietnamDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    const day = vietnamDate.getUTCDate().toString().padStart(2, '0');
    const month = (vietnamDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = vietnamDate.getUTCFullYear();
    const hours = vietnamDate.getUTCHours().toString().padStart(2, '0');
    const minutes = vietnamDate.getUTCMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}, []);

  return { formatDate, formatDateYYMMDD, formatDateDDMMYYYYHHMM};
};