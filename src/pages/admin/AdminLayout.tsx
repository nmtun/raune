import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true); // Trạng thái đang kiểm tra

  useEffect(() => {
    const checkAdmin = () => {
      const sessionData = localStorage.getItem("userSession");

      // Nếu chưa đăng nhập -> Login
      if (!sessionData) {
        navigate("/login");
        return;
      }

      try {
        const session = JSON.parse(sessionData);
        // Nếu đăng nhập rồi mà không phải Admin -> Home
        if (session.role !== "admin") {
          navigate("/");
          return;
        }
      } catch (e) {
        navigate("/login");
        return;
      }

      // Nếu mọi thứ OK -> Cho phép hiển thị
      setIsChecking(false);
    };

    checkAdmin();
  }, [navigate]);

  // --- CHẶN KHÔNG CHO RENDER KHI ĐANG KIỂM TRA ---
  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Đang kiểm tra quyền...
      </div>
    );
  }
  // ------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
