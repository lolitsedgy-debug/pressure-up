import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pressure Up Exterior Cleaning",
  description: "Fast photo-based exterior cleaning estimates and scheduling.",
  icons: {
    icon: "/legacy/app-icon.svg",
    shortcut: "/legacy/app-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
