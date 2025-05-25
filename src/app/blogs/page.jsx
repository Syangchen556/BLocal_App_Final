import BlogList from '@/components/blogs/BlogList';

export const metadata = {
  title: 'Blogs | Blocal',
  description: 'Read the latest blogs from our community',
};

export default function BlogsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Blogs</h1>
      <BlogList />
    </main>
  );
} 