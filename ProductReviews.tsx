
import React, { useState, useMemo } from 'react';
import type { Review } from '../types.ts';
import { Send, ArrowUpDown, UserCircle } from 'lucide-react';
import StarRating from './StarRating.tsx';

interface ProductReviewsProps {
  productId: number;
  reviews: Review[];
  onAddReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, reviews, onAddReview }) => {
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'rating-desc' | 'rating-asc'>('date-desc');
  const [formError, setFormError] = useState('');

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'rating-desc':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating-asc':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'date-desc':
      default:
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }, [reviews, sortBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || rating === 0 || !comment.trim()) {
      setFormError('Please fill in all fields and provide a rating.');
      return;
    }
    setFormError('');
    onAddReview(productId, { username, rating, comment });
    // Reset form
    setUsername('');
    setRating(0);
    setComment('');
  };

  return (
    <div className="p-5 border-t border-slate-200 dark:border-slate-700 space-y-6">
      {/* Review Form */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Leave a Review</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`username-${productId}`} className="sr-only">Username</label>
              <input
                id={`username-${productId}`}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-amber-500 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div className="flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400 mr-3">Your Rating:</span>
              <StarRating rating={rating} onRatingChange={setRating} size={20} />
            </div>
          </div>
          <div>
            <label htmlFor={`comment-${productId}`} className="sr-only">Comment</label>
            <textarea
              id={`comment-${productId}`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on this product..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-amber-500 bg-white dark:bg-slate-800 text-sm"
            ></textarea>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <button type="submit" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
            Submit Review <Send size={14} className="ml-2" />
          </button>
        </form>
      </div>

      {/* Existing Reviews */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">{reviews.length} Review{reviews.length !== 1 && 's'}</h4>
          {reviews.length > 1 && (
            <div className="flex items-center space-x-2">
              <label htmlFor={`sort-reviews-${productId}`} className="text-sm font-medium text-slate-600 dark:text-slate-400">
                <ArrowUpDown className="w-4 h-4 inline mr-1.5" />
                Sort:
              </label>
              <select
                id={`sort-reviews-${productId}`}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="block pl-2 pr-8 py-1 text-sm border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-md bg-white dark:bg-slate-800"
              >
                <option value="date-desc">Newest</option>
                <option value="rating-desc">Highest Rating</option>
                <option value="rating-asc">Lowest Rating</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="space-y-5">
          {sortedReviews.length > 0 ? (
            sortedReviews.map(review => (
              <div key={review.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{review.username}</p>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No reviews yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
