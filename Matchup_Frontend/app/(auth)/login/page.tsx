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
    <div className="w-full sm:h-screen lg:h-[90vh] flex justify-center items-center mb-5">
      <div className="lg:w-[70%] md:w-[70%] w-full h-[100%] lg:h-[100%] flex">
        <div className="hidden lg:flex md:flex md:flex-col lg:w-1/2  md:w-1/2 h-auto p-3 bg-[#c8d746] relative">
          <h1 className="text-xl font-bold text-white">Matchup</h1>
          <h6 className="text-sm font-normal text-white text-left">
            Where talent meets opportunity
          </h6>
          <div className="flex flex-col justify-center items-center w-full h-[80%]">
            <div className="w-[200px] h-[200px] lg:w-[300px] lg:h-[300px] shadow-black/100">
              <Image
                src={sculptor}
                alt="sculpter"
                width={1024}
                height={1024}
                placeholder="blur"
              />
            </div>
            <h5 className="text-md lg:text-lg font-semibold text-white mt-3 text-left w-[60%]">
              Welcome back!
            </h5>
            <p className="text-xs font-normal text-white text-left w-[60%]">
              Login to your Matchup account to access your dashboard and other
              features.
            </p>
          </div>
          <div className="absolute bottom-4 w-full h-2 p-2">
            <p className="text-xs lg:text-xs font-normal text-white text-center">
              @{new Date().getFullYear()} Matchup. All rights reserved
            </p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 md:w-1/2 h-full px-4 py-5 bg-gray-50">
          <h1 className="text-xl font-bold text-[#222222]">
            Sign in to your account
          </h1>
          <p className="text-xs font-light  text-zinc-400 text-left">
            Enter your credentials to access your Matchup account.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full h-[80%] mt-5 flex flex-col justify-start gap-4 relative"
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
              className={`w-full px-3 py-2.5 rounded-sm ${
                isPending ? "bg-gray-200" : "bg-black"
              } text-white font-medium text-sm`}
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="w-full h-auto mt-3">
            <p onClick={() => router.push("/signup")} className="text-xs font-normal text-[#6a6a6a] text-center cursor-pointer">
              Don&apos;t have an account?{" "}
              <span className="text-[#c8d746]">Create one</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
