import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMenu from "./tools/list-menu";
import listMyOrders from "./tools/list-my-orders";
import getOrder from "./tools/get-order";
import getMyProfile from "./tools/get-my-profile";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "matchamew-mcp",
  title: "MatchaMew",
  version: "0.1.0",
  instructions:
    "Tools for MatchaMew, a Thai matcha cafe ordering app. Use list_menu to browse products, list_my_orders and get_order to inspect the signed-in user's orders, and get_my_profile for their reward points and default delivery info.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listMenu, listMyOrders, getOrder, getMyProfile],
});
