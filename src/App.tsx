import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Survey from "./pages/Survey";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import RestaurantDetail from "./pages/RestaurantDetail";
import MyReviews from "./pages/MyReviews";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { initializeAccounts } from "./utils/profileUtils";
import "./i18n";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FoodManagement from "./pages/admin/FoodManagement";
import ReviewManagement from "./pages/admin/ReviewManagement";
import RestaurantManagement from "./pages/admin/RestaurantManagement";

// Khởi tạo accounts từ JSON vào localStorage khi app khởi động
initializeAccounts();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true, // Wrap state updates trong React.startTransition
          v7_relativeSplatPath: true, // Opt-in cho v7 relative splat path resolution
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/my-reviews" element={<MyReviews />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="review_management" element={<ReviewManagement />} />
            <Route path="food_management" element={<FoodManagement />} />
            <Route
              path="restaurant_management"
              element={<RestaurantManagement />}
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
