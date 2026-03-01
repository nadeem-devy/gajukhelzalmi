"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { StoreProvider, useStore } from "@/lib/store";
import { LangProvider, useLang } from "@/lib/i18n/context";
import LoadingSkeleton from "@/components/ui/loading-skeleton";
import Navbar from "./navbar";
import Footer from "./footer";
import ServiceWorkerRegister from "@/components/pwa/sw-register";

// Pages that don't need store data to render
const SKIP_LOADING_PATHS = ["/login"];

// Bridge: syncs store's dataUrduMap to LangContext
function DataUrduBridge({ children }: { children: React.ReactNode }) {
  const { dataUrduMap, isLoading, error } = useStore();
  const { setDataUrduMap } = useLang();
  const pathname = usePathname();

  useEffect(() => {
    setDataUrduMap(dataUrduMap);
  }, [dataUrduMap, setDataUrduMap]);

  const skipLoading = SKIP_LOADING_PATHS.some((p) => pathname.startsWith(p));

  if (isLoading && !skipLoading) {
    return (
      <>
        <Navbar />
        <main className="flex-1"><LoadingSkeleton /></main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="flex-1">
          <div className="container-page">
            <div className="empty-state">
              <h2 className="text-lg font-bold text-warmgray-700 mt-3">Failed to load data</h2>
              <p className="text-sm text-warmgray-500 mt-1">{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary mt-4">Retry</button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <AuthProvider>
        <StoreProvider>
          <ServiceWorkerRegister />
          <DataUrduBridge>{children}</DataUrduBridge>
        </StoreProvider>
      </AuthProvider>
    </LangProvider>
  );
}
