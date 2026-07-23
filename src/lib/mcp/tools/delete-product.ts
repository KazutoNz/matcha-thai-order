import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, assertAdminOrManager } from "./_helpers";

export default defineTool({
  name: "delete_product",
  title: "Delete product",
  description: "Delete a MatchaMew product by ID. Admin or manager only. This is irreversible.",
  inputSchema: {
    product_id: z.string().uuid().describe("Product UUID to delete."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ product_id }, ctx) => {
    const forbidden = await assertAdminOrManager(ctx);
    if (forbidden) return { content: [{ type: "text", text: forbidden }], isError: true };

    const { error } = await supabaseForUser(ctx)
      .from("products")
      .delete()
      .eq("id", product_id);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Product ${product_id} deleted.` }],
      structuredContent: { deleted_id: product_id },
    };
  },
});
