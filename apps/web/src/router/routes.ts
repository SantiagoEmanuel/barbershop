import { type RouteObject } from "react-router";
import Index from "../pages/Index";

export const routes: RouteObject[] = [
  {
    path: "/",
    children: [
      {
        index: true,
        Component: Index,
      },
    ],
  },
];
