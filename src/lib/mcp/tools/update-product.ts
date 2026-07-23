import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, assertAdminOrManager } from "./_helpers";

const variantSchema = z.object({
  name: z.string(),
  price_delta: z.number(),
});

export default defineTool({
  name: "update_product",
  title: "Update product",
  description: "Update fields of an existing MatchaMew product. Admin or manager only. Only provided fields are changed.",
  inputSchema: {
    product_id: z.string().uuid().describe("Product UUID."),
    name: z.string().min(1).optional(),
    price: z.number().nonnegative().optional(),
    category: z.enum(["drink", "dessert"]).optional(),
    image_url: z.string().url().nullable().optional().describe("Primary image URL, or null to clear."),
    images: z.array(z.string().url()).optional().describe("Replace the gallery of image URLs."),
    variants: z.array(variantSchema).optional().describe("Replace the variants list."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ product_id, ...rest }, ctx) => {
    const forbidden = await assertAdminOrManager(ctx);
    if (forbidden) return { content: [{ type: "text", text: forbidden }], isError: true };

    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) patch[k] = v;
    }
    if (Object.keys(patch).length === 0) {
      return { content: [{ type: "text", text: "No fields to update" }], isError: true };
    }

    const { data, error } = await supabaseForUser(ctx)
      .from("products")
      .update(patch)
      .eq("id", product_id)
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Product not found" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { product: data },
    };
  },
});
