"use client";
import React, { useEffect } from "react";
import "@/app/globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/providers/axios";
import { useCompanyStore } from "@/stores/company.store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userQuery = useQuery({
    queryKey: ["self"],
    queryFn: async () => {
      const res = await axiosInstance.get("users/self");

      return res.data;
    },
    retryOnMount: true,
    refetchOnReconnect: true,
  });

  const companyQuery = useQuery({
    queryKey: ["company", userQuery.data?.user?.PublicID],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey;
      const res = await axiosInstance.get(`/company/${id}/exists`);

      return res.data;
    },
    enabled: !!userQuery.data?.user?.PublicID,
  });

  useEffect(() => {
    if (companyQuery.data?.company) {
      useCompanyStore.getState().setCompany(companyQuery.data?.company);
    }
  }, [companyQuery.data?.company]);

  const pathname = usePathname();
  const paths = pathname.split("/").filter((path) => path);

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {paths.map((path, index) => {
                    const href = `/${paths.slice(0, index + 1).join("/")}`;
                    return (
                      <React.Fragment key={index}>
                        <BreadcrumbItem className="hidden md:block max-w-[100px] text-ellipsis">
                          <BreadcrumbLink
                            className="block max-w-[100px] capitalize text-ellipsis whitespace-nowrap overflow-hidden"
                            href={href}
                          >
                            {path}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {paths.length !== index + 1 && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div>{children}</div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
