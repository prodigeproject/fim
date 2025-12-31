import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const defaultSEO = {
  title: "Forum Indonesia Muda",
  description: "Wadah bagi pemuda Indonesia untuk bertumbuh, berkolaborasi, dan menjadi cahaya kunang-kunang yang menerangi masa depan bangsa. Organisasi kaderisasi pemuda sejak 2003.",
  image: "/og-image.png",
  url: "",
  type: "website",
};

export function SEO({
  title,
  description = defaultSEO.description,
  image = defaultSEO.image,
  url = defaultSEO.url,
  type = defaultSEO.type,
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | Forum Indonesia Muda` 
    : defaultSEO.title;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
