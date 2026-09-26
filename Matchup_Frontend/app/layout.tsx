import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "@/app/globals.css";
import QueryClientProviderCom from "@/providers/QueryClientProvider";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Find you job now",
  description: "For every type of job",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <QueryClientProviderCom>
          {children}
        </QueryClientProviderCom>
        <Toaster />
      </body>
    </html>
  );
}
