import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavItem } from "@/lib/types";
import Link from "next/link";
import React from "react";

export interface SidebarItemProps extends NavItem {
  onClick?: () => void;
  isSelected?: boolean;
  isHorizantal?: boolean;
}

export default function SidebarItem({
  icon: Icon,
  link,
  label,
  toolTip,
  onClick,
  isSelected,
  isHorizantal,
}: SidebarItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={link}
          onClick={onClick}
          className={`flex ${
            isHorizantal ? "flex-row  items-center" : "flex-col items-center text-center align-middle justify-center "
          }  w-full rounded-lg h-fit whitespace-nowrap text-sm font-medium transition-colors  p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
            isSelected
              ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
          aria-label={label}
        >
          <Icon className={`${isHorizantal ? "size-7 mr-2" : "size-8"}  `} />
          <p
            className={` ${
              isHorizantal ? "text-[15px] mr-1 text-start" : "text-center text-[11px]"
            }`}
          >
            {label}
          </p>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={5}>
        {toolTip ?? label}
      </TooltipContent>
    </Tooltip>
  );
}
