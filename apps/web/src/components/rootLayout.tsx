import { Outlet } from "react-router";
import Footer from "./layout/footer";
import Header from "./layout/header";
import Map from "./map";

export default function RootLayout() {
  return (
    <>
      <Header />
      <main className="container mx-auto my-8 flex flex-col gap-4 px-4 transition-transform">
        <Outlet />
        <Map />
      </main>
      <Footer />
    </>
  );
}
