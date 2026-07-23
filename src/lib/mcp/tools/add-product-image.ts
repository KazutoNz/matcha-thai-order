import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, assertAdminOrManager } from "./_helpers";

export default defineTool({
  name: "add_product_image",
  title: "Add product image",
  description: "Append an image URL to a product's gallery. Admin or manager only.",
  inputSchema: {
    product_id: z.string().uuid(),
    image_url: z.string().url().describe("Image URL to append to the gallery."),
    set_as_primary: z.boolean().optional().describe("If true, also set this URL as the primary image_url."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ product_id, image_url, set_as_primary }, ctx) => {
    const forbidden = await assertAdminOrManager(ctx);
    if (forbidden) return { content: [{ type: "text", text: forbidden }], isError: true };

    const client = supabaseForUser(ctx);
    const { data: current, error: readErr } = await client
      .from("products")
      .select("images,image_url")
      .eq("id", product_id)
      .maybeSingle();
    if (readErr) return { content: [{ type: "text", text: readErr.message }], isError: true };
    if (!current) return { content: [{ type: "text", text: "Product not found" }], isError: true };

    const nextImages = [...((current.images as string[]) ?? []), image_url];
    const patch: Record<string, unknown> = { images: nextImages };
    if (set_as_primary || !current.image_url) patch.image_url = image_url;

    const { data, error } = await client
      .from("products")
      .update(patch)
      .eq("id", product_id)
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { product: data },
    };
  },
});
