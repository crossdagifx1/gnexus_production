import { useState, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
    lqip?: string; // Low Quality Image Placeholder
    sizes?: string; // Responsive sizes
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const OptimizedImage = ({
    src,
    alt,
    className,
    priority = false,
    lqip,
    sizes,
    objectFit = 'cover',
    ...props
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [imageSrc, setImageSrc] = useState<string>(lqip || '');
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });

    // Detect WebP/AVIF support
    const [supportsModernFormats, setSupportsModernFormats] = useState(false);

    useEffect(() => {
        const checkModernFormats = async () => {
            // Check WebP support
            const webpSupport = await new Promise<boolean>((resolve) => {
                const webp = new Image();
                webp.onload = webp.onerror = () => resolve(webp.height === 1);
                webp.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
            });
            setSupportsModernFormats(webpSupport);
        };
        checkModernFormats();
    }, []);

    // Generate srcset for responsive images
    const generateSrcSet = (baseSrc: string) => {
        const ext = baseSrc.split('.').pop();
        const base = baseSrc.replace(`.${ext}`, '');

        // If modern formats are supported, try WebP first
        if (supportsModernFormats) {
            return `${base}.webp 1x, ${base}@2x.webp 2x`;
        }
        return `${baseSrc} 1x, ${base}@2x.${ext} 2x`;
    };

    // Load image when visible (or immediately if priority)
    useEffect(() => {
        if (priority || isVisible) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                setImageSrc(src);
                setIsLoaded(true);
            };
            img.onerror = () => {
                setHasError(true);
                setIsLoaded(true);
            };
        }
    }, [src, priority, isVisible]);

    return (
        <div
            ref={(node) => !priority && ref(node)}
            className={cn('relative overflow-hidden bg-muted', className)}
        >
            {/* LQIP or skeleton loader */}
            {!isLoaded && !hasError && (
                <>
                    {lqip ? (
                        <img
                            src={lqip}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
                            aria-hidden="true"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse" />
                    )}
                </>
            )}

            {/* Main image */}
            {!hasError && imageSrc && (
                <img
                    src={imageSrc}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    sizes={sizes}
                    className={cn(
                        'w-full h-full transition-all duration-700',
                        isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
                        `object-${objectFit}`
                    )}
                    {...props}
                />
            )}

            {/* Error fallback with icon */}
            {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 text-muted-foreground backdrop-blur-sm">
                    <svg
                        className="w-12 h-12 mb-2 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <span className="text-sm">Failed to load image</span>
                </div>
            )}

            {/* Loading indicator */}
            {!isLoaded && !hasError && isVisible && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};
