import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMenu from "./tools/list-menu";
import listMyOrders from "./tools/list-my-orders";
import getOrder from "./tools/get-order";
import getMyProfile from "./tools/get-my-profile";
import createProduct from "./tools/create-product";
import updateProduct from "./tools/update-product";
import deleteProduct from "./tools/delete-product";
import addProductImage from "./tools/add-product-image";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "matchamew-mcp",
  title: "MatchaMew",
  version: "0.2.0",
  instructions:
    "Tools for MatchaMew, a Thai matcha cafe ordering app. Customers: use list_menu to browse products, list_my_orders and get_order to inspect the signed-in user's orders, and get_my_profile for reward points and default delivery info. Admins/managers can manage the menu with create_product, update_product, delete_product, and add_product_image (supports multiple images and variants with price deltas).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listMenu,
    listMyOrders,
    getOrder,
    getMyProfile,
    createProduct,
    updateProduct,
    deleteProduct,
    addProductImage,
  ],
});
