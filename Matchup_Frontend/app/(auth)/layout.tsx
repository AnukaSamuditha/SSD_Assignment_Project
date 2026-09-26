import React from "react";
import "@/app/globals.css";
import AuthNav from "@/components/AuthNav";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <>
        <AuthNav />
        {children}
      </>
  );
}
