import { MetadataRoute } from 'next';
import { fetchSubmissions } from '@/lib/actions/submissions';
import type { Submission } from '@/lib/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://desa-connect.vercel.app';
  
  // Halaman statis utama
  const mainRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/track`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submissions`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Kategori laporan
  const categories = ['Infrastructure', 'Education', 'Health', 'Social Welfare', 'Other'];
  const categoryRoutes = categories.map(category => ({
    url: `${baseUrl}/category/${category.toLowerCase().replace(' ', '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Status laporan
  const statusRoutes = ['pending', 'in-progress', 'resolved'].map(status => ({
    url: `${baseUrl}/status/${status}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  try {
    // Ambil semua submission yang public
    const { submissions } = await fetchSubmissions({
      limit: 1000, // Batasi jumlah submission untuk sitemap
      page: 1,
      sortBy: 'date_desc'
    });

    // Generate routes untuk setiap submission public
    const submissionRoutes = submissions.map(submission => ({
      url: `${baseUrl}/submission/${submission.referenceId}`,
      lastModified: new Date(submission.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    // Gabungkan semua route
    return [
      ...mainRoutes,
      ...categoryRoutes,
      ...statusRoutes,
      ...submissionRoutes,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Jika terjadi error, kembalikan hanya route statis
    return mainRoutes;
  }
} 