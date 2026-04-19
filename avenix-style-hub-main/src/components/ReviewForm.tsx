import { useState } from "react";
import { Star, Upload, X, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useCreateReview } from "@/hooks/useBackend";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const createReview = useCreateReview();
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-900">
          <strong>Sign in to write a review</strong>
        </p>
        <a href="/auth" className="text-blue-600 hover:underline text-xs mt-1 inline-block">
          Sign in or create an account →
        </a>
      </div>
    );
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileName = `review-${productId}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(`reviews/${fileName}`, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("public")
        .getPublicUrl(`reviews/${fileName}`);

      setUploadedImages([...uploadedImages, publicUrl.publicUrl]);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (reviewText.trim().length < 10) {
      toast.error("Review must be at least 10 characters long");
      return;
    }

    try {
      await createReview.mutateAsync({
        product_id: productId,
        user_id: user!.id,
        user_name: user!.user_metadata?.name || user!.email?.split("@")[0] || "Anonymous",
        rating,
        review_text: reviewText.trim(),
        image_urls: uploadedImages,
        is_verified_purchase: false, // This can be set to true after verifying purchase
      });

      toast.success("Review submitted successfully! 🎉");
      setRating(0);
      setReviewText("");
      setUploadedImages([]);
      setShowForm(false);
      onReviewSubmitted?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    }
  };

  if (!showForm) {
    return (
      <div className="text-center py-6">
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="gap-2"
        >
          <Star size={16} />
          Write a Review
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-6 bg-muted/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Share Your Experience</h3>
        <button
          onClick={() => setShowForm(false)}
          className="text-muted-foreground hover:text-foreground transition"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Rating *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={
                    star <= rating
                      ? "fill-gold text-gold"
                      : "text-muted-foreground"
                  }
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              You rated this {rating} star{rating !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Review *</label>
          <Textarea
            placeholder="Share your experience with this product... (minimum 10 characters)"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {reviewText.length} characters
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Add Photos (Optional)
          </label>
          <div className="flex items-center gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
              <Upload size={18} />
              <span className="text-sm">Upload photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {uploadedImages.length > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                {uploadedImages.length}
              </span>
            )}
          </div>

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {uploadedImages.map((url, idx) => (
                <div
                  key={idx}
                  className="relative inline-block"
                >
                  <img
                    src={url}
                    alt={`Review image ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={() =>
                      setUploadedImages(uploadedImages.filter((_, i) => i !== idx))
                    }
                    className="absolute -top-2 -right-2 bg-destructive text-primary-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Validation Messages */}
        {rating === 0 && reviewText.length > 0 && (
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800">
              Please select a rating (1-5 stars)
            </p>
          </div>
        )}

        {reviewText.length > 0 && reviewText.length < 10 && (
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800">
              Review must be at least 10 characters ({10 - reviewText.length} more needed)
            </p>
          </div>
        )}

        {rating > 0 && reviewText.length >= 10 && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 p-3 rounded-lg">
            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-800">
              Your review is ready to submit
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setRating(0);
              setReviewText("");
              setUploadedImages([]);
              setShowForm(false);
            }}
            disabled={createReview.isPending || uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            disabled={
              rating === 0 ||
              reviewText.length < 10 ||
              createReview.isPending ||
              uploading
            }
            className="flex-1"
          >
            {createReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
