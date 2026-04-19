import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { 
  createAdvertisement, 
  getActiveAdvertisements, 
  updateAdvertisement, 
  deleteAdvertisement 
} from "@/lib/database";

export type Advertisement = Tables<"advertisements">;

export const useActiveAdvertisements = () => {
  return useQuery({
    queryKey: ["advertisements", "active"],
    queryFn: async () => {
      return await getActiveAdvertisements();
    },
  });
};

export const useCreateAdvertisement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (adData: TablesInsert<"advertisements">) => {
      return await createAdvertisement(adData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
    },
  });
};

export const useUpdateAdvertisement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      adId, 
      adData 
    }: { 
      adId: string; 
      adData: TablesUpdate<"advertisements"> 
    }) => {
      return await updateAdvertisement(adId, adData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
    },
  });
};

export const useDeleteAdvertisement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (adId: string) => {
      return await deleteAdvertisement(adId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
    },
  });
};

export const useAllAdvertisements = () => {
  return useQuery({
    queryKey: ["advertisements", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};
