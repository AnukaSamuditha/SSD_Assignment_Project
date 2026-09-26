"use client";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthNav() {
  const router = useRouter();

  return (
    <nav className="w-full h-14 flex justify-start items-center p-4">
      <button
        onClick={() => router.back()}
        className="text-xs font-medium text-[#222222] flex gap-3"
      >
        <ArrowLeftCircle className="text-[#222222]" size={18} />
        {/* Back to home */}
      </button>
    </nav>
  );
}
