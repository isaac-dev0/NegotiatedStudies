import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { RepositoryProvider } from "@/context/RepositoryContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Archyve",
  description: "Visualize and explore your codebase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("dark", inter.className)}>
        <AuthProvider>
          <RepositoryProvider>
            {children}
          </RepositoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
