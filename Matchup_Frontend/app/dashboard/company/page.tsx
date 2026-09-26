"use client";
import InputField from "@/components/InputField";
import TwitterLogo from "@/components/Twitter";
import { Separator } from "@/components/ui/separator";
import { CloudIcon, Facebook, Linkedin } from "lucide-react";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import z from "zod";
import { companySchema } from "@/providers/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/providers/axios";
import { useEffect, useRef, useState } from "react";
import InputLabel from "@/components/Label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCompanyStore } from "@/stores/company.store";

export default function CompanyProfile() {
  const [logo, setLogo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { company } = useCompanyStore();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields, isValid },
  } = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    mode: "onChange",
    defaultValues: {
      name: company?.Name ?? "",
      description: company?.Description ?? "",
      username: company?.Username ?? "@",
      email: company?.Email ?? "",
      website: company?.website ?? "",
      facebook: company?.facebook ?? "",
      twitter: company?.twitter ?? "",
      linkedin: company?.linkedin ?? "",
      location: company?.Location ?? "",
    },
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company?.Name,
        description: company?.Description,
        username: company?.Username,
        email: company?.Email,
        website: company?.website,
        facebook: company?.facebook,
        linkedin: company?.linkedin,
        twitter: company?.twitter,
        location: company?.Location,
      });
    }
  }, [company, reset]);

  const companyMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/company/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    },
    onSuccess: (data) => {
      useCompanyStore.getState().setCompany(data?.company);
      toast.success("Company is created successfully");
    },
    onError: (error) => {
      toast.error("Error creating the company!");
      console.log("Error creating the company! ", error.message);
    },
  });

  const companyUpdateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.patch(
        `/company/${company?.PublicID}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return res.data;
    },
    onSuccess: (data) => {
      useCompanyStore.getState().setCompany(data?.company);
      toast.success("Company data was updated successfully");
      console.log("Company data was updated successfully");
    },
    onError: (error) => {
      toast.error("Error updating the company data!");
      console.log("Error updating the company data! ", error.message);
    },
  });

  const onSubmit = (formData: any) => {
    if (company?.Name) {
      const updatedData: any = {};

      Object.keys(dirtyFields).forEach((key) => {
        updatedData[key] = formData[key];
      });
      companyUpdateMutation.mutate(updatedData);
    } else {
      companyMutation.mutate(formData);
    }
  };

  return (
    <section className="w-full h-full px-5">
      <form
        onSubmit={handleSubmit(onSubmit, (e) => console.log(e))}
        className="w-full h-auto flex justify-between items-center"
      >
        <div className="w-auto h-auto">
          <h1 className="text-lg font-medium text-black">Company Profile</h1>
          <p className="text-xs text-[#b0b0b0]">
            Manage your company details to help candidates learn about you.
          </p>
        </div>
        <div className="w-auto h-auto flex justify-start items-center gap-3">
          <Button size="lg" variant="outline" onClick={() => reset()}>
            Cancel
          </Button>
          <Button
            disabled={
              companyMutation.isPending || companyUpdateMutation.isPending || !isValid
            }
            type="submit"
            size="lg"
            variant="default"
          >
            {company?.PublicID ? "Update" : "Save"}
          </Button>
        </div>
      </form>
      <Separator className="w-full mt-5 mb-5" />
      <div className="w-full h-auto">
        <div className="w-full h-auto flex lg:flex-row md:flex-row flex-col justify-center items-start gap-5">
          <div className="lg:w-[60%] md:w-[60%] w-full h-auto flex flex-col justify-center items-start space-y-4">
            <h2 className="text-md font-medium text-gray-700 first:mb-0">
              Basic Information
            </h2>
            <div className="w-full h-auto flex justify-center items-center gap-5">
              <div className="w-1/2 flex justify-start items-center mt-5">
                <InputField
                  id="name"
                  name="name"
                  type="text"
                  register={register}
                  required={true}
                  label="Company Name"
                  placeholder="Provide your company name"
                />
              </div>
              <div className="w-1/2 flex justify-start items-center mt-5">
                <InputField
                  id="username"
                  name="username"
                  type="text"
                  register={register}
                  required={true}
                  label="Username"
                  placeholder="Suitable company username"
                />
              </div>
            </div>

            <div className="w-full h-auto flex justify-center items-center gap-5">
              <div className="w-full flex justify-start items-center">
                <InputField
                  id="email"
                  name="email"
                  type="email"
                  register={register}
                  required={true}
                  label="Email Address"
                  placeholder="Provide company email address"
                />
              </div>
            </div>

            <div className="w-full h-auto flex justify-start items-center">
              <div className="w-full h-auto flex flex-col justify-center items-start gap-1">
                <InputLabel title="Company Summary" name="summary" />
                <Textarea
                  placeholder="Provide a brief company introduction"
                  {...register("description", { required: true })}
                />
              </div>
            </div>

            <div className="w-full h-auto flex justify-center items-center gap-5">
              <div className="w-full flex justify-start items-center">
                <InputField
                  id="location"
                  name="location"
                  type="text"
                  register={register}
                  required={true}
                  label="Address"
                  placeholder="Provide company address"
                />
              </div>
            </div>

            <div className="w-full h-auto flex justify-center items-center gap-5">
              <div className="w-full flex justify-start items-center">
                <InputField
                  id="website"
                  name="website"
                  type="url"
                  register={register}
                  required={false}
                  label="Website*"
                  placeholder="Provide company website"
                />
              </div>
            </div>
            <Separator className="w-full mt-5" />
            <h2 className="text-md font-medium text-gray-700">
              Social Networks
            </h2>
            <div className="w-full h-auto flex justify-center items-center gap-5">
              <div className="w-full flex justify-start items-center">
                <InputField
                  id="facebook"
                  name="facebook"
                  type="url"
                  register={register}
                  required={false}
                  label="Facebook*"
                  icon={<Facebook color="#0866FF" size={12} />}
                  placeholder="Facebook page url"
                />
              </div>
            </div>
            <div className="w-full h-auto flex justify-center items-center gap-5">
              <div className="w-full flex justify-start items-center">
                <InputField
                  id="twitter"
                  name="twitter"
                  type="url"
                  register={register}
                  required={false}
                  label="(Twitter)*"
                  icon={<TwitterLogo size={10} />}
                  placeholder="Twitter account url"
                />
              </div>
            </div>
            <div className="w-full h-auto flex justify-center items-center gap-5 mb-5">
              <div className="w-full flex justify-start items-center">
                <InputField
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  register={register}
                  required={false}
                  label="Linkedin*"
                  icon={<Linkedin size={12} />}
                  placeholder="Linkedin account url"
                />
              </div>
            </div>
          </div>

          <div className="lg:w-[40%] md:w-[40%] w-full h-full flex flex-col justify-start items-start space-y-5">
            <h2 className="text-md font-medium text-gray-700">
              Profile Picture
            </h2>
            <div className="w-full h-auto flex flex-col justify-center items-center gap-4">
              <div className="w-full h-24 flex justify-center items-center">
                {(logo || company?.Logo) && (
                  <div className="w-24 h-24 flex justify-center items-center mt-3 rounded-full">
                    <Image
                      src={logo ?? company?.Logo}
                      alt="empty-profile"
                      width={1024}
                      height={1024}
                      className="w-20 h-20 rounded-full"
                    />
                  </div>
                )}
              </div>
              <Empty className="border border-dashed bg-zinc-50">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CloudIcon />
                  </EmptyMedia>
                  <EmptyTitle>
                    {company?.PublicID
                      ? "Company Logo Uploaded"
                      : "Company Logo Not Added"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {company?.PublicID
                      ? "Your company logo is visible to users. You can update it anytime if needed."
                      : "Upload your company logo to help users easily recognize your brand."}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Controller
                    name="file"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        name="avatar"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                            const url = URL.createObjectURL(file);
                            setLogo(url);
                          }
                        }}
                      />
                    )}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    {company?.PublicID ? "Update Logo" : "Upload Logo"}
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
