import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getCurrentISTDateTime = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().slice(0,16); // Format: YYYY-MM-DD HH:mm:ss
};

export function formatDateGRN(dateString:string) {
  const date = new Date(dateString);
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istTime = new Date(date.getTime() + istOffset);
    
    const day = istTime.getUTCDate().toString().padStart(2, '0');
    const month = (istTime.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = istTime.getUTCFullYear();
    const hours = istTime.getUTCHours().toString().padStart(2, '0');
    const minutes = istTime.getUTCMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}
