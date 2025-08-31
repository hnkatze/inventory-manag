import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"
import "../styles/custom.css"
import "../styles/scroll-fix.css"

export const metadata: Metadata = {
  title: "Gestor de Inventario | Sistema Empresarial",
  description: "Sistema profesional de gestión de inventario. Administra productos, controla stock, exporta reportes y mantén el control total de tu inventario empresarial.",
  keywords: "inventario, gestión, stock, productos, administración, sistema empresarial, control de inventario",
  authors: [{ name: "Inventory Manager" }],
  creator: "Inventory Manager System",
  publisher: "Inventory Manager",
  robots: "index, follow",
  openGraph: {
    title: "Gestor de Inventario Empresarial",
    description: "Sistema completo para la gestión profesional de inventario",
    type: "website",
    locale: "es_ES",
    siteName: "Gestor de Inventario",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gestor de Inventario | Sistema Empresarial",
    description: "Administra tu inventario de manera eficiente y profesional",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          {children}
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
