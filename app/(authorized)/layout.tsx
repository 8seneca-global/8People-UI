"use client";

import React from "react";
import { Sidebar } from "@/modules/core/components/layout/sidebar";
import { TopBar } from "@/modules/core/components/layout/top-bar";

export default function AuthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto bg-background">{children}</div>
      </div>
    </div>
  );
}
