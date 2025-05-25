<<<<<<< HEAD
# Blocal - Local Marketplace Platform

A Next.js-based marketplace platform for local businesses with role-based authentication and comprehensive shop management.
=======
# BLocal - Local Marketplace

A Next.js-based online marketplace for local products with role-based authentication and MongoDB Atlas integration.
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3

## Features

- Role-based authentication (Admin, Seller, Buyer)
<<<<<<< HEAD
- Comprehensive shop management system
- Product catalog with categories and variants
- Shopping cart and wishlist functionality
- User dashboards based on roles
- Shop verification and approval system
- Rating and review system
- Order management
- Analytics and statistics
=======
- MongoDB Atlas integration for cloud database
- Beautiful and responsive UI with Tailwind CSS
- Product catalog with categories and search
- Shopping cart with animations
- Wishlist functionality
- Blog system with user-generated content
- Shop profiles and analytics
- Real-time product reviews and ratings
- Bhutanese Ngultrum (Nu.) currency support
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3

## Tech Stack

<<<<<<< HEAD
```
Admin:
- Email: admin@blocal.bt
- Password: admin123

Seller:
- Email: seller1@blocal.bt
- Password: seller123

Buyer:
- Email: buyer@blocal.bt
- Password: buyer123
```
=======
- Next.js 14
- MongoDB Atlas
- NextAuth.js for authentication
- Tailwind CSS for styling
- React Icons
- React Hot Toast for notifications
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3

## Prerequisites

- Node.js 18.x or later
- MongoDB Atlas account
- npm or yarn
- MongoDB 6.0 or later

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd blocal-app
```

2. Install dependencies:
```bash
npm install
```

<<<<<<< HEAD
3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_uri
=======
3. Create a `.env.local` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

<<<<<<< HEAD
4. Seed the database:
```bash
npm run seed
# or
yarn seed
```

5. Run the development server:
=======
4. Run the development server:
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3
```bash
npm run dev
```

<<<<<<< HEAD
6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
=======
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3

## Project Structure

```
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
<<<<<<< HEAD
│   │   │   ├── shops/     # Shop management endpoints
│   │   │   ├── products/  # Product management endpoints
│   │   │   └── auth/      # Authentication endpoints
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Dashboard pages
│   │   └── page.jsx       # Homepage
│   ├── components/        # React components
│   │   ├── home/         # Homepage components
│   │   ├── layout/       # Layout components
│   │   ├── products/     # Product-related components
│   │   └── shops/        # Shop-related components
│   ├── models/           # MongoDB models
│   ├── utils/            # Utility functions
│   └── styles/           # Global styles
├── public/               # Static files
└── package.json         # Project dependencies
=======
│   │   ├── auth/           # Authentication pages
│   │   ├── blog/           # Blog pages
│   │   ├── cart/           # Shopping cart
│   │   ├── dashboard/      # User dashboards
│   │   ├── products/       # Product pages
│   │   ├── shops/          # Shop pages
│   │   └── wishlist/       # Wishlist pages
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   ├── products/      # Product components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utility functions
│   └── models/            # MongoDB models
├── public/                # Static files
└── package.json          # Project dependencies
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3
```

## Features by Role

### Admin
<<<<<<< HEAD
- User management
- Shop verification and approval
- Analytics dashboard
- Product approval
- Category management
- System configuration

### Seller
- Shop management
  - Create and edit shop profile
  - Upload shop media
  - View shop statistics
  - Manage shop status
- Product management
  - Add/edit/delete products
  - Manage inventory
  - Set pricing and variants
- Order management
- Sales analytics
- Customer feedback

### Buyer
- Browse shops and products
- Shopping cart
- Wishlist
- Order history
- Reviews and ratings
- Shop following

## API Documentation

### Shop Management

#### GET /api/shops
- Get all shops (filtered by user role)
- Admin: All shops
- Seller: Their shop
- Buyer: Approved and active shops

#### POST /api/shops
- Create a new shop (Seller only)
- Required fields: name, description, address
- Optional fields: media, logo, coverImage

#### DELETE /api/shops
- Delete a shop (Shop owner only)
- Soft delete implementation

### Blog Management

#### GET /api/blogs
- Get all published blogs with pagination and filtering
- Query parameters:
  - `category`: Filter by category (RECIPES, FARMING, NUTRITION, SUSTAINABILITY, OTHER)
  - `tag`: Filter by tag
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `sort`: Sort order (latest, popular, mostLiked)
- Returns: List of blogs with pagination info

#### POST /api/blogs
- Create a new blog (Authenticated users only)
- Required fields:
  ```json
  {
    "title": "Blog Title",
    "content": "Blog content (min 100 characters)",
    "category": "RECIPES", // One of: RECIPES, FARMING, NUTRITION, SUSTAINABILITY, OTHER
    "media": {
      "featuredImage": "URL to featured image"
    }
  }
  ```
- Optional fields:
  ```json
  {
    "summary": "Brief summary",
    "tags": ["tag1", "tag2"],
    "media": {
      "gallery": ["URL1", "URL2"]
    },
    "status": "DRAFT", // or "PUBLISHED"
    "seo": {
      "metaTitle": "SEO title",
      "metaDescription": "SEO description",
      "keywords": ["keyword1", "keyword2"]
    }
  }
  ```

#### GET /api/blogs/[blogId]
- Get a single blog by ID
- Returns: Full blog details with author and comments

#### POST /api/blogs/[blogId]/comments
- Add a comment to a blog
- Required fields:
  ```json
  {
    "content": "Comment text"
  }
  ```

#### POST /api/blogs/[blogId]/likes
- Toggle like on a blog
- Returns: Updated like count and user's like status

### Post Management

#### GET /api/posts
- Get all posts with pagination
- Returns: List of posts with author and comment details

#### POST /api/posts
- Create a new post (Authenticated users only)
- Required fields:
  ```json
  {
    "title": "Post Title",
    "content": "Post content",
    "excerpt": "Brief excerpt",
    "imageUrl": "URL to post image"
  }
  ```

#### GET /api/posts/[postId]/comments
- Get all comments for a post
- Returns: List of comments with author details

#### POST /api/posts/[postId]/comments
- Add a comment to a post
- Required fields:
  ```json
  {
    "text": "Comment text"
  }
  ```
=======
- User and shop management
- Product approval system
- Analytics dashboard
- Blog moderation

### Seller
- Shop profile management
- Product management (CRUD)
- Sales analytics
- Shop statistics
- Blog creation

### Buyer
- Browse and search products
- Shopping cart with animations
- Wishlist management
- Product reviews
- Blog creation and interaction
- Shop browsing

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/products/*` - Product management
- `/api/shops/*` - Shop management
- `/api/cart/*` - Shopping cart operations
- `/api/wishlist/*` - Wishlist operations
- `/api/blogs/*` - Blog management
- `/api/upload/*` - File upload handling

## Models

- User - User information and authentication
- Shop - Shop profiles and management
- Product - Product listings and details
- Blog - Blog posts and interactions
- Cart - Shopping cart data
- Wishlist - User wishlist items
>>>>>>> ce08c47481366906128db17c6bd3eaf53dc5d6a3

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.


