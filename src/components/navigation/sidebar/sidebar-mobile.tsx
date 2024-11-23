import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { SideBarList } from "@/components/navigation/sidebar/sidebar-list";
import { bottomItems, topItems } from "@/lib/constants";
import { usePathname } from "next/navigation";

export function SidebarMobile() {
  return (
    <div className="sm:hidden">
    <Sheet >
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" >
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <SideBarList
          bottomItems={bottomItems}
          topItems={topItems}
          isHorizantal={true}
        />
      </SheetContent>
    </Sheet>
    </div>
  );
}
