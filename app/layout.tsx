import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thon Studio | Graphic Hooks",
  description: "Biblioteca privada de sistemas visuais usados como graphic hooks.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark">
      <body>{children}</body>
    </html>
  );
}
