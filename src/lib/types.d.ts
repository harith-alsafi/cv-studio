export interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  link: string;
  toolTip?: string;
}
