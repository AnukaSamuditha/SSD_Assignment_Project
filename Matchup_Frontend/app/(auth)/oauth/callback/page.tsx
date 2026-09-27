"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/providers/axios";
import { toast } from "sonner";
import { useUserStore } from "@/stores/user.store";
import { useCompanyStore } from "@/stores/company.store";
import { Spinner } from "@/components/ui/spinner";

// Landing point after the Google OAuth redirect. By the time the browser
// gets here the API has already set the session cookie (see
// GoogleCallback in Matchup_API/controllers/oauthController.go), so this
// page just has to fetch the now-authenticated user and route them in,
// mirroring the onSuccess logic on the password login/signup pages.
export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const error = searchParams.get("error");

    if (error) {
      toast.error("Google sign-in failed. Please try again.");
      router.replace("/login");
      return;
    }

    axiosInstance
      .get("users/self")
      .then((res) => {
        useCompanyStore.getState().logout();
        useUserStore.getState().setUser(res.data?.user);
        toast.success("Signed in with Google");
        router.replace(res.data?.user?.Type === "employer" ? "/dashboard" : "/");
      })
      .catch(() => {
        toast.error("Could not complete Google sign-in. Please try again.");
        router.replace("/login");
      });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-3 bg-white">
      <Spinner className="size-6 text-[#5c6b1c]" />
      <p className="text-sm font-normal text-zinc-400">
        Finishing sign-in with Google...
      </p>
    </div>
  );
}
