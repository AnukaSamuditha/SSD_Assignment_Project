import React from "react";
import "@/app/globals.css";
import AuthNav from "@/components/AuthNav";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full min-h-dvh">
      <AuthNav />
      {children}
    </div>
  );
}
