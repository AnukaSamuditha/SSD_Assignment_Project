"use client";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/providers/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Award,
  CheckCircle,
  GraduationCap,
  OctagonX,
  Paperclip,
  Target,
  TrendingUp,
} from "lucide-react";
import ScoreChart from "@/components/ScoreChart";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ApplicantPage() {
  const params = useParams();
  const applicantID = params?.applicant_id;
  const router = useRouter();

  const applicantQuery = useQuery({
    queryKey: ["applicant", applicantID],
    queryFn: async ({ queryKey }) => {
      const [, applicantID] = queryKey as ["applicant", string];
      const res = await axiosInstance.get(`/application/${applicantID}`);

      return res.data;
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.patch(`/application/${applicantID}`, {
        status: "reviewed",
      });

      return res.data;
    },
    onSuccess: () => {
      toast.success("Application Marked as Reviewed");
      router.back();
    },
    onError: (error) => {
      console.log("Error marking application : ", error);
      toast.error("Error marking application!" + error.message);
    },
  });

  const onSubmit = () => {
    applicationMutation.mutate();
  };

  return (
    <section className="w-full px-5">
      <div className="w-full flex justify-between items-center">
        <div className="w-auto h-auto flex justify-start items-start gap-2">
          <div className="w-auto h-auto">
            <div className="w-auto h-12 flex justify-start items-center gap-3">
              <div className="w-10 h-10 flex justify-center items-center">
                {applicantQuery.isFetched ? (
                  <Image
                    src={applicantQuery.data?.application?.user?.Avatar}
                    alt="profile-picture"
                    width={500}
                    height={500}
                    className="w-full h-full rounded-full border-2 border-[#c8d746]"
                    unoptimized
                  />
                ) : (
                  <Skeleton className="w-10 h-10 rounded-full" />
                )}
              </div>
              <div className="w-auto h-12 flex flex-col justify-center items-start">
                <h1 className="text-lg font-medium text-black leading-6">
                  {applicantQuery.isFetched ? (
                    `${
                      applicantQuery.data?.application?.user?.Firstname
                    } ${" "} ${
                      applicantQuery.data?.application?.user?.Lastname
                    }`
                  ) : (
                    <Skeleton className="h-[25px] w-[170px] rounded-full" />
                  )}
                </h1>
                {applicantQuery.isFetched ? (
                  <p className="text-xs text-[#b0b0b0]">
                    {applicantQuery.data?.application?.user?.Email}
                  </p>
                ) : (
                  <Skeleton className="h-[20px] w-[150px] mt-1 rounded-full" />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-auto h-auto">
          <Button
            onClick={onSubmit}
            disabled={applicationMutation.isPending}
            variant="default"
          >
            <CheckCircle /> Mark as Reviewed
          </Button>
        </div>
      </div>

      <Separator className="w-full mt-5 mb-5" />

      <div className="w-full h-[60vh] flex justify-start items-center gap-3">
        <div className="w-1/2 h-auto">
          <h6 className="text-md font-medium text-gray-700 flex justify-start items-center gap-1">
            <Target size={17} />
            Resume Summary
          </h6>
          <div className="w-full h-auto flex justify-start items-center mt-5">
            <ScoreChart
              chartData={[
                {
                  score:
                    applicantQuery.data?.application?.rating_data?.match_score,
                  name: "Rating Score",
                  fill: "#c8d746",
                },
              ]}
            />
          </div>
        </div>
        <Separator orientation="vertical" className="h-full" />
        <div className="w-[80%] h-full flex flex-col justify-start items-start gap-8">
          <div className="w-full h-auto flex flex-col justify-start items-start">
            <h6 className="text-md font-medium text-gray-700 flex justify-start items-center gap-1">
              <Award size={17} />
              Matching Skills
            </h6>
            <div className="w-full h-auto flex flex-wrap justify-start items-center gap-3 mt-2">
              {applicantQuery.data?.application?.rating_data?.matched_skills?.map(
                (skill: string, index: number) => (
                  <Badge key={index} variant="default" className="capitalize">
                    {skill}{" "}
                  </Badge>
                )
              )}
            </div>
          </div>

          <div className="w-full h-auto flex flex-col justify-start items-start">
            <h6 className="text-md font-medium text-gray-700 flex justify-start items-center gap-1">
              <OctagonX size={16} />
              Missing Skills
            </h6>
            <div className="w-full h-auto flex flex-wrap justify-start items-center gap-3 mt-2">
              {applicantQuery.data?.application?.rating_data?.missing_skills?.map(
                (skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="capitalize">
                    {skill}{" "}
                  </Badge>
                )
              )}
            </div>
          </div>

          <div className="w-full h-auto flex flex-col justify-start items-start">
            <h6 className="text-md font-medium text-gray-700 flex justify-start items-center gap-1">
              <TrendingUp size={16} />
              Experience Evaluation
            </h6>
            <div className="w-full h-auto flex flex-wrap justify-start items-center gap-3 mt-2">
              <Badge variant="outline">
                {
                  applicantQuery.data?.application?.rating_data
                    ?.experience_evaluation
                }
              </Badge>
            </div>
          </div>

          <div className="w-full h-auto flex flex-col justify-start items-start">
            <h6 className="text-md font-medium text-gray-700 flex justify-start items-center gap-1">
              <GraduationCap size={16} />
              Education Evaluation
            </h6>
            <div className="w-full h-auto flex flex-wrap justify-start items-center gap-3 mt-2">
              <Badge variant="outline">
                {
                  applicantQuery.data?.application?.rating_data
                    ?.education_evaluation
                }
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator className="w-full h-auto mt-10 mb-10" />
      {applicantQuery.isFetched && (
        <div className="w-full h-auto bg-white flex justify-center items-center">
          <div className="w-full h-auto rounded-xl border px-5 py-5 flex flex-col justify-center items-center">
            <h6 className="w-full text-md text-left font-medium text-gray-700 flex justify-start items-center gap-1 pb-5">
              <Paperclip size={16} />
              Applicant Resume
            </h6>
            <div className="w-full max-w-4xl aspect-[1/1.414] flex justify-center items-center">
              <iframe
                src={`${applicantQuery.data?.application?.cv}#toolbar=0`}
                className="w-full h-full border-none bg-white"
                title="Resume"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
