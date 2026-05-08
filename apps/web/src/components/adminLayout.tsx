import { useState } from "react";
import { Outlet } from "react-router";
import { MobileDrawer } from "./mobileDrawer";
import { MobileHeader } from "./mobileHeader";

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="bg-background flex min-h-dvh">
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
