export interface BlogPost {
  title: string;
  slug: string;
  date: string; // ISO string or Date
  excerpt: string;
  content: string; // can be empty for external posts
  url?: string;    // optional, for external posts
  author?: string;
  tags?: string[];
}
