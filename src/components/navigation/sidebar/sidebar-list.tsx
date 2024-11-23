"use client";
import { NavItem } from "@/lib/types";
import SidebarItem from "@/components/navigation/sidebar/sidebar-item";
import { usePathname } from "next/navigation";

interface SideBarListProps {
  isHorizantal: boolean;
  topItems: NavItem[];
  bottomItems: NavItem[];
}

export function SideBarList({
  topItems,
  bottomItems,
  isHorizantal,
}: SideBarListProps) {
  const data = isHorizantal ? topItems.concat(bottomItems) : topItems;
  const pathname = usePathname();
  const selectedLink = "/" + pathname.split("/")[1];
  return (
    <>
      <nav
        className={`grid gap-1 p-1 dark:pr-[8px] ${isHorizantal ? "mt-2" : ""}`}
      >
        {data.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            link={item.link}
            isHorizantal={isHorizantal}
            toolTip={item.toolTip}
            isSelected={selectedLink === item.link}
          />
        ))}
      </nav>
      {!isHorizantal && (
        <nav className="mt-auto grid gap-1 p-2">
          {bottomItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              link={item.link}
              toolTip={item.toolTip}
              isSelected={selectedLink === item.link}
            />
          ))}
        </nav>
      )}
    </>
  );
}
