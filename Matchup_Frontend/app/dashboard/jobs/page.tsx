import { ActiveJobsTable } from "@/components/ActiveJobsTable";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

export default function ActiveJobs() {
  return (
    <Suspense>
      <section className="w-full h-auto px-5">
        <div className="w-full flex justify-between items-center">
          <div className="w-auto h-auto">
            <h1 className="text-lg font-medium text-black">
              Active Job Openings
            </h1>
            <p className="text-xs text-[#b0b0b0]">
              View and manage all currently open positions within your
              organization.
            </p>
          </div>
        </div>
        <Separator className="w-full mt-5 mb-5" />
        <div className="w-full h-auto">
          <ActiveJobsTable />
        </div>
      </section>
    </Suspense>
  );
}
