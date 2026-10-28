import type { ComponentProps } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from './ui/sidebar';

const navItems = [
  {
    title: 'Home',
    url: '/home',
    icon: Home,
  },
];

const AppSidebar = ({ ...props }: ComponentProps<typeof Sidebar>) => {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};

export { AppSidebar };
