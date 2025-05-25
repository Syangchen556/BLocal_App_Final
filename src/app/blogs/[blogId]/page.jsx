import BlogDetail from '@/components/blogs/BlogDetail';

export async function generateMetadata({ params }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${params.blogId}`);
    const blog = await response.json();

    return {
      title: `${blog.title} | Blocal`,
      description: blog.summary,
    };
  } catch (error) {
    return {
      title: 'Blog | Blocal',
      description: 'Read blogs from our community',
    };
  }
}

export default function BlogPage({ params }) {
  return <BlogDetail blogId={params.blogId} />;
} 