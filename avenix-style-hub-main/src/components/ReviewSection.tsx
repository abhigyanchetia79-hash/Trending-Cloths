import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Plus, Trash2, Camera, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProductReviews, useCreateReview, useDeleteReview } from "@/hooks/useReviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ReviewSectionProps {
  productId: string;
}

const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useProductReviews(productId);
  const createReviewMutation = useCreateReview();
  const deleteReviewMutation = useDeleteReview();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    reviewText: "",
    images: [] as File[],
  });

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please sign in to write a review");
      return;
    }

    if (!reviewData.reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      // Upload images if any
      const imageUrls: string[] = [];
      for (let i = 0; i < reviewData.images.length; i++) {
        const file = reviewData.images[i];
        const path = `reviews/${productId}/${user.id}/${Date.now()}-${file.name}`;
        // Note: You'll need to implement file upload in your database.ts
        // const url = await uploadFile(file, path);
        // imageUrls.push(url);
      }

      await createReviewMutation.mutateAsync({
        product_id: productId,
        user_id: user.id,
        user_name: user.user_metadata?.name || "Anonymous",
        rating: reviewData.rating,
        review_text: reviewData.reviewText,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        is_verified_purchase: true, // You can check this from orders
      });

      toast.success("Review submitted successfully!");
      setShowReviewForm(false);
      setReviewData({ rating: 5, reviewText: "", images: [] });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReviewMutation.mutateAsync(reviewId);
      toast.success("Review deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete review");
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 20 : 16}
            className={`${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        {user && (
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant="outline"
            size="sm"
          >
            <Plus size={16} className="mr-2" />
            Write Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border border-border rounded-lg p-6 space-y-4"
        >
          <h4 className="font-semibold">Write Your Review</h4>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            {renderStars(reviewData.rating, true, (rating) => 
              setReviewData(prev => ({ ...prev, rating }))
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Your Review</label>
            <Textarea
              value={reviewData.reviewText}
              onChange={(e) => setReviewData(prev => ({ ...prev, reviewText: e.target.value }))}
              placeholder="Share your experience with this product..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Photos (Optional)</label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setReviewData(prev => ({ 
                ...prev, 
                images: Array.from(e.target.files || []) 
              }))}
              className="cursor-pointer"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmitReview}
              disabled={createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowReviewForm(false)}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{review.user_name}</p>
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                {user && user.id === review.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deleteReviewMutation.isPending}
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                )}
              </div>

              {review.review_text && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.review_text}
                </p>
              )}

              {review.image_urls && review.image_urls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {review.image_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Review image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-md border border-border"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
                {review.is_verified_purchase && (
                  <span className="text-green-600 font-medium">
                    ✓ Verified Purchase
                  </span>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
