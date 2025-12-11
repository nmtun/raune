import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/useLanguage';
import { Star, Pencil, Trash2, MessageSquare, Search, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import reviewsData from '@/data/reviews.json';
import menusData from '@/data/menus.json';
import { getCurrentAccountFromSession, getAllAccounts } from '@/utils/profileUtils';

interface Review {
  id: number;
  userId: number;
  type: 'restaurant' | 'dish';
  targetId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string | null;
  isEdited: boolean;
}

interface ReviewSectionProps {
  restaurantId: number;
  restaurantName: string;
}

const RATING_LABELS = {
  vi: ['Rất tệ', 'Không ngon', 'Bình thường', 'Ngon', 'Rất ngon'],
  ja: ['最悪', '美味しくない', '普通', '美味しい', 'とても美味しい'],
};

export function ReviewSection({ restaurantId, restaurantName }: ReviewSectionProps) {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviewType, setReviewType] = useState<'restaurant' | 'dish'>('restaurant');
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dishSearchQuery, setDishSearchQuery] = useState('');

  // Get current user from session
  const session = getCurrentAccountFromSession();
  const currentUserId = session?.userId || 1;

  // Get restaurant dishes (recalculated on each render when restaurantId changes)
  const restaurantDishes = menusData.filter((m) => m.restaurantId === restaurantId);

  // Get user info from localStorage by userId
  const getUserInfo = (userId: number) => {
    const allAccounts = getAllAccounts();
    const account = allAccounts.find((acc) => acc.id === userId);
    if (account) {
      return {
        username: account.username || `User ${userId}`,
        profileImage: account.profileImage || `/profile-image/avt1.jpg`,
      };
    }
    // Fallback nếu không tìm thấy
    return {
      username: `User ${userId}`,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    };
  };

  // Load reviews from localStorage or JSON
  useEffect(() => {
    
    // Try to load from localStorage first
    const savedReviews = localStorage.getItem('reviews');
    let allReviews: Review[] = [];
    
    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews);
        // Merge với dữ liệu từ JSON để đảm bảo có đầy đủ reviews
        // Tạo map từ JSON để merge
        const jsonReviewsMap = new Map((reviewsData as Review[]).map(r => [r.id, r]));
        const savedReviewsMap = new Map(parsedReviews.map((r: Review) => [r.id, r]));
        
        // Merge: ưu tiên reviews từ localStorage (có thể đã được edit), nhưng thêm reviews mới từ JSON
        const mergedReviews = new Map();
        
        // Thêm tất cả reviews từ localStorage (đã được edit)
        savedReviewsMap.forEach((review, id) => {
          mergedReviews.set(id, review);
        });
        
        // Thêm reviews từ JSON nếu chưa có trong localStorage
        jsonReviewsMap.forEach((review, id) => {
          if (!mergedReviews.has(id)) {
            mergedReviews.set(id, review);
          }
        });
        
        allReviews = Array.from(mergedReviews.values());
      } catch (error) {
        console.error('Error parsing saved reviews:', error);
        allReviews = reviewsData as Review[];
      }
    } else {
      // First time, load from JSON file
      allReviews = reviewsData as Review[];
      localStorage.setItem('reviews', JSON.stringify(allReviews));
    }
    
    // Filter reviews for this restaurant
    const restaurantReviews = allReviews.filter(
      (r) => r.type === 'restaurant' && r.targetId === restaurantId
    );
    const dishReviews = allReviews.filter(
      (r) => r.type === 'dish' && restaurantDishes.some((d) => d.id === r.targetId)
    );
    setReviews([...restaurantReviews, ...dishReviews]);
  }, [restaurantId, restaurantDishes]);

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    if (reviews.length > 0) {
      // Get all reviews from localStorage
      const savedReviews = localStorage.getItem('reviews');
      let allReviews: Review[] = [];
      
      if (savedReviews) {
        try {
          allReviews = JSON.parse(savedReviews);
        } catch (error) {
          allReviews = reviewsData as Review[];
        }
      } else {
        allReviews = reviewsData as Review[];
      }
      
      // Remove old reviews for this restaurant
      allReviews = allReviews.filter(
        (r) => !(
          (r.type === 'restaurant' && r.targetId === restaurantId) ||
          (r.type === 'dish' && restaurantDishes.some((d) => d.id === r.targetId))
        )
      );
      
      // Add current reviews
      allReviews = [...allReviews, ...reviews];
      
      // Save back to localStorage
      localStorage.setItem('reviews', JSON.stringify(allReviews));
    }
  }, [reviews, restaurantId, restaurantDishes]);

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((review) => {
      if (filterRating === 'all') return true;
      if (filterRating === '5') return review.rating === 5;
      if (filterRating === 'low') return review.rating <= 2;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Check if user already reviewed
  const hasReviewedRestaurant = reviews.some(
    (r) => r.userId === currentUserId && r.type === 'restaurant' && r.targetId === restaurantId
  );

  const hasReviewedDish = (dishId: number) => {
    return reviews.some(
      (r) => r.userId === currentUserId && r.type === 'dish' && r.targetId === dishId
    );
  };

  // Get dish name
  const getDishName = (dishId: number) => {
    const dish = menusData.find((m) => m.id === dishId);
    if (!dish) return '';
    if (typeof dish.name === 'string') return dish.name;
    return dish.name[language as keyof typeof dish.name] || dish.name.vi;
  };

  // Open create dialog
  const handleOpenCreateDialog = (type?: 'restaurant' | 'dish', dishId?: number) => {
    setReviewType(type || 'restaurant');
    setSelectedDishId(dishId || null);
    setSelectedReview(null);
    setRating(0);
    setComment('');
    setDishSearchQuery('');
    setIsDialogOpen(true);
  };

  // Handle dish selection in dialog
  const handleSelectDish = (dishId: number) => {
    if (hasReviewedDish(dishId)) {
      toast.error(t('review.alreadyReviewed'));
      return;
    }
    setSelectedDishId(dishId);
  };

  // Open edit dialog
  const handleOpenEditDialog = (review: Review) => {
    setSelectedReview(review);
    setReviewType(review.type);
    setSelectedDishId(review.type === 'dish' ? review.targetId : null);
    setRating(review.rating);
    setComment(review.comment);
    setIsDialogOpen(true);
  };

  // Submit review
  const handleSubmit = () => {
    if (rating === 0) {
      toast.error(t('review.pleaseSelectRating'));
      return;
    }
    if (!comment.trim()) {
      toast.error(t('review.pleaseEnterComment'));
      return;
    }
    if (comment.length > 300) {
      toast.error(t('review.commentTooLong'));
      return;
    }

    // Validation for new review
    if (!selectedReview) {
      if (reviewType === 'restaurant' && hasReviewedRestaurant) {
        toast.error(t('review.alreadyReviewed'));
        return;
      }
      if (reviewType === 'dish' && !selectedDishId) {
        toast.error(t('review.pleaseSelectDish'));
        return;
      }
      if (reviewType === 'dish' && selectedDishId && hasReviewedDish(selectedDishId)) {
        toast.error(t('review.alreadyReviewed'));
        return;
      }
    }

    if (selectedReview) {
      // Update
      const updatedReviews = reviews.map((r) =>
        r.id === selectedReview.id
          ? {
              ...r,
              rating,
              comment,
              updatedAt: new Date().toISOString(),
              isEdited: true,
            }
          : r
      );
      setReviews(updatedReviews);
      toast.success(t('review.updateSuccess'));
    } else {
      // Create
      const newReview: Review = {
        id: Math.max(...reviews.map((r) => r.id), 0) + 1,
        userId: currentUserId,
        type: reviewType,
        targetId: reviewType === 'restaurant' ? restaurantId : selectedDishId!,
        rating,
        comment,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        isEdited: false,
      };
      setReviews([newReview, ...reviews]);
      toast.success(t('review.createSuccess'));
    }

    setIsDialogOpen(false);
    resetForm();
  };

  // Delete review
  const handleDelete = () => {
    if (selectedReview) {
      setReviews(reviews.filter((r) => r.id !== selectedReview.id));
      toast.success(t('review.deleteSuccess'));
      setIsDeleteDialogOpen(false);
      setSelectedReview(null);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setSelectedReview(null);
    setReviewType('restaurant');
    setSelectedDishId(null);
    setDishSearchQuery('');
  };

  // Filter dishes by search query
  const filteredDishes = restaurantDishes.filter((dish) => {
    const dishName = getDishName(dish.id).toLowerCase();
    return dishName.includes(dishSearchQuery.toLowerCase());
  });

  // Calculate statistics for restaurant and dishes separately
  const restaurantReviews = reviews.filter((r) => r.type === 'restaurant');
  const dishReviews = reviews.filter((r) => r.type === 'dish');

  const calculateStats = (reviewList: Review[]) => {
    if (reviewList.length === 0) return { average: '0.0', distribution: {} };
    
    const average = (reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length).toFixed(1);
    const distribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviewList.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });
    
    return { average, distribution };
  };

  const restaurantStats = calculateStats(restaurantReviews);
  const dishStats = calculateStats(dishReviews);

  const renderSummaryCard = (
    title: string,
    stats: { average: string; distribution: { [key: number]: number } },
    totalReviews: number,
    type: 'restaurant' | 'dish'
  ) => (
    <div className="bg-muted/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-foreground mb-4 text-center">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-foreground mb-2">{stats.average}</div>
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(parseFloat(stats.average))
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {totalReviews} {t('review.reviews')}
          </div>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.distribution[stars] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm text-foreground w-8">{stars}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary flex items-center">
            <MessageSquare className="w-6 h-6 mr-2" />
            {t('review.title')}
          </h2>
        </div>

        {/* Summary - Restaurant and Dishes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {renderSummaryCard(
            t('review.restaurantReviews'),
            restaurantStats,
            restaurantReviews.length,
            'restaurant'
          )}
          {renderSummaryCard(
            t('review.dishReviews'),
            dishStats,
            dishReviews.length,
            'dish'
          )}
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <Button
            onClick={() => handleOpenCreateDialog()}
            className="w-full sm:w-auto"
            size="lg"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            {t('review.writeReview')}
          </Button>
        </div>

        {/* Filter and Sort */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('review.allReviews')}</SelectItem>
              <SelectItem value="5">{t('review.fiveStars')}</SelectItem>
              <SelectItem value="low">{t('review.lowRatings')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('review.newest')}</SelectItem>
              <SelectItem value="oldest">{t('review.oldest')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('review.noReviews')}
            </div>
          ) : (
            filteredReviews.map((review) => {
              const isOwner = review.userId === currentUserId;
              const targetName =
                review.type === 'restaurant' ? restaurantName : getDishName(review.targetId);
              const userInfo = getUserInfo(review.userId);

              return (
                <div
                  key={review.id}
                  className="bg-primary/5 border border-primary/20 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={userInfo.profileImage}
                      alt={userInfo.username}
                      className="w-12 h-12 rounded-full border-2 border-background object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-bold text-foreground">
                            {isOwner ? (session?.username || t('review.you')) : userInfo.username}
                          </span>
                          {review.isEdited && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({t('review.edited')})
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString(
                            language === 'ja' ? 'ja-JP' : 'vi-VN'
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                          {review.type === 'restaurant'
                            ? t('review.restaurant')
                            : `${t('review.dish')}: ${targetName}`}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {selectedReview ? t('review.editReview') : t('review.writeReview')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReview ? (
            // Edit mode - show existing review type
            <div className="space-y-4 overflow-y-auto">
              <div className="text-sm text-muted-foreground">
                {reviewType === 'restaurant'
                  ? `${t('review.restaurant')}: ${restaurantName}`
                  : `${t('review.dish')}: ${selectedDishId ? getDishName(selectedDishId) : ''}`}
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('review.rating')}</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="h-5 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {(hoverRating || rating) > 0 
                      ? RATING_LABELS[language as keyof typeof RATING_LABELS][(hoverRating || rating) - 1]
                      : '\u00A0'}
                  </p>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('review.comment')}</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('review.commentPlaceholder')}
                  maxLength={300}
                  rows={4}
                  className="focus-visible:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/300 {t('review.characters')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('review.cancel')}
                </Button>
                <Button onClick={handleSubmit}>{t('review.submit')}</Button>
              </div>
            </div>
          ) : (
            // Create mode - show tabs
            <Tabs value={reviewType} onValueChange={(v: any) => setReviewType(v)} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="restaurant" 
                  disabled={hasReviewedRestaurant}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {t('review.restaurant')}
                  {hasReviewedRestaurant && <span className="ml-1 text-green-500">✓</span>}
                </TabsTrigger>
                <TabsTrigger 
                  value="dish"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {t('review.dish')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="restaurant" className="flex-1 space-y-4 overflow-y-auto mt-4">
                <div className="text-sm text-muted-foreground">
                  {t('review.restaurant')}: {restaurantName}
                </div>

                {/* Rating */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('review.rating')}</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="h-5 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {(hoverRating || rating) > 0 
                        ? RATING_LABELS[language as keyof typeof RATING_LABELS][(hoverRating || rating) - 1]
                        : '\u00A0'}
                    </p>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('review.comment')}</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('review.commentPlaceholder')}
                    maxLength={300}
                    rows={4}
                    className="focus-visible:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {comment.length}/300 {t('review.characters')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t('review.cancel')}
                  </Button>
                  <Button onClick={handleSubmit}>{t('review.submit')}</Button>
                </div>
              </TabsContent>

              <TabsContent value="dish" className="flex-1 flex flex-col overflow-hidden mt-4">
                <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={dishSearchQuery}
                      onChange={(e) => setDishSearchQuery(e.target.value)}
                      placeholder={t('review.searchDish')}
                      className="pl-9 focus-visible:ring-primary"
                    />
                  </div>

                  {/* Dish Selection */}
                  <div className="flex-1 overflow-hidden">
                    <label className="text-sm font-medium mb-2 block">{t('review.selectDish')}</label>
                    <ScrollArea className="h-[280px] border rounded-lg p-2">
                      <div className="grid grid-cols-4 gap-2">
                        {filteredDishes.map((dish) => {
                          const isSelected = selectedDishId === dish.id;
                          const alreadyReviewed = hasReviewedDish(dish.id);
                          return (
                            <button
                              key={dish.id}
                              onClick={() => handleSelectDish(dish.id)}
                              disabled={alreadyReviewed}
                              className={`flex flex-col items-center p-1.5 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/10'
                                  : alreadyReviewed
                                  ? 'border-muted bg-muted/50 opacity-50 cursor-not-allowed'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="w-full aspect-square mb-1 overflow-hidden rounded-md">
                                <img
                                  src={dish.photo}
                                  alt={getDishName(dish.id)}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-[10px] text-center line-clamp-2 leading-tight">
                                {getDishName(dish.id)}
                              </span>
                              {alreadyReviewed && (
                                <Badge variant="secondary" className="mt-0.5 text-[9px] py-0 px-1 h-4">
                                  ✓
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  {selectedDishId && (
                    <>
                      {/* Rating */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('review.rating')}</label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= (hoverRating || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <div className="h-5 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {(hoverRating || rating) > 0 
                              ? RATING_LABELS[language as keyof typeof RATING_LABELS][(hoverRating || rating) - 1]
                              : '\u00A0'}
                          </p>
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('review.comment')}</label>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder={t('review.commentPlaceholder')}
                          maxLength={300}
                          rows={3}
                          className="focus-visible:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {comment.length}/300 {t('review.characters')}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      {t('review.cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={!selectedDishId}>
                      {t('review.submit')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('review.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('review.deleteConfirmMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('review.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('review.confirmDelete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

