import { useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import { useProductReviews } from "@/hooks/useBackend";
import ReviewCard from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";

interface ReviewListProps {
  productId: string;
}

type SortType = "latest" | "highest" | "lowest";

const ReviewList = ({ productId }: ReviewListProps) => {
  const [sortBy, setSortBy] = useState<SortType>("latest");

  const { data: allReviews, isLoading } = useProductReviews(productId);

  // Apply sorting to the reviews
  const reviews = allReviews ? [...allReviews].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === "highest") {
      return b.rating - a.rating;
    } else if (sortBy === "lowest") {
      return a.rating - b.rating;
    }
    return 0;
  }) : [];

  // Calculate average rating
  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="border border-border rounded-lg p-6 bg-muted/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">{avgRating}</div>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.floor(Number(avgRating))
                        ? "fill-gold text-gold"
                        : "text-border"
                    }
                  />
                ))}
              </div>
            </div>
            <div className="border-l border-border pl-4">
              <p className="text-sm font-semibold text-foreground">
                {reviews?.length || 0} Review{reviews?.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                based on customer feedback
              </p>
            </div>
          </div>

          {/* Sort Dropdown */}
          {reviews && reviews.length > 0 && (
            <div className="relative group">
              <Button variant="outline" className="gap-2">
                <span className="text-sm">
                  Sort: {sortBy === "latest" ? "Latest" : sortBy === "highest" ? "Highest" : "Lowest"}
                </span>
                <ChevronDown size={16} />
              </Button>
              <div className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {(["latest", "highest", "lowest"] as SortType[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      sortBy === option ? "bg-primary/10 font-medium text-primary" : ""
                    }`}
                  >
                    {option === "latest"
                      ? "Latest First"
                      : option === "highest"
                        ? "Highest Rating"
                        : "Lowest Rating"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to share your experience!
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
