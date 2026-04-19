import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { createOrder, createOrderItems, updateOrderStatus } from "@/lib/database";

export type Order = Tables<"orders"> & {
  customer_name?: string;
  order_items?: Tables<"order_items">[];
};

export type OrderItem = Tables<"order_items">;

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      order, 
      items 
    }: { 
      order: TablesInsert<"orders">; 
      items: Omit<TablesInsert<"order_items">, 'order_id'>[] 
    }) => {
      const newOrder = await createOrder(order);
      await createOrderItems(newOrder.id, items);
      return newOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
};

export const useOrders = (userId?: string) => {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select(`
          *,
          order_items (*),
          profiles!orders_user_id_fkey (name)
        `)
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as Order[];
    },
    enabled: !!userId,
  });
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Fetch customer names
      const userIds = [...new Set((ordersData || []).map((o) => o.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);
      
      const nameMap = new Map(profiles?.map((p) => [p.user_id, p.name]) || []);
      
      return (ordersData || []).map((o) => ({ 
        ...o, 
        customer_name: nameMap.get(o.user_id) || "Unknown" 
      })) as Order[];
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
};

export const useOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*),
          profiles!orders_user_id_fkey (name)
        `)
        .eq("id", orderId)
        .single();
      
      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderId,
  });
};
