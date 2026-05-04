import { type RouteObject } from "react-router";
import RootLayout from "../components/rootLayout";
import Index from "../pages/home";

export const routes: RouteObject[] = [
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Index,
      },
    ],
  },
];
