import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";
import RiderLayout from "@/layouts/RiderLayout";
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Checkout from "@/pages/Checkout";
import Tracking from "@/pages/Tracking";
import Orders from "@/pages/Orders";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/admin/Dashboard";
import AdminOrders from "@/pages/admin/Orders";
import Products from "@/pages/admin/Products";
import Users from "@/pages/admin/Users";
import Deliveries from "@/pages/rider/Deliveries";
import NotFound from "@/pages/NotFound";
import OAuthConsent from "@/pages/OAuthConsent";

const queryClient = new QueryClient();

const StaffGuard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isStaff, loading } = useRole();
  if (authLoading || loading) return <div className="p-8 text-center text-muted-foreground">กำลังโหลด...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStaff) return <Navigate to="/" replace />;
  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/tracking" element={<Tracking />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
              <Route element={<StaffGuard />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="products" element={<Products />} />
                  <Route path="users" element={<Users />} />
                </Route>
              </Route>
              <Route path="/rider" element={<RiderLayout />}>
                <Route index element={<Deliveries />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
