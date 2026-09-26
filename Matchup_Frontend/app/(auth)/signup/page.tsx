"use client";
import InputField from "@/components/InputField";
import Image from "next/image";
import workStation from "@/images/workstation.png";
import employer from "@/images/blazer.png";
import { Briefcase, User } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/providers/axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@/providers/schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import z from "zod";
import { useUserStore } from "@/stores/user.store";
import { useCompanyStore } from "@/stores/company.store";

export default function SignUp() {
  const [isJobSeeker, setIsJobSeeker] = useState<boolean>(true);
  const router = useRouter();

  const { register, reset, handleSubmit, setValue, control, getValues } =
    useForm<z.infer<typeof userSchema>>({
      resolver: zodResolver(userSchema),
      mode: "onChange",
      defaultValues: {
        type: "regular",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        gender: "male",
      },
    });

  const accountMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("users/signup", data);

      return res;
    },
    onSuccess: (data) => {
      useCompanyStore.getState().logout();
      useUserStore.getState().setUser(data.data?.user);
      if (getValues().type === "employer") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
      reset({
        firstname: "",
        lastname: "",
        type: "regular",
        email: "",
        password: "",
        gender: "male",
      });
      toast.success("Account created successfully");
    },
    onError: (error) => {
      toast.error("Error in creating the account : " + error.message);
      console.log("Error occurred while creating the user. ", error);
      reset({
        firstname: "",
        lastname: "",
        type: "regular",
        email: "",
        password: "",
        gender: "male",
      });
    },
  });

  const onSubmit = (formData: any) => {
    accountMutation.mutate(formData);
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
              src={isJobSeeker ? workStation : employer}
              alt={
                isJobSeeker
                  ? "Illustration of a person working at a desk"
                  : "Illustration of an employer reviewing candidates"
              }
              width={1024}
              height={1024}
              placeholder="blur"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="max-w-md">
            <h2 className="text-2xl font-bold leading-snug text-[#1f2410] lg:text-3xl">
              {isJobSeeker
                ? "Join a network built for top talent"
                : "Find talent that moves your business forward"}
            </h2>
            <p className="mt-3 text-sm font-normal text-[#1f2410]/75">
              {isJobSeeker
                ? "Create a profile once and get matched with roles that fit your skills, experience, and goals."
                : "Post jobs, browse curated candidates, and build your team faster with Matchup."}
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
            Create your account
          </h1>
          <p className="mt-1 text-sm font-light text-zinc-400">
            Join Matchup and discover opportunities that match your skills and
            ambitions.
          </p>
          <div className="mt-5 flex w-full items-center justify-center rounded-md bg-gray-100 p-1">
            <div
              onClick={() => {
                setIsJobSeeker(true);
                setValue("type", "regular");
              }}
              className={`flex w-1/2 cursor-pointer items-center justify-center gap-1 px-2 py-2 ${
                isJobSeeker && "bg-white shadow-sm"
              } rounded-md transition-colors`}
            >
              <User color={isJobSeeker ? "#5c6b1c" : "#222222"} size={18} />
              <h6
                className={`text-sm font-medium ${
                  isJobSeeker ? "text-[#5c6b1c]" : "text-[#222222]"
                }`}
              >
                Job Seeker
              </h6>
            </div>

            <div
              onClick={() => {
                setIsJobSeeker(false);
                setValue("type", "employer");
              }}
              className={`flex h-full w-1/2 cursor-pointer items-center justify-center gap-1 px-2 py-2 ${
                !isJobSeeker && "bg-white shadow-sm"
              } rounded-md transition-colors`}
            >
              <Briefcase
                color={!isJobSeeker ? "#5c6b1c" : "#222222"}
                size={18}
              />
              <h6
                className={`text-sm font-medium ${
                  !isJobSeeker ? "text-[#5c6b1c]" : "text-[#222222]"
                }`}
              >
                Employer
              </h6>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex w-full flex-col justify-start gap-5"
          >
            <InputField
              type="text"
              id="firstname"
              label="First name"
              placeholder="Anuka"
              required={true}
              register={register}
              name="firstname"
            />

            <InputField
              type="text"
              id="Lastname"
              label="Last name"
              placeholder="Abeykoon"
              required={true}
              register={register}
              name="lastname"
            />

            <InputField
              type="email"
              id="email"
              label="Email address"
              placeholder="xxxxxx@example.com"
              required={true}
              register={register}
              name="email"
            />

            <div className="w-full h-auto flex flex-col gap-1">
              <label
                htmlFor="gender"
                className="text-sm font-medium text-[#222222]"
              >
                Gender
              </label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full px-3 py-2">
                      <SelectValue placeholder="Male" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

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
              disabled={accountMutation.isPending}
              className={`w-full cursor-pointer rounded-sm px-3 py-2.5 ${
                accountMutation.isPending ? "bg-gray-200" : "bg-black"
              } text-sm font-medium text-white transition-colors`}
            >
              {accountMutation.isPending ? "Creating..." : "Create account"}
            </button>
          </form>
          <div className="mt-6 w-full">
            <p className="text-center text-xs font-normal text-[#6a6a6a]">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/login")}
                className="cursor-pointer font-semibold text-[#5c6b1c]"
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
