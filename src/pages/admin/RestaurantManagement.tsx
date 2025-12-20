import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import restaurantsData from '@/data/restaurants.json';
import menusData from '@/data/menus.json';

const RestaurantManagement = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState(restaurantsData);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Logic Xóa có điều kiện
  const handleDelete = (id: number) => {
    const hasMenu = menusData.some(menu => menu.restaurantId === id); // Kiểm tra menu liên kết

    if (hasMenu) {
      // Chặn xóa và gợi ý ẩn
      if (window.confirm("Nhà hàng này đang có menu. Bạn không thể xóa hoàn toàn. Bạn có muốn chuyển sang trạng thái 'Ẩn' không?")) {
        handleToggleStatus(id, 'hidden');
      }
    } else {
      // Xóa hoàn toàn (Hard Delete)
      if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn nhà hàng này?")) {
        setRestaurants(prev => prev.filter(r => r.id !== id));
        toast.success("Đã xóa nhà hàng thành công");
      }
    }
  };

  const handleToggleStatus = (id: number, newStatus: 'active' | 'hidden') => {
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    toast.success(`Đã chuyển trạng thái sang ${newStatus}`);
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Nhà hàng</h1>
        <Button onClick={() => toast.info("Tính năng thêm mới đang phát triển")}>
          <Plus className="w-4 h-4 mr-2" /> Thêm nhà hàng
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
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
                    {res.status === 'hidden' ? 'Ẩn' : 'Công khai'}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/restaurant/${res.id}`)}>
                    <Eye className="w-4 h-4" /> Xem trước
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" /> Sửa
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(res.id)}>
                    <Trash2 className="w-4 h-4" /> Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RestaurantManagement;
