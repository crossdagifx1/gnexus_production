import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    canonical?: string;
    noindex?: boolean;
    structuredData?: Record<string, any>;
}

const defaultSEO = {
    title: "G-Nexus | Ethiopia's Digital Operating System",
    description: "G-Squad is Ethiopia's premier digital agency blending ancient wisdom with futuristic technology. We deliver web development, 3D visualization, AI automation, and the G-Nexus platform for Ethiopian SMEs.",
    keywords: "G-Squad, Ethiopian digital agency, web development Ethiopia, 3D visualization, AI automation, G-Nexus, Addis Ababa, Habesha Futurism",
    ogImage: "https://lovable.dev/opengraph-image-p98pqg.png",
    ogType: "website",
    twitterCard: "summary_large_image" as const,
};

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    ogImage,
    ogType,
    twitterCard,
    canonical,
    noindex = false,
    structuredData,
}) => {
    const seoTitle = title ? `${title} | G-Nexus` : defaultSEO.title;
    const seoDescription = description || defaultSEO.description;
    const seoKeywords = keywords || defaultSEO.keywords;
    const seoOgImage = ogImage || defaultSEO.ogImage;
    const seoOgType = ogType || defaultSEO.ogType;
    const seoTwitterCard = twitterCard || defaultSEO.twitterCard;
    const seoCanonical = canonical || (typeof window !== 'undefined' ? window.location.href : 'https://gsquad.et');

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{seoTitle}</title>
            <meta name="title" content={seoTitle} />
            <meta name="description" content={seoDescription} />
            <meta name="keywords" content={seoKeywords} />
            <meta name="author" content="G-Squad" />

            {/* Robots */}
            {noindex && <meta name="robots" content="noindex,nofollow" />}

            {/* Canonical URL */}
            <link rel="canonical" href={seoCanonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={seoOgType} />
            <meta property="og:url" content={seoCanonical} />
            <meta property="og:title" content={seoTitle} />
            <meta property="og:description" content={seoDescription} />
            <meta property="og:image" content={seoOgImage} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:locale:alternate" content="am_ET" />
            <meta property="og:site_name" content="G-Nexus" />

            {/* Twitter */}
            <meta property="twitter:card" content={seoTwitterCard} />
            <meta property="twitter:url" content={seoCanonical} />
            <meta property="twitter:title" content={seoTitle} />
            <meta property="twitter:description" content={seoDescription} />
            <meta property="twitter:image" content={seoOgImage} />
            <meta property="twitter:site" content="@GSquadET" />

            {/* Geo Tags */}
            <meta name="geo.region" content="ET" />
            <meta name="geo.placename" content="Addis Ababa" />
            <meta name="geo.position" content="9.005401;38.763611" />
            <meta name="ICBM" content="9.005401, 38.763611" />

            {/* Language Alternates */}
            <link rel="alternate" hrefLang="en" href={seoCanonical} />
            <link rel="alternate" hrefLang="am" href={seoCanonical} />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

// Organization Schema Helper
export const getOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "G-Squad",
    "alternateName": "G-Nexus",
    "url": "https://gsquad.et",
    "logo": "https://gsquad.et/icons/icon-512x512.png",
    "description": "Ethiopia's premier digital agency specializing in web development, 3D visualization, and AI automation",
    "address": {
        "@type": "PostalAddress",
        "addressCountry": "ET",
        "addressLocality": "Addis Ababa",
    },
    "sameAs": [
        "https://twitter.com/GSquadET",
        "https://linkedin.com/company/g-squad-et",
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "info@gsquad.et"
    }
});

// Breadcrumb Schema Helper
export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url,
    })),
});

// FAQ Schema Helper
export const getFAQSchema = (faqs: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
        },
    })),
});

// Article Schema Helper
export const getArticleSchema = (article: {
    title: string;
    description: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    author: string;
}) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "author": {
        "@type": "Organization",
        "name": article.author,
    },
    "publisher": {
        "@type": "Organization",
        "name": "G-Squad",
        "logo": {
            "@type": "ImageObject",
            "url": "https://gsquad.et/icons/icon-512x512.png",
        },
    },
});
