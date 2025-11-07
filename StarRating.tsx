
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalStars = 5,
  onRatingChange,
  size = 16,
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-0.5 ${className}`}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            type="button"
            disabled={!onRatingChange}
            onClick={() => onRatingChange && onRatingChange(starValue)}
            className={`transition-colors ${onRatingChange ? 'cursor-pointer' : ''}`}
            aria-label={`Rate ${starValue} out of ${totalStars} stars`}
          >
            <Star
              size={size}
              className={`
                ${starValue <= rating ? 'text-amber-400 fill-current' : 'text-slate-300 dark:text-slate-600'}
                ${onRatingChange ? 'hover:text-amber-300' : ''}
              `}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
