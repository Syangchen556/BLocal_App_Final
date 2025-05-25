import BlogForm from '@/components/blogs/BlogForm';

export const metadata = {
  title: 'Write Blog | Blocal',
  description: 'Share your thoughts with the community',
};

export default function WriteBlogPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Write a Blog</h1>
      <BlogForm />
    </main>
  );
} 