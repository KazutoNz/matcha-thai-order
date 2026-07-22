import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_order",
  title: "Get order details",
  description: "Get details and items for one of the signed-in user's orders by order ID.",
  inputSchema: {
    order_id: z.string().uuid().describe("Order UUID from list_my_orders."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ order_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const client = supabaseForUser(ctx);
    const { data: order, error } = await client
      .from("orders")
      .select("id,status,total,created_at,user_id")
      .eq("id", order_id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!order || order.user_id !== ctx.getUserId()) {
      return { content: [{ type: "text", text: "Order not found" }], isError: true };
    }
    const { data: items } = await client
      .from("order_items")
      .select("product_id,qty,price,sweetness,toppings,products(name)")
      .eq("order_id", order_id);
    const result = { order, items: items ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
    };
  },
});
