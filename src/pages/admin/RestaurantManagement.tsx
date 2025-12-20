import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import restaurantsData from '@/data/restaurants.json';
import menusData from '@/data/menus.json';
import { Restaurant } from '@/utils/restaurantUtils';

const RestaurantManagement = () => {
  const navigate = useNavigate();
  const STORAGE_KEY = 'admin_restaurants_data';

  // 1. Khởi tạo State từ LocalStorage hoặc JSON gốc
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) return JSON.parse(savedData);
    return (restaurantsData as any[]).map(r => ({ ...r, status: r.status || 'active' }));
  });

  const [searchTerm, setSearchTerm] = useState('');

  // State quản lý Dialog (Dùng chung cho cả Thêm và Sửa)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Partial<Restaurant> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Lưu vào LocalStorage mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
  }, [restaurants]);

  // Mở Dialog để THÊM MỚI
  const handleAddClick = () => {
    setIsEditMode(false);
    setEditingRestaurant({
      name: '',
      address: '',
      category: 'Vietnamese',
      status: 'active',
      tags: [],
      rating: 5.0,
      reviews: 0,
      lat: 21.0285,
      lng: 105.8542,
      photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
    });
    setIsDialogOpen(true);
  };

  // Mở Dialog để CHỈNH SỬA
  const handleEditClick = (restaurant: Restaurant) => {
    setIsEditMode(true);
    setEditingRestaurant({ ...restaurant });
    setIsDialogOpen(true);
  };

  // Xử lý LƯU (Cả Thêm và Sửa)
  const handleSave = () => {
    if (!editingRestaurant) return;

    // --- 1. Kiểm tra các trường bắt buộc ---
    const requiredFields = {
      name: "Tên nhà hàng",
      address: "Địa chỉ",
      category: "Danh mục",
      photo: "Link ảnh"
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!editingRestaurant[field as keyof Restaurant]?.toString().trim()) {
        toast.error(`Trường '${label}' là bắt buộc.`);
        return;
      }
    }
    // 2. Kiểm tra định dạng ảnh (Cập nhật để chấp nhận Unsplash)
    const photoUrl = editingRestaurant.photo || '';
    const isUnsplash = photoUrl.includes('images.unsplash.com');
    const hasValidExtension = /\.(jpg|jpeg|png|webp|avif|svg)/i.test(photoUrl.split('?')[0]);

    if (!isUnsplash && !hasValidExtension) {
      toast.error("Định dạng ảnh không hợp lệ. Vui lòng sử dụng link ảnh (.jpg, .png, .webp) hoặc link từ Unsplash.");
      return;
    }



    // --- 3. Kiểm tra trùng lặp (Tên + Địa chỉ) ---
    const isDuplicate = restaurants.some(r =>
      r.id !== editingRestaurant.id && // Không tự kiểm tra chính mình khi sửa
      r.name.toLowerCase().trim() === editingRestaurant.name?.toLowerCase().trim() &&
      r.address.toLowerCase().trim() === editingRestaurant.address?.toLowerCase().trim()
    );

    if (isDuplicate) {
      toast.error("Nhà hàng với tên và địa chỉ này đã tồn tại trong hệ thống.");
      return;
    }

    // --- 4. Thực hiện Lưu ---
    if (isEditMode && editingRestaurant.id) {
      // Logic Cập nhật
      setRestaurants(prev => prev.map(r => r.id === editingRestaurant.id ? (editingRestaurant as Restaurant) : r));
      toast.success("Cập nhật nhà hàng thành công");
    } else {
      // Logic Thêm mới
      const newId = restaurants.length > 0 ? Math.max(...restaurants.map(r => r.id)) + 1 : 1;
      const newRestaurant = {
        ...editingRestaurant,
        id: newId,
        rating: 5.0, // Giá trị mặc định cho nhà hàng mới
        reviews: 0   // Giá trị mặc định
      } as Restaurant;
      setRestaurants(prev => [newRestaurant, ...prev]);
      toast.success("Thêm nhà hàng mới thành công");
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    const hasMenu = menusData.some(menu => menu.restaurantId === id);
    if (hasMenu) {
      if (window.confirm("Nhà hàng này có menu. Bạn có muốn chuyển sang trạng thái 'Ẩn' không?")) {
        setRestaurants(prev => prev.map(r => r.id === id ? { ...r, status: 'hidden' } : r));
      }
    } else {
      if (window.confirm("Xóa vĩnh viễn nhà hàng này?")) {
        setRestaurants(prev => prev.filter(r => r.id !== id));
        toast.success("Đã xóa thành công");
      }
    }
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Nhà hàng</h1>
        <Button onClick={handleAddClick}>
          <Plus className="w-4 h-4 mr-2" /> Thêm nhà hàng
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Tên nhà hàng</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRestaurants.map((res) => (
              <TableRow key={res.id}>
                <TableCell className="font-medium">{res.name}</TableCell>
                <TableCell>{res.category}</TableCell>
                <TableCell>
                  <Badge variant={res.status === 'hidden' ? 'destructive' : 'default'}>
                    {res.status === 'hidden' ? 'HIDDEN' : 'ACTIVE'}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/restaurant/${res.id}`)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(res)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(res.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Form: Dùng cho cả Thêm và Sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Sửa thông tin' : 'Thêm nhà hàng mới'}</DialogTitle>
          </DialogHeader>

          {editingRestaurant && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Tên</Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={editingRestaurant.name}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Địa chỉ</Label>
                <Input
                  id="address"
                  className="col-span-3"
                  value={editingRestaurant.address}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Danh mục</Label>
                <select
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editingRestaurant.category}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, category: e.target.value })}
                >
                  <option value="Vietnamese">Vietnamese</option>
                  <option value="Asian">Asian</option>
                  <option value="Western">Western</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Fast Food">Fast Food</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="photo" className="text-right">Link ảnh</Label>
                <Input
                  id="photo"
                  className="col-span-3"
                  value={editingRestaurant.photo}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, photo: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantManagement;
