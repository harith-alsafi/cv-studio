"use client";
import { NavItem } from "@/lib/types";
import { FaHome } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaClock } from "react-icons/fa";

export const topItems: NavItem[] = [
  {
    label: "Home",
    link: "/home",
    icon: FaHome,
  },
  {
    label: "Tracker",
    link: "/tracker",
    icon: FaCalendarAlt,
  },
  {
    label: "Recent",
    link: "/recent",
    icon: FaClock,
  },
];

export const bottomItems: NavItem[] = [];

// export const homeLink: NavItem = {};
