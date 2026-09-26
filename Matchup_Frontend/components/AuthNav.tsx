"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthNav() {
  const router = useRouter();

  return (
    <nav className="fixed top-4 left-4 z-30 sm:top-6 sm:left-6">
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/70 text-[#222222] backdrop-blur-sm transition-colors hover:bg-white"
      >
        <ArrowLeft size={18} />
      </button>
    </nav>
  );
}
