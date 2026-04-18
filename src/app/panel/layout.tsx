"use client";

import { useState } from "react";
import PanelSidebar from "@/components/panel/PanelSidebar";
import PanelTopBar from "@/components/panel/PanelTopBar";
import { ActionCountProvider } from "@/lib/context/ActionCountContext";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ActionCountProvider>
      <div className="flex h-screen overflow-hidden bg-[#F7F7F8]">
        <PanelSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <div
          className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            collapsed ? "ml-[64px]" : "ml-[240px]"
          }`}
        >
          <PanelTopBar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="max-w-[1100px] mx-auto px-8 pt-6 pb-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ActionCountProvider>
  );
}
