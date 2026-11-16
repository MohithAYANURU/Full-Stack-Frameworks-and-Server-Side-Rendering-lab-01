import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { NavLink } from "@/components/nav-link";
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
  title: {
    default: "Movie Night",
    template: "%s | Movie Night",
  },
  description: "Pick the movie for our next movie night",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between p-4">
            <Link href="/" className="font-bold">
              Movie Night
            </Link>
            <nav className="flex gap-4">
              <NavLink href="/movies">Movies</NavLink>
              <NavLink href="/about">About</NavLink>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
