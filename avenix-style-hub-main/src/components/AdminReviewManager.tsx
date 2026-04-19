import { useState } from "react";
import { useAllReviews, useAllProducts, useDeleteReview } from "@/hooks/useBackend";
import { toast } from "sonner";
import { Trash2, Eye, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AdminReviewManager = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: reviews, isLoading } = useAllReviews();
  const { data: products } = useAllProducts();
  const deleteReview = useDeleteReview();

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteReview.mutateAsync(reviewId);
      toast.success("Review deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete review");
    }
  };

  const getProductName = (productId: string) => {
    return products?.find((p) => p.id === productId)?.name || "Unknown Product";
  };

  const getRatingDisplay = (rating: number) => {
    return "⭐".repeat(rating);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Review Management</h2>
        <p className="text-muted-foreground text-sm">
          Total Reviews: <span className="font-semibold">{reviews?.length || 0}</span>
        </p>
      </div>

      {!reviews || reviews.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No reviews yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold">Reviewer</th>
                <th className="px-4 py-3 text-left font-semibold">Product</th>
                <th className="px-4 py-3 text-left font-semibold">Rating</th>
                <th className="px-4 py-3 text-left font-semibold">Review</th>
                <th className="px-4 py-3 text-left font-semibold">Images</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  {/* Reviewer Name */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground truncate max-w-[150px]">
                      {review.user_name || "Anonymous"}
                    </p>
                    {review.is_verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1 inline-block">
                        Verified
                      </span>
                    )}
                  </td>

                  {/* Product Name */}
                  <td className="px-4 py-3">
                    <p className="text-muted-foreground truncate max-w-[150px]">
                      {getProductName(review.product_id)}
                    </p>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3">
                    <span className="text-lg font-semibold">
                      {getRatingDisplay(review.rating)}
                    </span>
                  </td>

                  {/* Review Text */}
                  <td className="px-4 py-3">
                    <p className="text-muted-foreground truncate max-w-[200px]">
                      {review.review_text || "No text"}
                    </p>
                  </td>

                  {/* Images */}
                  <td className="px-4 py-3">
                    {review.image_urls && review.image_urls.length > 0 ? (
                      <div className="flex gap-1">
                        {review.image_urls.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(url)}
                            className="relative group"
                          >
                            <img
                              src={url}
                              alt={`Review ${idx}`}
                              className="w-8 h-8 object-cover rounded border border-border hover:shadow-md transition-shadow cursor-pointer"
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">No images</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(review.created_at).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={deletingId === review.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-sm bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all disabled:opacity-50"
                      title="Delete review"
                    >
                      <Trash2 size={14} />
                      {deletingId === review.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Preview Dialog */}
      {selectedImage && (
        <Dialog open={true} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Image Preview</DialogTitle>
            </DialogHeader>
            <img
              src={selectedImage}
              alt="Review preview"
              className="w-full rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminReviewManager;
