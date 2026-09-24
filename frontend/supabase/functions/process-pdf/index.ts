import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function getSupabaseKey(): string {
  const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeysRaw) {
    try {
      const parsed = JSON.parse(secretKeysRaw);
      const key = parsed.service_role || parsed[Object.keys(parsed)[0]];
      if (key) return key;
    } catch {
      // fall through
    }
  }
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacy) return legacy;
  throw new Error('No Supabase service key found');
}

async function extractTextFromPDF(base64: string): Promise<string> {
  try {
    const { extractText } = await import("npm:unpdf@0.11.0");
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const { text } = await extractText(bytes, { mergePages: true });
    if (text && text.trim().length >= 50) {
      return text;
    }
    throw new Error('INSUFFICIENT_TEXT');
  } catch (err: any) {
    if (err.message === 'INSUFFICIENT_TEXT') {
      throw new Error('This PDF appears to be scanned or image-based. Please copy and paste your text using Paste Notes instead.');
    }
    try {
      const binaryStr = atob(base64);
      let rawText = '';
      for (let i = 0; i < binaryStr.length; i++) {
        const code = binaryStr.charCodeAt(i);
        if (code >= 32 && code < 127) rawText += binaryStr[i];
        else rawText += ' ';
      }
      const cleaned = rawText.replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '').trim();
      const words = cleaned.split(' ').filter(w => w.length > 2);
      const meaningfulText = words.join(' ');
      if (meaningfulText.length > 200) {
        return meaningfulText.substring(0, 8000);
      }
    } catch {
      // fallback also failed
    }
    throw new Error('Could not read this PDF. Please use Paste Notes instead.');
  }
}

function smartChunk(text: string): string[] {
  const lines = text.split('\n');
  const chunks: string[] = [];
  let currentChunk = '';

  const isHeading = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) return false;
    if (trimmed.length < 80) {
      if (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) return true;
      if (/^(\d+[\.\)]|chapter|section|topic|unit|part|introduction|conclusion|summary)/i.test(trimmed)) return true;
      if (trimmed.endsWith(':') && trimmed.split(' ').length <= 6) return true;
    }
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (isHeading(trimmed) && currentChunk.trim().split(/\s+/).length > 200) {
      chunks.push(currentChunk.trim());
      currentChunk = line + '\n';
    } else {
      currentChunk += line + '\n';
    }
  }

  if (currentChunk.trim().length > 100) {
    chunks.push(currentChunk.trim());
  }

  if (chunks.length <= 1) {
    const words = text.split(/\s+/);
    const wordsPerChunk = Math.ceil(words.length / Math.min(6, Math.ceil(words.length / 500)));
    const splitChunks: string[] = [];
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(i, i + wordsPerChunk).join(' ');
      if (chunk.trim().length > 100) splitChunks.push(chunk.trim());
    }
    return splitChunks.slice(0, 6);
  }

  return chunks.slice(0, 6);
}

function extractJSON(content: string): any | null {
  try {
    let cleaned = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const objMatch = cleaned.match(/\{[\s\S]*\}/);
      if (objMatch) {
        return JSON.parse(objMatch[0]);
      }
    }
  } catch {
    // extraction failed
  }
  return null;
}

async function callAI(prompt: string, key: string): Promise<string | null> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pathfinder-chi-seven.vercel.app',
        'X-Title': 'Pathfinder'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'system',
            content: 'You are a teacher. Output ONLY raw valid JSON. No markdown. No backticks. No explanation. Just the JSON.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 600,
      })
    });

    if (!response.ok) {
      console.log(`OpenRouter returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.log('OpenRouter returned empty content');
      return null;
    }

    console.log(`AI response preview: ${content.substring(0, 150)}`);
    return content;
  } catch (err) {
    console.log(`callAI error: ${err}`);
    return null;
  }
}

async function generateLessonsFromChunks(
  chunks: string[],
  topicTitle: string,
  gradeLevel: string,
  key: string
): Promise<any[]> {
  const lessons: any[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const prompt = `You are a teacher for Nigerian students. Create a lesson from this content.

Topic: "${topicTitle}" Section ${i + 1}
Content: ${chunks[i].substring(0, 500)}
Level: ${gradeLevel}

Respond with ONLY this JSON, nothing else:
{"title":"short title under 8 words","explanation":"explain in 3 simple sentences","analogy":"Nigerian real-world comparison in 2 sentences","steps":"Step 1: point. Step 2: point. Step 3: point.","question":"one reflective question"}`;

    const content = await callAI(prompt, key);
    if (!content) {
      console.log(`Chunk ${i} - AI call failed, skipping`);
      continue;
    }

    const lesson = extractJSON(content);
    if (lesson && lesson.title) {
      const stepsText = lesson.steps || 'Step 1: Read. Step 2: Understand. Step 3: Review.';
      const stepParts = stepsText.split(/step \d+:/i).filter((s: string) => s.trim().length > 0);

      lessons.push({
        title: lesson.title,
        level_1: lesson.explanation || 'Key content from your notes.',
        level_2: lesson.analogy || 'Think of this like a journey through the material.',
        level_3: stepsText,
        level_4: lesson.question || 'Think about this: What is the most important idea?',
        level_3_visual: {
          type: 'steps',
          title: 'Key Points',
          items: [
            { label: 'Step 1', text: stepParts[0]?.trim().substring(0, 60) || 'First key idea' },
            { label: 'Step 2', text: stepParts[1]?.trim().substring(0, 60) || 'Second key idea' },
            { label: 'Step 3', text: stepParts[2]?.trim().substring(0, 60) || 'Third key idea' },
          ]
        }
      });
      console.log(`Chunk ${i} - lesson created: ${lesson.title}`);
    } else {
      console.log(`Chunk ${i} - JSON parse failed, raw: ${content.substring(0, 200)}`);
    }
  }

  return lessons;
}

async function saveLesson(
  lesson: any,
  index: number,
  topicTitle: string,
  studentId: string | null,
  classId: string | null,
  gradeLevel: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ topicId: string; title: string } | null> {
  try {
    const topicPayload: any = {
      subject: 'Uploaded Notes',
      title: lesson.title || `${topicTitle} — Part ${index + 1}`,
      description: `From: ${topicTitle}`,
      grade_level: gradeLevel || 'University',
      order_index: index + 1,
    };

    if (studentId) topicPayload.student_id = studentId;
    if (classId) topicPayload.class_id = classId;

    const topicRes = await fetch(`${supabaseUrl}/rest/v1/topics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(topicPayload)
    });

    if (!topicRes.ok) {
      const errText = await topicRes.text();
      console.error(`Topic insert failed: ${errText}`);
      return null;
    }

    const topicData = await topicRes.json();
    const topic = Array.isArray(topicData) ? topicData[0] : topicData;
    if (!topic?.id) return null;

    await fetch(`${supabaseUrl}/rest/v1/lessons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        topic_id: topic.id,
        level_1: lesson.level_1,
        level_2: lesson.level_2,
        level_3: lesson.level_3,
        level_4: lesson.level_4,
        level_3_visual: lesson.level_3_visual
          ? JSON.stringify(lesson.level_3_visual)
          : null,
      })
    });

    return { topicId: topic.id, title: topic.title };
  } catch (err) {
    console.error(`Save lesson ${index} error:`, err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  }

  try {
    const body = await req.json();
    const { pdfBase64, pasteText, topicTitle, studentId, classId, gradeLevel } = body;

    if (!pdfBase64 && !pasteText) {
      return new Response(
        JSON.stringify({ error: 'No content provided. Please upload a PDF or paste your notes.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!studentId && !classId) {
      return new Response(
        JSON.stringify({ error: 'Session error. Please log out and log back in.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    let supabaseKey: string;
    try {
      supabaseKey = getSupabaseKey();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Server configuration error.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!supabaseUrl) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openrouterKey) {
      return new Response(
        JSON.stringify({ error: 'OPENROUTER_API_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    let extractedText: string;
    if (pasteText) {
      extractedText = pasteText.trim();
      if (extractedText.length < 20) {
        return new Response(
          JSON.stringify({ error: 'Please paste more content.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      if (extractedText.length > 50000) {
        extractedText = extractedText.substring(0, 50000);
      }
    } else {
      try {
        extractedText = await extractTextFromPDF(pdfBase64);
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    const title = (topicTitle || 'My Notes').trim();
    const chunks = smartChunk(extractedText);
    console.log(`Detected ${chunks.length} sections for: ${title}`);

    const lessons = await generateLessonsFromChunks(chunks, title, gradeLevel || 'University', openrouterKey);

    if (!lessons || lessons.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not generate lessons. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const savedLessons = [];
    for (let i = 0; i < lessons.length; i++) {
      const saved = await saveLesson(
        lessons[i], i, title,
        studentId || null,
        classId || null,
        gradeLevel,
        supabaseUrl,
        supabaseKey
      );
      if (saved) savedLessons.push({ ...saved, partNumber: i + 1 });
    }

    if (savedLessons.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not save lessons. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalParts: savedLessons.length,
        lessons: savedLessons,
        message: `Successfully created ${savedLessons.length} micro-lesson${savedLessons.length !== 1 ? 's' : ''} from your notes`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (err: any) {
    console.error('process-pdf error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Something went wrong. Please try again.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});