
export interface VillaPhoto {
  id: string;
  url: string;
  caption: string;
  description: string;
}

export interface PhotoSubSection {
  id: string;
  title: string;
  photos: VillaPhoto[];
}

export interface PhotoSection {
  id: string;
  title: string;
  subSections: PhotoSubSection[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface LocationContent {
  title: string;
  description: string;
  imageUrl: string;
}

export interface TextContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  aboutTitle: string;
  aboutText: string;
  featuresTitle: string;
  features: { id: string; name: string; detail: string }[];
  considerationsTitle: string;
  considerationsText: string;
}

export interface VillaContent {
  logoUrl?: string;
  faviconUrl?: string;
  // Legacy flat list for backward compatibility/migration
  photos?: VillaPhoto[]; 
  // New hierarchical structure
  gallerySections: PhotoSection[];
  faqs: FAQ[];
  location: LocationContent;
  textContent: TextContent;
}
