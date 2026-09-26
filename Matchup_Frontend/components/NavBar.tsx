"use client";
import Jobs from "@/images/jobs.png";
import Blazer from "@/images/blazer.png";
import Image from "next/image";
import { CircleArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import MatchupLogo from "@/public/matchup_logo.png";
import { useUserStore } from "@/stores/user.store";

export default function NavBar() {
  const { user } = useUserStore();
  const [avatarURL, setAvatarURL] = useState<string>("");

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      setAvatarURL(user?.Avatar);
    }
  }, [user]);

  const handlePublish = () => {
    if (user === null) {
      router.push("/login");
    } else if (user?.Type === "employer") {
      router.push("/dashboard");
    } else {
      toast.warning("Signup as an employer to publish jobs!");
      router.push("/signup");
    }
  };

  return (
    <nav className="w-full h-[5rem] flex justify-start items-center p-7 z-[1000] relative">
      <div className="w-full lg:w-[30%] md:w-[30%] h-full flex justify-start items-center">
        <Image
          src={MatchupLogo}
          alt="matchup_logo"
          width={2816}
          height={1536}
          className="w-auto h-12 lg:h-16 md:h-16"
        />
      </div>
      <div className="w-[40%] h-[4rem] flex justify-center items-center gap-8">
        <div
          onClick={() => router.push("/")}
          className="relative w-auto h-full flex justify-center items-center gap-1 cursor-pointer group"
        >
          <span
            className={`absolute bottom-0 left-0 h-[2px] w-full bg-[#c8d746] ${
              pathname === "/"
                ? "scale-x-100"
                : "scale-x-0 group-hover:scale-x-100"
            } scale-x-0 origin-left transition-transform duration-300`}
          ></span>
          <div className="hidden w-[50px] h-[50px] md:flex lg:flex justify-center items-center shadow-black/15">
            <Image
              src={Jobs}
              width={1024}
              height={1024}
              alt="nav-jobs"
              placeholder="blur"
            />
          </div>
          <h5 className="text-sm font-medium text-black text-center">Jobs</h5>
        </div>

        <div className="relative w-[25%] h-full flex justify-center items-center gap-1 cursor-pointer group">
          <span
            className={`absolute bottom-0 left-0 h-[2px] w-full bg-[#c8d746] ${
              pathname === "/publish"
                ? "scale-x-100"
                : "scale-x-0 group-hover:scale-x-100"
            } scale-x-0 origin-left transition-transform duration-300`}
          ></span>
          <div
            onClick={handlePublish}
            className="sm:w-[200px] sm:h-[200px] lg:w-[60px] lg:h-[60px] hidden md:flex lg:flex justify-center items-center"
          >
            <Image
              src={Blazer}
              width={1024}
              height={1024}
              alt="nav-job-post"
              placeholder="blur"
            />
          </div>
          <h5 className={`text-sm font-normal text-[#6a6a6a] text-center`}>
            Publish
          </h5>
        </div>
      </div>

      <div className="w-full lg:w-[30%] md:w-[30%] h-full flex justify-end items-center ">
        <div className="lg:w-auto md:w-auto h-full flex justify-center items-center gap-3">
          {/* <button className="w-auto hover:bg-zinc-200 h-[32px] px-3 text-[#6a6a6a] font-normal  text-xs flex items-center justify-center gap-2">
            Post a Position
          </button> */}
          {user ? (
            user?.Avatar && avatarURL ? (
              <div className="w-10 h-10 flex justify-center items-center rounded-full border-2 border-[#c8d746]">
                <Image
                  src={avatarURL}
                  alt="user-profile"
                  className="w-full h-full rounded-full"
                  width={500}
                  height={500}
                  unoptimized
                />
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="w-auto py-2 rounded-full px-4 text-white font-medium bg-black text-sm flex items-center justify-center gap-2"
              >
                Signin <CircleArrowRight color="white" size={18} />
              </button>
            )
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="w-auto py-2 rounded-full px-4 text-white font-medium bg-black text-sm flex items-center justify-center gap-2"
            >
              Signin <CircleArrowRight color="white" size={18} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
