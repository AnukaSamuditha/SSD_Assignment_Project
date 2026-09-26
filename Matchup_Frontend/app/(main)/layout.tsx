"use client"
import "@/app/globals.css";
import NavBar from "@/components/NavBar";
import axiosInstance from "@/providers/axios";
import { useUserStore } from "@/stores/user.store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const userQuery = useQuery({
    queryKey: ["self"],
    queryFn: async () => {
      const res = await axiosInstance.get("users/self");

      return res.data;
    },
    retryOnMount: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
      if (userQuery.data?.user) {
        useUserStore.getState().setUser(userQuery.data?.user);
      }
  }, [userQuery.data?.user]);

  return (
    <>
      <header>
        <NavBar />
      </header>
      {children}
    </>
  );
}
