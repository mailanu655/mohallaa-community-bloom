import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PostMediaGalleryProps {
  mediaUrls: string[];
  className?: string;
}

const PostMediaGallery: React.FC<PostMediaGalleryProps> = ({ mediaUrls, className = "" }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  if (mediaUrls.length === 1) {
    return (
      <div className={className}>
        <Dialog>
          <DialogTrigger asChild>
            <img
              src={mediaUrls[0]}
              alt="Post media"
              className="w-full max-h-96 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            />
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <img
              src={mediaUrls[0]}
              alt="Post media"
              className="w-full h-full object-contain"
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (mediaUrls.length === 2) {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {mediaUrls.map((url, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <img
                src={url}
                alt={`Post media ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              />
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <div className="relative">
                <img
                  src={mediaUrls[selectedIndex]}
                  alt="Post media"
                  className="w-full h-full object-contain"
                />
                {mediaUrls.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedIndex + 1} / {mediaUrls.length}
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    );
  }

  // 3+ images - show grid layout
  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-2">
        {mediaUrls.slice(0, 3).map((url, index) => (
          <div
            key={index}
            className={`relative ${index === 0 ? 'row-span-2' : ''}`}
          >
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer group">
                  <img
                    src={url}
                    alt={`Post media ${index + 1}`}
                    className={`w-full object-cover rounded-lg group-hover:opacity-90 transition-opacity ${
                      index === 0 ? 'h-96' : 'h-48'
                    }`}
                  />
                  {index === 2 && mediaUrls.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-semibold rounded-lg">
                      +{mediaUrls.length - 3}
                    </div>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <div className="relative">
                  <img
                    src={mediaUrls[selectedIndex]}
                    alt="Post media"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedIndex + 1} / {mediaUrls.length}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostMediaGallery;