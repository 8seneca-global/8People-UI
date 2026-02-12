"use client";

import { ReactNode } from "react";
import { TopBar } from "./top-bar";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <>
      <TopBar title={title} subtitle={subtitle} />
      {children && <div className="mt-4">{children}</div>}
    </>
  );
}
