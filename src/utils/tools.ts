import { getCollection } from 'astro:content';

export interface PlatformDetails {
  url: string;
  type: 'official-site' | 'app-store' | 'web-app' | 'documentation' | 'official-installer' | 'github-repo' | 'package-manager';
  isOfficial: boolean;
  lastChecked?: string;
}

export interface ToolMerged {
  id: string;
  slug: string;
  name: string;
  officialWebsite: string;
  categories: string[];
  platforms: {
    web?: PlatformDetails;
    windows?: PlatformDetails;
    mac?: PlatformDetails;
    linux?: PlatformDetails;
    android?: PlatformDetails;
    ios?: PlatformDetails;
  };
  pricingModel: 'free' | 'freemium' | 'paid' | 'enterprise' | 'unknown';
  requiresAccount: boolean | 'unknown';
  tags: string[];
  alternatives: string[];
  screenshotUrl?: string | null;
  initials?: string;
  trustLevel: 'official' | 'verified' | 'pending-review';
  lastReviewed: string;
  officialSources: string[];
  
  // Editorial local
  shortDescription: string;
  longDescription: string;
  bestFor: string[];
  limitations: string[];
  safetyNotes: string[];
  editorialSummary?: string;
  editorialSections: Array<{ heading: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
  spanishSupport?: 'yes' | 'partial' | 'no' | 'unknown';
  swedishSupport?: 'yes' | 'partial' | 'no' | 'unknown';
  italianSupport?: 'yes' | 'partial' | 'no' | 'unknown';
}

export async function getTranslatedTools(lang: string): Promise<ToolMerged[]> {
  const baseTools = await getCollection('toolsBase');
  const localizedTools = await getCollection('tools', (entry) => {
    return entry.id.startsWith(`${lang}/`);
  });

  const localizedMap = new Map(
    localizedTools.map((entry) => {
      // Si la id es "es/chatgpt", extraemos "chatgpt" como el slug base
      const slug = entry.id.split('/').slice(1).join('/');
      return [slug, entry];
    })
  );

  return baseTools
    .map((base) => {
      const localized = localizedMap.get(base.id);
      if (!localized) return null; // No incluir si no está traducido
      
      return {
        id: base.id,
        slug: base.id,
        name: base.data.name,
        officialWebsite: base.data.officialWebsite,
        categories: base.data.categories,
        platforms: base.data.platforms,
        pricingModel: base.data.pricingModel,
        requiresAccount: base.data.requiresAccount,
        tags: base.data.tags,
        alternatives: base.data.alternatives,
        screenshotUrl: base.data.screenshotUrl,
        initials: base.data.initials,
        trustLevel: base.data.trustLevel,
        lastReviewed: base.data.lastReviewed,
        officialSources: base.data.officialSources,
        
        // Datos localizados
        shortDescription: localized.data.shortDescription,
        longDescription: localized.data.longDescription,
        bestFor: localized.data.bestFor,
        limitations: localized.data.limitations,
        safetyNotes: localized.data.safetyNotes,
        editorialSummary: localized.data.editorialSummary,
        editorialSections: localized.data.editorialSections,
        faq: localized.data.faq,
        spanishSupport: localized.data.spanishSupport,
        swedishSupport: localized.data.swedishSupport,
        italianSupport: localized.data.italianSupport
      } as ToolMerged;
    })
    .filter((t): t is ToolMerged => t !== null);
}

export async function getTranslatedTool(lang: string, slug: string): Promise<ToolMerged | null> {
  const baseTools = await getCollection('toolsBase');
  const base = baseTools.find((b) => b.id === slug);
  if (!base) return null;

  const localizedTools = await getCollection('tools', (entry) => {
    return entry.id === `${lang}/${slug}`;
  });
  const localized = localizedTools[0];
  if (!localized) return null;

  return {
    id: base.id,
    slug: base.id,
    name: base.data.name,
    officialWebsite: base.data.officialWebsite,
    categories: base.data.categories,
    platforms: base.data.platforms,
    pricingModel: base.data.pricingModel,
    requiresAccount: base.data.requiresAccount,
    tags: base.data.tags,
    alternatives: base.data.alternatives,
    screenshotUrl: base.data.screenshotUrl,
    initials: base.data.initials,
    trustLevel: base.data.trustLevel,
    lastReviewed: base.data.lastReviewed,
    officialSources: base.data.officialSources,
    
    // Datos localizados
    shortDescription: localized.data.shortDescription,
    longDescription: localized.data.longDescription,
    bestFor: localized.data.bestFor,
    limitations: localized.data.limitations,
    safetyNotes: localized.data.safetyNotes,
    editorialSummary: localized.data.editorialSummary,
    editorialSections: localized.data.editorialSections,
    faq: localized.data.faq,
    spanishSupport: localized.data.spanishSupport,
    swedishSupport: localized.data.swedishSupport,
    italianSupport: localized.data.italianSupport
  } as ToolMerged;
}
