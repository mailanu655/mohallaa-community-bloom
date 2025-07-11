import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const CommunityCardSkeleton = () => (
  <Card className="border-0 bg-card/20 backdrop-blur-sm">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </CardContent>
  </Card>
);

export const EventCardSkeleton = () => (
  <Card className="border-0 bg-card/20 backdrop-blur-sm">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-16 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-8 w-full" />
    </CardContent>
  </Card>
);

export const PostCardSkeleton = () => (
  <Card className="border-0 bg-card/20 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const MemberCardSkeleton = () => (
  <Card className="border-0 bg-card/20 backdrop-blur-sm">
    <CardContent className="p-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardContent>
  </Card>
);