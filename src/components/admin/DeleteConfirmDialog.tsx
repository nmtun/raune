import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/hooks/useLanguage";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  itemName: string;
  itemType?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  itemName,
  itemType = "món ăn",
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("admin.deleteDishConfirmTitle") || "Xác nhận xóa"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("admin.deleteDishConfirmMessage") || "Bạn có chắc chắn muốn xóa"} 
            {t("admin.deleteDishConfirmWarning") || "Hành động này không thể hoàn tác!"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("profile.cancel") || "Hủy"}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {t("review.confirmDelete") || "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
