import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit2, Trash2, Plus, ToggleLeft, ToggleRight, Upload, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAllAdvertisements, useCreateAdvertisement, useUpdateAdvertisement, useDeleteAdvertisement } from "@/hooks/useAdvertisements";

type Advertisement = Tables<"advertisements">;

interface AdvertisementForm {
  title: string;
  description: string;
  video_url: string;
  image_url: string;
}

const AdminAdvertisementManager = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdvertisementForm>({
    title: "",
    description: "",
    video_url: "",
    image_url: "",
  });
  const [uploading, setUploading] = useState(false);

  const { data: advertisements, isLoading } = useAllAdvertisements();
  const createAdMutation = useCreateAdvertisement();
  const updateAdMutation = useUpdateAdvertisement();
  const deleteAdMutation = useDeleteAdvertisement();

  const handleVideoUpload = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file must be smaller than 50MB. Please optimize the video.");
      return;
    }

    setUploading(true);
    try {
      const fileName = `advertisement-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(`videos/${fileName}`, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("public")
        .getPublicUrl(`videos/${fileName}`);

      setForm({ ...form, video_url: publicUrl.publicUrl });
      toast.success("Video uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      const fileName = `advertisement-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(`images/${fileName}`, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("public")
        .getPublicUrl(`images/${fileName}`);

      setForm({ ...form, image_url: publicUrl.publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Please enter an advertisement title");
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from("advertisements")
          .update(form)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Advertisement updated successfully");
      } else {
        const { error } = await supabase.from("advertisements").insert([form]);
        if (error) throw error;
        toast.success("Advertisement created successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-advertisements"] });
      setShowDialog(false);
      setForm({ title: "", description: "", video_url: "", image_url: "" });
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to save advertisement");
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingId(ad.id);
    setForm({
      title: ad.title || "",
      description: ad.description || "",
      video_url: ad.video_url || "",
      image_url: ad.image_url || "",
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this advertisement?")) return;

    try {
      const { error } = await supabase.from("advertisements").delete().eq("id", id);
      if (error) throw error;
      toast.success("Advertisement deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-advertisements"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete advertisement");
    }
  };

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      const { error } = await supabase
        .from("advertisements")
        .update({ is_active: !ad.is_active })
        .eq("id", ad.id);
      if (error) throw error;
      toast.success(ad.is_active ? "Advertisement hidden" : "Advertisement shown");
      queryClient.invalidateQueries({ queryKey: ["admin-advertisements"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle advertisement");
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setForm({ title: "", description: "", video_url: "", image_url: "" });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Advertisement Manager</h2>
        <Button
          onClick={() => {
            setEditingId(null);
            setForm({ title: "", description: "", video_url: "", image_url: "" });
            setShowDialog(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Advertisement
        </Button>
      </div>

      {isLoading ? (
        <div>Loading advertisements...</div>
      ) : !advertisements || advertisements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No advertisements yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {advertisements.map((ad) => (
            <div
              key={ad.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{ad.title}</h3>
                <p className="text-sm text-gray-600">{ad.description}</p>
                {ad.video_url && <p className="text-xs text-blue-600 mt-1">✓ Video uploaded</p>}
                {ad.image_url && <p className="text-xs text-green-600">✓ Image uploaded</p>}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(ad)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                  title={ad.is_active ? "Hide advertisement" : "Show advertisement"}
                >
                  {ad.is_active ? (
                    <ToggleRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <button
                  onClick={() => handleEdit(ad)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  <Edit2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleDelete(ad.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog for creating/editing advertisements */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Advertisement" : "Create Advertisement"}</DialogTitle>
            <DialogDescription>
              Add or update advertisement content. Videos are recommended (up to 50MB).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Advertisement Title *
              </label>
              <Input
                placeholder="e.g., Exclusive Offers, Limited Time Deals"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                placeholder="e.g., Up to 50% off on select items"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Advertisement Video (Recommended)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload video (max 50MB)</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(file);
                    }}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {form.video_url && (
                  <button
                    onClick={() => setForm({ ...form, video_url: "" })}
                    className="p-2 hover:bg-red-100 rounded-lg"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
              {form.video_url && <p className="text-xs text-green-600 mt-1">✓ Video ready</p>}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Fallback Image
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {form.image_url && (
                  <button
                    onClick={() => setForm({ ...form, image_url: "" })}
                    className="p-2 hover:bg-red-100 rounded-lg"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
              {form.image_url && <p className="text-xs text-green-600 mt-1">✓ Image ready</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={uploading}>
                {uploading ? "Uploading..." : "Save Advertisement"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdvertisementManager;
