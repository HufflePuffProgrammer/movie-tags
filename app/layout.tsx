import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { CategoriesProvider } from "@/contexts/categories-context";
import { TagsProvider } from "@/contexts/tags-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineFind - Personalized Movie Search & Tagging",
  description: "Discover, search, and personalize your movie collection with tags, categories, and notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CategoriesProvider>
            <TagsProvider>
              {children}
            </TagsProvider>
          </CategoriesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
