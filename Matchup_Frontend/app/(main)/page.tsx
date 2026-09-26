import Home from "@/components/HomeClient";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
