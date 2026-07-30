import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ClipboardList, Package, Home as HomeIcon, Users as UsersIcon } from 'lucide-react';

const adminNav = [
  { title: 'แดชบอร์ด', url: '/admin', icon: LayoutDashboard },
  { title: 'จัดการออเดอร์', url: '/admin/orders', icon: ClipboardList },
  { title: 'จัดการสินค้า', url: '/admin/products', icon: Package },
  { title: 'จัดการผู้ใช้', url: '/admin/users', icon: UsersIcon },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ผู้ดูแลระบบ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur sm:gap-3 sm:px-4">
            <SidebarTrigger />
            <h1 className="truncate text-base font-bold sm:text-lg">แดชบอร์ดผู้ดูแลระบบ</h1>
            <div className="ml-auto">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/"><HomeIcon className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">กลับหน้าหลัก</span></Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-3 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
