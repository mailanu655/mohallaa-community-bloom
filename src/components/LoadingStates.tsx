import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const PostCardSkeleton = () => (
  <Card className="w-full">
    <CardHeader className="space-y-2">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
      <Skeleton className="h-32 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </CardContent>
  </Card>
);

export const BusinessCardSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <div className="flex items-start space-x-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[70%]" />
      <div className="flex items-center space-x-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </CardContent>
  </Card>
);

export const MarketplaceItemSkeleton = () => (
  <Card className="w-full">
    <CardHeader className="p-0">
      <Skeleton className="h-48 w-full rounded-t-lg" />
    </CardHeader>
    <CardContent className="p-4 space-y-2">
      <Skeleton className="h-5 w-[80%]" />
      <Skeleton className="h-6 w-[60px]" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[70%]" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

export const EventCardSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <div className="space-y-2">
        <Skeleton className="h-5 w-[250px]" />
        <Skeleton className="h-4 w-[180px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-8 w-24" />
      </div>
    </CardContent>
  </Card>
);

export const CommunityCardSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
      <div className="flex items-center space-x-4 pt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </CardContent>
  </Card>
);

export const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses[size]}`} />
    </div>
  );
};

export const FullPageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);