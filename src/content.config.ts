import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Detalles de descarga específicos de cada plataforma
const platformDetails = z.object({
  url: z.string().url(),
  type: z.enum([
    'official-site',
    'app-store',
    'web-app',
    'documentation',
    'official-installer',
    'github-repo',
    'package-manager'
  ]),
  label: z.string(),
  isOfficial: z.boolean(),
  lastChecked: z.string().optional()
});

const tools = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/tools' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    shortDescription: z.string().max(180),
    longDescription: z.string(),
    officialWebsite: z.string().url(),
    categories: z.array(z.string()),
    
    // Esquema de plataformas granular
    platforms: z.object({
      web: platformDetails.optional(),
      windows: platformDetails.optional(),
      mac: platformDetails.optional(),
      linux: platformDetails.optional(),
      android: platformDetails.optional(),
      ios: platformDetails.optional(),
    }),
    
    pricingModel: z.enum(['free', 'freemium', 'paid', 'enterprise', 'unknown']),
    requiresAccount: z.union([z.boolean(), z.literal('unknown')]),
    spanishSupport: z.enum(['yes', 'partial', 'no', 'unknown']),
    tags: z.array(z.string()).default([]),
    alternatives: z.array(z.string()).default([]),
    safetyNotes: z.array(z.string()).default([]),
    
    // Nivel de confianza editorial general
    trustLevel: z.enum(['official', 'verified', 'pending-review']),
    lastReviewed: z.string(), // Formato YYYY-MM-DD
    officialSources: z.array(z.string().url()).default([]),
  })
});

const categories = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/categories' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    icon: z.string().optional()
  })
});

const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    metaDescription: z.string().max(160),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    datePublished: z.string(),
    lastUpdated: z.string().optional(),
    author: z.string().default('Redacción DescargasIA')
  })
});

export const collections = {
  tools,
  categories,
  guides
};
