import { Outlet } from "react-router";
import { AuthModalProvider } from "../provider/authModalProvider";

export function RootLayout() {
  return (
    <AuthModalProvider>
      <Outlet />
    </AuthModalProvider>
  );
}
