import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "AI DSA Learning Platform",
  description: "Learn Data Structures & Algorithms with AI guidance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* Added the global dark background color here to prevent white flashing */}
        <body className="antialiased bg-[#05050A] text-white"> 
          <AuthProvider>
            
            <Navigation />
            
            {/* Removed mt-16 so your beautiful gradients go edge-to-edge under the transparent navbar! */}
            <main className="min-h-screen mt-12">
              {children}
            </main>

          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}