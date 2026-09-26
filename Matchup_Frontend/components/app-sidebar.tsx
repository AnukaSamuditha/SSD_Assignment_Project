"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  BriefcaseBusiness,
  LayoutTemplate,
  Building,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/providers/axios";
import Link from "next/link";
import Image from "next/image";
import MatchupLogo from "@/public/matchup_logo.png";


const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Job Management",
      url: "/dashboard",
      icon: BriefcaseBusiness,
      isActive: true,
      items: [
        {
          title: "Post job",
          url: "/dashboard",
        },
        {
          title: "Jobs",
          url: "/dashboard/jobs",
        },
      ],
    },
    {
      title: "Templates",
      url: "#",
      icon: LayoutTemplate,
      items: [
        {
          title: "My templates",
          url: "#",
        },
        {
          title: "Create new",
          url: "#",
        },
        {
          title: "Drafts",
          url: "#",
        },
      ],
    },
    {
      title: "Company",
      url: "#",
      icon: Building,
      items: [
        {
          title: "Company Profile",
          url: "/dashboard/company",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-1 pb-0">
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center py-1 group-data-[collapsible=icon]:hidden"
        >
          <Image
            src={MatchupLogo}
            alt="Matchup"
            width={2816}
            height={1536}
            className="h-11 w-auto"
          />
        </Link>
        {companyQuery.data?.company && (
          <TeamSwitcher teams={[companyQuery.data?.company]} />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userQuery.data?.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
