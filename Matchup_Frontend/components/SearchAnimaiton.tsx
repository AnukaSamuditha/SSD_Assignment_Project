"use client";

import Lottie from "lottie-react";
import SearchingAnimation from "@/images/searching_animation.json";

export default function SearchAnimation() {
  return (
    <div className="w-[8rem] h-[8rem] absolute -left-22">
      <Lottie
        animationData={SearchingAnimation}
        loop={true}
        className="w-full h-full"
      />
    </div>
  );
}
