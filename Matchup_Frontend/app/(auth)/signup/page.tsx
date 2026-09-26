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
    <div className="w-full h-auto flex justify-center items-center mb-5">
      <div className="lg:w-[70%] md:w-[70%] w-full h-[100%] flex">
        <div className="hidden lg:flex md:flex md:flex-col lg:w-1/2  md:w-1/2 h-auto p-3 bg-[#c8d746] relative">
          <h1 className="text-xl font-bold text-zinc-800">Matchup</h1>
          <h6 className="text-xs font-normal text-white text-left">
            Where talent meets opportunity
          </h6>
          <div className="flex flex-col justify-center items-center w-full h-[80%]">
            <div className="w-[200px] h-[200px] shadow-black/100">
              <Image
                src={isJobSeeker ? workStation : employer}
                alt="workstation"
                width={1024}
                height={1024}
                placeholder="blur"
              />
            </div>
            <h5 className="text-md font-semibold text-white mt-3">
              Join a network of top talent
            </h5>
            <p className="text-xs font-normal text-white text-left w-[60%]">
              Discover talent or land your next role with powerful tools built
              for modern hiring.
            </p>
          </div>
          <div className="absolute bottom-4 w-full h-2 p-2">
            <p className="text-[10px] font-normal text-white text-center">
              @{new Date().getFullYear()} Matchup. All rights reserved
            </p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 md:w-1/2 h-full px-4 py-5 bg-gray-50">
          <h1 className="text-lg font-bold text-[#222222]">
            Create your account
          </h1>
          <p className="text-xs font-light  text-zinc-400 text-left">
            Join Matchup and discover opportunities that match your skills and
            ambitions.
          </p>
          <div className="w-full h-auto flex justify-center items-center bg-gray-100 rounded-md p-1 mt-4">
            <div
              onClick={() => {
                setIsJobSeeker(true);
                setValue("type", "regular");
              }}
              className={`w-1/2 px-2 py-2 flex justify-center items-center gap-1 cursor-pointer ${
                isJobSeeker && "bg-white"
              } rounded-md`}
            >
              <User color={isJobSeeker ? "#c8d746" : "#222222"} size={18} />
              <h6
                className={`text-sm font-medium ${
                  isJobSeeker ? "text-[#c8d746]" : "text-[#222222]"
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
              className={`w-1/2 h-full px-2 py-2 flex justify-center items-center gap-1 cursor-pointer ${
                !isJobSeeker && "bg-white"
              } rounded-md`}
            >
              <Briefcase
                color={!isJobSeeker ? "#c8d746" : "#222222"}
                size={18}
              />
              <h6
                className={`text-sm font-medium ${
                  !isJobSeeker ? "text-[#c8d746]" : "text-[#222222]"
                }`}
              >
                Employer
              </h6>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full mt-3 flex flex-col justify-start gap-4"
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
              className={`w-full px-3 py-2.5 rounded-sm ${
                accountMutation.isPending ? "bg-gray-200" : "bg-black"
              } text-white font-medium text-sm`}
            >
              {accountMutation.isPending ? "Creating..." : "Create account"}
            </button>
          </form>
          <div className="w-full h-auto mt-4">
            <p className="text-xs font-normal text-[#6a6a6a] text-center">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/login")}
                className="text-[#c8d746]"
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
