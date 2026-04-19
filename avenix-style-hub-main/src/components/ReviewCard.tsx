import { Star, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Review = Tables<"reviews">;

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="border-b border-border pb-4 last:border-b-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-foreground">
                {review.user_name || "Anonymous User"}
              </p>
              {review.is_verified_purchase && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  ✓ Verified Purchase
                </span>
              )}
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < review.rating
                        ? "fill-gold text-gold"
                        : "text-border"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {review.rating} star{review.rating !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Date */}
          <p className="text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Review Text */}
        {review.review_text && (
          <p className="text-sm text-foreground mb-3 leading-relaxed">
            {review.review_text}
          </p>
        )}

        {/* Review Images */}
        {review.image_urls && review.image_urls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {review.image_urls.map((imageUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imageUrl)}
                className="relative group overflow-hidden rounded-lg border border-border hover:shadow-md transition-shadow"
              >
                <img
                  src={imageUrl}
                  alt={`Review image ${idx + 1}`}
                  className="w-16 h-16 object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Dialog */}
      {selectedImage && (
        <Dialog open={true} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Image</DialogTitle>
            </DialogHeader>
            <img
              src={selectedImage}
              alt="Review preview"
              className="w-full rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ReviewCard;
