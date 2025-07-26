// blogPosts.ts

export interface BlogPostType {
  slug: string;        // Unique URL-friendly identifier
  title: string;
  date: string;        // ISO format
  excerpt: string;
  url: string;         // External reference
  content: string;     // Full blog content
}

export const blogPosts: BlogPostType[] = [
  {
    slug: 'ai-reshaping-software-development',
    title: 'How AI Is Reshaping Software Development',
    date: '2025-07-25',
    excerpt:
      'Discover how AI-driven software development is transforming the tech industry, boosting productivity, and reshaping talent recruitment.',
    url: 'https://beon.tech/blog/ai-driven-software-development',
    content: `
AI is fundamentally changing how software is designed and delivered.

Developers now leverage AI-powered tools to automate repetitive tasks, generate boilerplate code, and even help debug issues in real-time.

Companies adopting AI workflows are seeing increases in both productivity and code quality, as well as reduced time to market.

As AI continues to evolve, the role of software engineers is expected to shift — focusing more on architecture, strategy, and creative problem-solving than ever before.
    `,
  },
  {
    slug: 'web3-transforming-small-business',
    title: 'How Web3 Will Transform Small Business',
    date: '2022-10-21',
    excerpt:
      'Web3 may seem new, but here are five ways it can transform business with blockchain, data control, and community ownership.',
    url: 'https://www.entrepreneur.com/science-technology/how-web3-will-transform-small-business/436351',
    content: `
Web3 introduces a decentralized internet model where small businesses can thrive.

Through blockchain technology, companies can offer transparent and secure transactions without relying on middlemen.

Ownership and data control shift from large corporations to individual users and creators, leveling the playing field.

Community-driven models also allow small businesses to build loyal followings through token-based incentives and DAO governance structures.
    `,
  },
];
