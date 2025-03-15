
import { format, parseISO } from 'date-fns';

/**
 * Format a date string into a cyberpunk-style format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    
    // Format: YYYY.MM.DD | HH:MM:SS
    return format(date, "yyyy.MM.dd | HH:mm:ss");
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'INVALID.DATE.FORMAT';
  }
};

/**
 * Format a date string to show how long ago it was created
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'UNKNOWN.TIME.AGO';
  }
};
