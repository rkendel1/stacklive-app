
export type MiniApp = {
  // --- Core Identifiers ---
  id: string;                 // The unique ID of the app (e.g., 'app-11')
  name: string;               // The display name of the app (e.g., 'Pixel Art Studio')
  description: string;        // A short, one-line description.

  // --- Display & Branding ---
  icon: string;               // String name from API (e.g., 'Palette'); map to component in rendering
  iconType?: string;          // Type of icon (e.g., 'lucide')
  iconUrl?: string | null;    // Direct URL to icon if provided
  backgroundColor?: string;   // A Tailwind CSS class for the background gradient (e.g., 'bg-gradient-to-br from-orange-400 to-red-500').
  iconBackgroundColor?: string; // A Tailwind CSS class for the icon's background.

  // --- Metadata & Categorization ---
  categories?: string[];      // Array of categories (e.g., ['Creative', 'Tools']).
  tags?: string[];            // An array of tags for searching and filtering (e.g., ['#Creative', "Editor's Choice"]).
  
  // --- Creator Info ---
  creator?: {
    id: string;
    email: string;
  };
  
  // --- App Store Details ---
  deploymentUrl?: string;     // The base deployment URL for the app (used to derive launchUrl).
  launchUrl?: string;         // The derived launch URL (automatically created from deploymentUrl + ?webview=true).
  rating?: number;            // The average user rating (e.g., 4.8).
  reviews?: string;           // The total number of reviews as a string (e.g., '12K').
  longDescription?: string;   // The detailed description for the app's detail page.
  screenshots?: string[];     // An array of URLs for the app's screenshots.
  
  // --- Detailed Features & Reviews (for the app detail page) ---
  features?: {
    icon: string;             // String name from API (e.g., 'Zap')
    title: string;
    description: string;
  }[];
  
  ratingsAndReviews?: {
    totalReviews: string;
    averageRating: number;
    reviews: {
      avatar: string;
      name: string;
      rating: number;
      comment: string;
    }[];
  };
};