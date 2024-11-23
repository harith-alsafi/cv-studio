import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";
import TopBar from "@/components/navigation/topbar/topbar";
import { SidebarDesktop } from "@/components/navigation/sidebar/sidebar-desktop";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL(`https://${process.env.VERCEL_URL}`),
  title: {
    default: "Vega IoT Chatbot",
    template: `%s - IoT Chatbot`,
  },
  description: "An AI-powered IoT chatbot to talk with IoT devices",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased")}>
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            {children}
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
