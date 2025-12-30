import OpenAI from 'openai';

// Initialize OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ArticleGenerationResult {
  title: string;
  content: string;
  metaDesc: string;
  slug: string;
}

/**
 * Generate SEO-optimized article content using AI
 */
export async function generateArticleDB(
  topic: string,
  keywords: string[]
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }

  const prompt = `
Write a comprehensive, SEO-optimized blog post about: "${topic}".

Target Audience: Indonesian e-commerce sellers and general users sending packages.
Tone: Professional, Helpful, slightly casual.
Language: Indonesian (Bahasa Indonesia).
Keywords to include naturally: ${keywords.join(', ')}.

Format the output in Markdown.

Structure:
- H1 Title (make it catchy and SEO-friendly)
- Introduction (hook the reader, explain what they'll learn)
- H2 Subheadings (at least 3 main sections)
- Bullet points where appropriate
- Tips or best practices section
- Conclusion featuring "CekKirim.com" as a helpful solution for tracking packages

Writing Guidelines:
- Use short paragraphs (2-3 sentences max)
- Include relevant emojis sparingly for visual appeal
- Add internal linking suggestions with [link text](suggested-url)
- Write at least 800 words
- Make it actionable and practical

Do not include markdown code block fences. Just return the raw markdown text.
`;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are an expert Indonesian Logistic and E-commerce SEO Content Writer. You write engaging, informative, and SEO-optimized content that helps sellers and online shoppers.',
      },
      { role: 'user', content: prompt },
    ],
    model: 'gpt-4o-mini', // Cost effective while maintaining quality
    temperature: 0.7,
    max_tokens: 2500,
  });

  return completion.choices[0].message.content || '';
}

/**
 * Generate meta description from content
 */
export async function generateMetaDescription(
  content: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback: extract first paragraph
    const firstParagraph =
      content.split('\n\n')[1] || content.substring(0, 160);
    return firstParagraph.substring(0, 155) + '...';
  }

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'Generate a compelling SEO meta description (max 155 characters) in Indonesian.',
      },
      {
        role: 'user',
        content: `Create a meta description for this article:\n\n${content.substring(0, 500)}`,
      },
    ],
    model: 'gpt-4o-mini',
    temperature: 0.5,
    max_tokens: 100,
  });

  return completion.choices[0].message.content?.substring(0, 160) || '';
}

/**
 * Suggest related keywords
 */
export async function suggestKeywords(topic: string): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    return [];
  }

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'Suggest 5-8 relevant SEO keywords for Indonesian e-commerce/logistics articles. Return as comma-separated list.',
      },
      { role: 'user', content: `Topic: ${topic}` },
    ],
    model: 'gpt-4o-mini',
    temperature: 0.5,
    max_tokens: 100,
  });

  const keywords = completion.choices[0].message.content || '';
  return keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}
