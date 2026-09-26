"use client";
import InputField from "@/components/InputField";
import Image from "next/image";
import sculptor from "@/images/sculpter.png";
import { useForm } from "react-hook-form";
import { LoginRequestType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginRequestSchema } from "@/providers/schemas";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/providers/axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/stores/user.store";
import { useCompanyStore } from "@/stores/company.store";

export default function LoginPage() {
  const { register, reset, handleSubmit } = useForm<LoginRequestType>({
    resolver: zodResolver(loginRequestSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("users/login", data);

      return res;
    },
    onSuccess: (data) => {
      useCompanyStore.getState().logout();
      useUserStore.getState().setUser(data.data?.user)
      toast.success("Login successfull");
      reset();
      router.replace("/");
    },
    onError: (error) => {
      toast.error("Error logging : " + error.message);
      reset();
    },
  });

  const onSubmit = (formData: any) => {
    mutate(formData);
  };

  return (
    <div className="flex w-full min-h-dvh flex-col md:flex-row">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#c8d746] px-10 py-10 md:flex md:h-dvh md:w-1/2 lg:px-16">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-black/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-[#1f2410]">Matchup</h1>
          <h6 className="mt-1 text-sm font-normal text-[#1f2410]/70">
            Where talent meets opportunity
          </h6>
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <div className="h-64 w-64 lg:h-80 lg:w-80">
            <Image
              src={sculptor}
              alt="Illustration of a person achieving their career goals"
              width={1024}
              height={1024}
              placeholder="blur"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="max-w-md">
            <h2 className="text-2xl font-bold leading-snug text-[#1f2410] lg:text-3xl">
              Pick up right where you left off
            </h2>
            <p className="mt-3 text-sm font-normal text-[#1f2410]/75">
              Sign in to track your applications, message employers, and
              discover new roles matched to your skills.
            </p>
          </div>
        </div>

        <p className="relative z-10 text-xs font-normal text-[#1f2410]/60">
          &copy;{new Date().getFullYear()} Matchup. All rights reserved.
        </p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-white px-6 py-16 md:h-dvh md:w-1/2 md:flex-none md:overflow-y-auto sm:px-10">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-[#222222]">
            Sign in to your account
          </h1>
          <p className="mt-1 text-sm font-light text-zinc-400">
            Enter your credentials to access your Matchup account.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 flex w-full flex-col gap-5"
          >
            <InputField
              type="email"
              id="email"
              label="Email address"
              placeholder="johndoe@example.com"
              required={true}
              register={register}
              name="email"
            />

            <InputField
              type="password"
              id="password"
              label="Password"
              placeholder="••••••••"
              required={true}
              register={register}
              name="password"
              guide="Must be at least 8 characters with 1 uppercase, 1 number, and 1 special character."
            />

            <button
              type="submit"
              disabled={isPending}
              className={`w-full cursor-pointer rounded-sm px-3 py-2.5 ${
                isPending ? "bg-gray-200" : "bg-black"
              } text-sm font-medium text-white transition-colors`}
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-6 w-full">
            <p
              onClick={() => router.push("/signup")}
              className="cursor-pointer text-center text-xs font-normal text-[#6a6a6a]"
            >
              Don&apos;t have an account?{" "}
              <span className="font-semibold text-[#5c6b1c]">Create one</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
