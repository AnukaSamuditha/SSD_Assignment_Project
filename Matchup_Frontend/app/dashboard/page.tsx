"use client";
import InputField from "@/components/InputField";
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, FieldErrors, FieldError } from "react-hook-form";
import InputLabel from "@/components/Label";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MinimalTiptap } from "@/components/ui/shadcn-io/minimal-tiptap";
import { jobPostSchema } from "@/providers/schemas";
import z from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import axiosInstance from "@/providers/axios";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/stores/company.store";
import useIsMounted from "@/hooks/useIsMounted";
import { Spinner } from "@/components/ui/spinner";
import ImageNotFound from "@/images/404_img.svg";
import Image from "next/image";

export default function Page() {
  const isMounted = useIsMounted();
  const company = useCompanyStore((s) => s.company);
  const hasHydrated = useCompanyStore.persist?.hasHydrated();
  const router = useRouter();

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof jobPostSchema>>({
    resolver: zodResolver(jobPostSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      summary: "",
      description: "",
      empType: "full-time",
      workMode: "on-site",
      salary: {
        currency: "LKR",
        min: 0,
        max: 0,
      },
      companyID: company?.PublicID,
    },
  });

  useEffect(() => {
    if (company?.PublicID) {
      reset({
        companyID: company.PublicID,
      });
    }
  }, [company, reset]);

  const jobMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/posts/", data);

      return res;
    },
    onSuccess: (data) => {
      reset();
      toast.success("Job is posted successfully!");
      router.push("/dashboard/jobs");
    },
    onError: (error) => {
      reset();
      console.log("Error creating the job post! ", error.message);
      toast.error("Error in posting the job : " + error.name);
    },
  });

  const onSubmit = (data: any) => {
    jobMutation.mutate(data);
  };

  const onError = (errors: FieldErrors<z.infer<typeof jobPostSchema>>) => {
    const firstError = Object.values(errors)[0];

    if (firstError && (firstError as FieldError).message) {
      toast.warning((firstError as FieldError).message);
    } else {
      toast.warning("Please fix the form error before submitting!");
    }
  };

  return !hasHydrated || !isMounted ? (
    <section className="w-full h-[100%] flex justify-center items-center">
      <Spinner className="size-min" />
    </section>
  ) : company ? (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="w-full h-full px-5"
    >
      <div className="w-full h-auto flex justify-between items-center">
        <div className="w-auto">
          <h1 className="text-lg font-medium text-black">Post New Job</h1>
          <p className="text-xs text-[#b0b0b0]">
            Share the role details to help qualified candidates discover.
          </p>
        </div>
        <div className="w-auto flex justify-center items-center gap-3">
          <Button variant="outline" size="lg">
            Cancel
          </Button>
          <Button
            disabled={jobMutation.isPending}
            type="submit"
            variant="default"
            size="lg"
          >
            Post Job
          </Button>
        </div>
      </div>
      <Separator className="w-full mt-5 mb-5" />
      <section className="w-full h-auto mt-5">
        <div className="w-full h-auto flex flex-col justify-start items-start gap-5">
          <div className="w-full h-auto flex justify-center items-center gap-4">
            <div className="w-1/2">
              <InputField
                id="title"
                name="title"
                type="text"
                register={register}
                required={true}
                label="Job Title"
                placeholder="Brief title to describe job"
              />
            </div>
            <div className="w-1/2 h-auto flex flex-col justify-center items-start gap-1">
              <InputLabel title="Employment Type" name="emp-type" />
              <Controller
                name="empType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full !px-3 !py-2">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Job Types</SelectLabel>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="w-full h-auto flex justify-center items-center gap-4">
            <div className="w-1/2 h-auto flex flex-col justify-center items-start gap-1">
              <InputLabel title="Work Mode" name="work-mode" />
              <Controller
                name="workMode"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Work Mode</SelectLabel>
                        <SelectItem value="on-site">On-site</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="w-1/2 h-auto flex flex-col justify-center items-start gap-1">
              <InputLabel title="Salary" name="salary" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="w-full text-muted-foreground flex justify-start items-center font-normal"
                    variant="outline"
                  >
                    Specify salary criteria
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="leading-none font-medium">Salary Range</h4>
                      <p className="text-muted-foreground text-sm">
                        Define your salary expectations
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="width">Currency</Label>
                        <Controller
                          name="salary.currency"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="LKR" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>
                                    Supported currencies
                                  </SelectLabel>
                                  <SelectItem value="LKR">LKR</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="AUD">AUD</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="maxWidth">Max</Label>
                        <Input
                          id="maxSalary"
                          defaultValue="0"
                          className="col-span-2 h-8"
                          {...register("salary.max", { valueAsNumber: true })}
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="height">Min</Label>
                        <Input
                          id="minSalary"
                          defaultValue="0"
                          className="col-span-2 h-8"
                          {...register("salary.min", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="w-full h-auto flex justify-start items-center">
            <div className="w-full h-auto flex flex-col justify-center items-start gap-1">
              <InputLabel title="Job Summary" name="summary" />
              <Textarea
                placeholder="Provide a job summary"
                {...register("summary", { required: true })}
              />
            </div>
          </div>

          <div className="w-full h-auto flex justify-start items-center">
            <div className="w-full h-auto flex flex-col justify-center items-start gap-1">
              <InputLabel title="Job Description" name="description" />
              <MinimalTiptap
                onChange={(html) => setValue("description", html)}
                className="w-full"
                placeholder="Provide detailed job description..."
                editable={true}
              />
            </div>
          </div>
        </div>
      </section>
    </form>
  ) : (
    <div className="w-full h-[80vh] flex justify-center items-center">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="w-full h-auto flex justify-center items-center">
          <Image
            src={ImageNotFound}
            alt="company not found"
            width={800}
            height={800}
            className="w-30 h-30"
          />
        </div>
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>No Company Yet</ItemTitle>
            <ItemDescription>
              You need a company profile before post jobs.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              onClick={() => router.push("/dashboard/company")}
              disabled={jobMutation.isPending}
              variant="outline"
              size="sm"
            >
              Create
            </Button>
          </ItemActions>
        </Item>
      </div>
    </div>
  );
}
