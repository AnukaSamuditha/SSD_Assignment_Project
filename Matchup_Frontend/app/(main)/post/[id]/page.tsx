"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/providers/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeftCircle,
  BriefcaseBusiness,
  CircleDollarSign,
  UsersRound,
  Cloud,
  FileText,
  Building2,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import z from "zod";
import { applicationSchema } from "@/providers/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useUserStore } from "@/stores/user.store";
import { Spinner } from "@/components/ui/spinner";

export default function PostPage() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { user } = useUserStore();

  const postQuery = useQuery({
    queryKey: ["post", id],
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as ["post", string];

      const res = await axiosInstance.get(`/posts/${id}`);

      return res.data;
    },
  });

  const { handleSubmit, control, reset } = useForm<
    z.infer<typeof applicationSchema>
  >({
    resolver: zodResolver(applicationSchema),
    mode: "onChange",
    defaultValues: {
      postID: String(id),
      companyID: postQuery.data?.post?.company?.PublicID,
    },
  });

  useEffect(() => {
    if (postQuery.data?.post) {
      reset({
        companyID: postQuery.data?.post?.company?.PublicID,
        postID: postQuery.data?.post?.publicID,
      });
    }
  }, [postQuery.data?.post?.company, reset]);

  const applicationMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/application/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    },
    onSuccess: () => {
      reset();
      toast.success("Application is submitted successfully!");
      setFile(null);
    },
    onError: (error) => {
      reset();
      toast.error("Error occurred! " + error.message);
      setFile(null);
    },
  });

  const onSubmit = (data: any) => {
    if (!user) {
      toast.error("User login required!");
      return;
    } else {
      applicationMutation.mutate(data);
    }
  };

  return (
    <section className="w-full h-full">
      {postQuery.isFetched ? (
        <div>
          <div className="w-full h-auto lg:px-10 md:px-10 px-5 py-5 flex justify-start items-center">
            <div
              onClick={() => router.back()}
              className="flex justify-center items-center gap-3"
            >
              <ArrowLeftCircle size={20} color="black" />
              <p className="text-sm font-normal text-[#222222]">Posts</p>
            </div>
          </div>
          <section className="w-full h-auto lg:pl-25 pl-5 pr-5 py-5 lg:pr-25">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full h-auto flex justify-between items-center gap-4"
            >
              <div className="w-auto flex justify-start items-center gap-4">
                <div className="w-14 h-14 rounded-sm flex justify-center items-center">
                  {!postQuery.data?.post ? (
                    <Building2 className="h-8 w-8 text-gray-400" />
                  ) : (
                    <Image
                      src={postQuery.data?.post?.company?.Logo}
                      alt={postQuery.data?.post?.company?.Name + "-logo"}
                      width={400}
                      height={400}
                      className="rounded-md"
                    />
                  )}
                </div>
                <div>
                  <h3 className="lg:text-3xl md:text-3xl text-xl whitespace-nowrap font-bold text-[#222222]">
                    {postQuery.data?.post?.title}
                  </h3>
                  <h6 className="text-md text-zinc-500">
                    {postQuery.data?.post?.company?.Name}
                  </h6>
                </div>
              </div>
              <div className="w-auto h-full flex justify-start items-start">
                <Button
                  disabled={applicationMutation.isPending}
                  type="submit"
                  variant="default"
                >
                  Apply <Paperclip color="white" />
                </Button>
              </div>
            </form>

            <div className="w-full flex justify-start items-center gap-3 mt-5">
              <Badge variant="secondary">
                <BriefcaseBusiness />
                {postQuery.data?.post?.empType === "full-time"
                  ? "Full-Time"
                  : postQuery.data?.post?.empType === "part-time"
                    ? "Part-Time"
                    : postQuery.data?.post?.empType?.charAt(0).toUpperCase() +
                      postQuery.data?.post?.empType?.slice(1)}
              </Badge>

              <Badge variant="secondary">
                <UsersRound />
                {postQuery.data?.post?.workMode === "on-site"
                  ? "On-Site"
                  : postQuery.data?.post?.workMode === "remote"
                    ? "Remote"
                    : "Hybrid"}
              </Badge>

              <Badge variant="secondary">
                <CircleDollarSign />$
                {(Number(postQuery.data?.post?.salary?.min) / 1000).toFixed(1)}k
                - $
                {(
                  (Number(postQuery.data?.post?.salary?.max) / 1000) as number
                ).toFixed(1)}
                k
              </Badge>
            </div>

            <div className="w-full h-auto mt-8 mb-8">
              <p className="w-full text-sm font-normal text-zinc-600">
                {postQuery.data?.post?.summary}
              </p>
            </div>
            <Separator className="w-full" />

            <div
              className="ProseMirror mt-8 text-[#222222]"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(postQuery.data?.post?.description),
              }}
            />
            <Separator className="w-full mt-8 mb-8" />
            <div className="w-full h-auto flex flex-col justify-center items-center">
              <h5 className="text-[#222222] text-lg font-semibold pb-2">
                Apply for This Position
              </h5>
              <p className="w-[50%] text-sm font-normal text-zinc-600 text-center mb-8">
                Your application details will be securely submitted using the
                information available on your profile.
              </p>
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Cloud />
                  </EmptyMedia>
                  <EmptyTitle>Upload Your Resume</EmptyTitle>
                  <EmptyDescription>
                    Add your latest resume to complete your application for this
                    role.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Controller
                    name="file"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        name="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                            setFile(file);
                          }
                        }}
                      />
                    )}
                  />
                  {file && (
                    <div className="w-full h-auto mb-2 mt-2 flex justify-center items-center gap-2">
                      <FileText size={18} className="text-muted-foreground" />
                      <p className="w-auto text-xs text-muted-foreground whitespace-nowrap truncate overflow-ellipsis">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)}MB
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    Upload
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          </section>
        </div>
      ) : (
        <div className="w-full h-screen flex justify-center items-center">
          <Spinner />
        </div>
      )}
    </section>
  );
}
