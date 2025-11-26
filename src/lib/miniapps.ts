import React from 'react';

export type MiniApp = {
  // --- Core Identifiers ---
  id: string;                 // The unique ID of the app (e.g., 'app-11')
  name: string;               // The display name of the app (e.g., 'Pixel Art Studio')
  description: string;        // A short, one-line description.

  // --- Display & Branding ---
  icon: string;               // String name from API (e.g., 'Palette'); map to component in rendering
  backgroundColor?: string;   // A Tailwind CSS class for the background gradient (e.g., 'bg-gradient-to-br from-orange-400 to-red-500').
  iconBackgroundColor?: string; // A Tailwind CSS class for the icon's background.

  // --- Metadata & Categorization ---
  category?: string;          // The primary category (e.g., 'Creative').
  tags?: string[];            // An array of tags for searching and filtering (e.g., ['#Creative', "Editor's Choice"]).
  
  // --- App Store Details ---
  launchUrl?: string;         // The URL to open when the app is launched.
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