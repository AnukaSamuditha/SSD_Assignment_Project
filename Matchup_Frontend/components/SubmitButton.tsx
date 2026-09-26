"use client";
import { CircleArrowRight, IconNode } from "lucide-react";
import { useRouter } from "next/navigation";

// type SubmitButtonType = {
//   title: string;
//   onSubmit: () => void;
//   icon: IconNode;
// };

export default function SubmitButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/signup")}
      className="w-auto rounded-full px-3 py-2 text-white font-medium bg-black text-sm flex items-center justify-center gap-2"
    >
      Get Started <CircleArrowRight color="white" size={18} />
    </button>
  );
}
