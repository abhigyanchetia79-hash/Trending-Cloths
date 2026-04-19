import { Package, Truck, CheckCircle2, Hourglass } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const OrderTrackingComponent = ({ order }: { order: Order }) => {
  const stages = [
    { status: "pending", label: "Order Placed", icon: Hourglass, color: "bg-yellow-100 text-yellow-700" },
    { status: "confirmed", label: "Confirmed", icon: CheckCircle2, color: "bg-blue-100 text-blue-700" },
    { status: "shipped", label: "Shipped", icon: Truck, color: "bg-purple-100 text-purple-700" },
    { status: "delivered", label: "Delivered", icon: Package, color: "bg-green-100 text-green-700" },
  ];

  // Map order_status to stage index
  const statusMap: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
  };

  const currentStageIndex = statusMap[order.order_status as string] ?? 0;

  if (order.order_status === "cancelled") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">✕</span>
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Order Cancelled</h3>
            <p className="text-sm text-red-700">This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div key={stage.status} className="flex-1 flex flex-col items-center">
                {/* Icon Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                    isCompleted
                      ? "bg-green-100 text-green-700"
                      : isCurrent
                        ? `${stage.color}`
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? "✓" : <Icon size={20} />}
                </div>

                {/* Label */}
                <p
                  className={`text-xs font-semibold text-center ${
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </p>

                {/* Connecting Line (hidden on mobile, visible on md+) */}
                {index < stages.length - 1 && (
                  <div
                    className={`hidden md:block absolute top-6 left-1/2 w-full h-1 translate-y-[-1.5rem] -ml-2 ${
                      isCompleted ? "bg-green-400" : "bg-gray-200"
                    }`}
                    style={{
                      width: `calc(100% - 3rem)`,
                      left: `calc(50% + 1.5rem)`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Message */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-sm font-medium text-foreground">
          {order.order_status === "pending" && "Your order has been placed. We're preparing it for shipment."}
          {order.order_status === "confirmed" && "Your order has been confirmed. It's being packaged."}
          {order.order_status === "shipped" && "Your order is on the way! Track your package with the carrier."}
          {order.order_status === "delivered" && "🎉 Your order has been delivered!"}
        </p>
      </div>
    </div>
  );
};

export default OrderTrackingComponent;
