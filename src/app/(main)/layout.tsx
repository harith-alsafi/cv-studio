import { SidebarDesktop } from "@/components/navigation/sidebar/sidebar-desktop";
import TopBar from "@/components/navigation/topbar/topbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid h-screen w-full sm:dark:pl-[56.5px] sm:pl-[53px]">
      <SidebarDesktop />
      <div className="flex flex-col">
        <TopBar />
        <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
      </div>
    </div>
  );
}
