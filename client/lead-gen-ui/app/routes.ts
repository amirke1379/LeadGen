import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("leads/:id", "routes/lead-detail.tsx"),
] satisfies RouteConfig;
