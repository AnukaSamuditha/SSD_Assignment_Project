"use client";

import InputField from "@/components/InputField";
import InputLabel from "@/components/Label";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MinimalTiptap } from "@/components/ui/shadcn-io/minimal-tiptap";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/providers/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { jobPostUpdateSchema } from "@/providers/schemas";
import z from "zod";
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
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function UpdatePost() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [editorKey, setEditorKey] = useState<number>(0);

  const postQuery = useQuery({
    queryKey: ["post", id],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as ["post", string];

      const res = await axiosInstance.get(`/posts/${id}`);
      return res.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!id,
  });

  const { register, reset, handleSubmit, control } = useForm<
    z.infer<typeof jobPostUpdateSchema>
  >({
    resolver: zodResolver(jobPostUpdateSchema),
    mode: "onChange",
    defaultValues: {
      title: postQuery.data?.post?.title,
      summary: postQuery.data?.post?.summary,
      description: postQuery.data?.post?.description,
      empType: postQuery.data?.post?.empType,
      workMode: postQuery.data?.post?.workMode,
      salary: {
        currency: postQuery.data?.post?.salary?.currency,
        min: postQuery.data?.post?.salary?.min,
        max: postQuery.data?.post?.salary?.max,
      },
    },
  });

  useEffect(() => {
    if (postQuery.data) {
      reset({
        title: postQuery.data?.post?.title,
        summary: postQuery.data?.post?.summary,
        description: postQuery.data?.post?.description,
        empType: postQuery.data?.post?.empType,
        workMode: postQuery.data?.post?.workMode,
        salary: {
          currency: postQuery.data?.post?.salary?.currency,
          min: postQuery.data?.post?.salary?.min,
          max: postQuery.data?.post?.salary?.max,
        },
      });
      setEditorKey((k) => k + 1);
    }
  }, [postQuery.data, reset]);

  const jobMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.patch(`/posts/${id}`, data);

      return res;
    },
    onSuccess: (data) => {
      reset();
      toast.success("Job is updated successfully!");
      router.back();
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full h-auto px-5">
      <div className="w-full flex justify-between items-center">
        <div className="w-full h-auto flex justify-between items-start gap-2">
          <div className="w-[80%]">
            <h1 className="text-lg font-medium text-black">Update Post</h1>
            <p className="w-[80%] text-xs text-[#b0b0b0]">
              {postQuery.data?.post?.title}
            </p>
          </div>
          <div className="w-auto h-full flex justify-center items-center gap-3">
            <Button type="button" onClick={() => router.back()} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={jobMutation.isPending}
              type="submit"
              variant="default"
            >
              {jobMutation.isIdle ? "Save" : jobMutation.isPending && "Saving"}
            </Button>
          </div>
        </div>
      </div>
      <Separator className="w-full mt-5 mb-5" />

      <div className="w-full h-auto mt-5">
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
                    Update salary criteria
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
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <MinimalTiptap
                    key={editorKey}
                    content={field.value}
                    onChange={field.onChange}
                    className="w-full"
                    placeholder="Provide detailed job description..."
                    editable={true}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
