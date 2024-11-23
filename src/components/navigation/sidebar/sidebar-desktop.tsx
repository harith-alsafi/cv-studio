import { SideBarList } from "@/components/navigation/sidebar/sidebar-list";
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Link from "next/link";
import {
  Bird,
  Book,
  Bot,
  Code2,
  CornerDownLeft,
  LifeBuoy,
  Mic,
  Paperclip,
  Rabbit,
  Settings,
  Settings2,
  Share,
  SquareTerminal,
  SquareUser,
  Triangle,
  Turtle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavItem } from "@/lib/types";
import { bottomItems, topItems } from "@/lib/constants";
import { usePathname } from "next/navigation";

export interface SidebarDesktopProps {
  topItems: NavItem[];
  bottomItems: NavItem[];
  homeLink: NavItem;
  selectedLink: string;
}

export function SidebarDesktop() {
  return (
    <aside className="inset-y-0 fixed  left-0 z-10 hidden sm:flex h-full flex-col border-r">
      <div className="border-b p-2">
        <Button variant="outline" size="icon" aria-label="Home">
          <Triangle className="size-5 fill-foreground" />
        </Button>
      </div>
      <SideBarList
        bottomItems={bottomItems}
        topItems={topItems}
        isHorizantal={false}
      />
    </aside>
  );
}
