import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, assertAdminOrManager } from "./_helpers";

const variantSchema = z.object({
  name: z.string().describe("Variant label, e.g. 'Standard' or 'Mint'."),
  price_delta: z.number().describe("Price adjustment applied on top of base price (can be 0 or negative)."),
});

export default defineTool({
  name: "create_product",
  title: "Create product",
  description: "Create a new MatchaMew menu item. Admin or manager only. Supports multiple images and variants.",
  inputSchema: {
    name: z.string().min(1).describe("Product name (Thai or English)."),
    price: z.number().nonnegative().describe("Base price in THB."),
    category: z.enum(["drink", "dessert"]).describe("Menu category."),
    image_url: z.string().url().optional().describe("Primary image URL (falls back to first of images)."),
    images: z.array(z.string().url()).optional().describe("Gallery of image URLs."),
    variants: z.array(variantSchema).optional().describe("Optional product variants with price deltas."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const forbidden = await assertAdminOrManager(ctx);
    if (forbidden) return { content: [{ type: "text", text: forbidden }], isError: true };

    const images = input.images ?? (input.image_url ? [input.image_url] : []);
    const image_url = input.image_url ?? images[0] ?? null;

    const { data, error } = await supabaseForUser(ctx)
      .from("products")
      .insert({
        name: input.name,
        price: input.price,
        category: input.category,
        image_url,
        images,
        variants: input.variants ?? [],
      })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { product: data },
    };
  },
});
