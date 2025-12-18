import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Store,
  LayoutDashboard,
  UtensilsCrossed,
  Star,
  UserCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AdminSidebar() {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const { t } = useLanguage();

  const [currentUser, setCurrentUser] = useState<string>("Administrator");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");

  // Kiểm tra Session
  useEffect(() => {
    const checkSession = () => {
      const sessionData = localStorage.getItem("userSession");
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          setCurrentUser(session.username || "Admin");
          setUserEmail(session.email || "");
          setUserAvatar(session.profileImage || "");
        } catch (error) {
          console.error("Session error", error);
        }
      }
    };

    checkSession();
    // Lắng nghe sự kiện login/logout để cập nhật avatar/tên ngay lập tức
    window.addEventListener("auth-change", checkSession);
    return () => window.removeEventListener("auth-change", checkSession);
  }, []);

  // Hàm Logout
  const handleLogout = () => {
    localStorage.removeItem("userSession");
    window.dispatchEvent(new Event("auth-change")); // Bắn sự kiện để app biết

    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất!",
    });
    navigate("/");
  };

  // Danh sách menu quản lý
  const menuItems = [
    {
      title: t("admin.dashboard"),
      path: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: t("admin.restaurant"),
      path: "/admin/restaurant_management",
      icon: <Store className="w-5 h-5" />,
    },
    {
      title: t("admin.dish"),
      path: "/admin/food_management",
      icon: <UtensilsCrossed className="w-5 h-5" />,
    },
    {
      title: t("admin.review"),
      path: "/admin/review_management",
      icon: <Star className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="h-screen w-64 bg-primary text-white flex flex-col border-r border-primary sticky top-0 left-0">
      {/* --- PHẦN 1: LOGO & THÔNG TIN ADMIN (TRÊN CÙNG) --- */}
      <div className="p-6 flex flex-col items-center border-b border-primary">
        <div className="mb-4 relative">
          {/* Avatar Area */}
          <div className="w-20 h-20 rounded-full border-2 border-orange-900 overflow-hidden bg-slate-800 flex items-center justify-center">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="Admin"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle className="w-12 h-12 text-slate-400" />
            )}
          </div>
        </div>

        <h3 className="font-bold text-lg text-center truncate w-full px-2">
          {currentUser}
        </h3>
        <p className="text-xs text-white flex items-center gap-1 mt-1">
          <ShieldCheck className="w-3 h-3 text-white" />
          {userEmail || "Super Admin"}
        </p>

        <div className="flex items-center mt-5">
          <LanguageSwitcher />
        </div>
      </div>

      {/* --- PHẦN 2: MENU CHỨC NĂNG (GIỮA) --- */}
      <nav className="flex-1 pb-6 pt-3 px-3 space-y-2 overflow-y-auto">
        <p className="px-2 text-xs font-semibold text-white uppercase tracking-wider mb-2">
          {t("admin.management")}
        </p>

        {menuItems.map((item, index) => {
          const isActive =
            currentLocation.pathname === item.path ||
            (item.path !== "/admin" &&
              currentLocation.pathname.startsWith(item.path));

          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-white text-primary shadow-lg shadow-primary/20"
                  : "text-white hover:bg-white hover:text-primary"
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* --- PHẦN 3: ĐĂNG XUẤT (DƯỚI CÙNG) --- */}
      <div className="p-4 border-t border-primary bg-primary">
        <Button
          variant="destructive"
          className="w-full flex items-center gap-2 justify-center bg-red-600 hover:bg-red-700 text-white"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>{t("header.logout") || "Đăng xuất"}</span>
        </Button>
      </div>
    </aside>
  );
}
