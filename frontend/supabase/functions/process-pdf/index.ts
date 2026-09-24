import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
    // Text extraction returned too little — try raw text extraction
    throw new Error('INSUFFICIENT_TEXT');
  } catch (err: any) {
    if (err.message === 'INSUFFICIENT_TEXT') {
      throw new Error('This PDF appears to be scanned or image-based. Please copy and paste your text using Paste Notes instead.');
    }
    // unpdf itself failed — try basic text extraction
    try {
      const binaryStr = atob(base64);
      // Extract any readable ASCII text from the binary
      let rawText = '';
      for (let i = 0; i < binaryStr.length; i++) {
        const code = binaryStr.charCodeAt(i);
        if (code >= 32 && code < 127) rawText += binaryStr[i];
        else rawText += ' ';
      }
      // Clean up the extracted text
      const cleaned = rawText
        .replace(/\s+/g, ' ')
        .replace(/[^\x20-\x7E]/g, '')
        .trim();
      const words = cleaned.split(' ').filter(w => w.length > 2);
      const meaningfulText = words.join(' ');
      if (meaningfulText.length > 200) {
        return meaningfulText.substring(0, 8000);
      }
    } catch {
      // Fallback also failed
    }
    throw new Error('Could not read this PDF. Please use Paste Notes instead — copy your content and paste it directly.');
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
    const wordsPerChunk = Math.ceil(words.length / Math.min(10, Math.ceil(words.length / 500)));
    const splitChunks: string[] = [];
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(i, i + wordsPerChunk).join(' ');
      if (chunk.trim().length > 100) splitChunks.push(chunk.trim());
    }
    return splitChunks.slice(0, 10);
  }

  return chunks.slice(0, 10);
}

async function generateLessonsFromChunks(
  chunks: string[],
  topicTitle: string,
  gradeLevel: string
): Promise<any[]> {
  const key = Deno.env.get('OPENROUTER_API_KEY');
  if (!key) throw new Error('OPENROUTER_API_KEY not configured');

  const chunksText = chunks.map((chunk, i) =>
    `--- SECTION ${i + 1} ---\n${chunk.substring(0, 1200)}`
  ).join('\n\n');

  const prompt = `You are a patient, encouraging teacher for neurodivergent students in Nigeria.

Transform the following ${chunks.length} sections of content about "${topicTitle}" into exactly ${chunks.length} micro-lessons.

${chunksText}

Return ONLY a raw JSON array with exactly ${chunks.length} objects. No markdown, no backticks, just raw JSON:
[
  {
    "title": "lesson title max 8 words",
    "level_1": "Simple clear explanation in 3-4 sentences. Plain language, no jargon.",
    "level_2": "Same concept using a real-world Nigerian analogy. 3-4 sentences.",
    "level_3": "Step 1: ... Step 2: ... Step 3: ... (key points as numbered steps)",
    "level_4": "Think about this: one reflective question about this content",
    "level_3_visual": {
      "type": "steps",
      "title": "Key Points",
      "items": [
        {"label": "Point 1", "text": "key idea under 10 words"},
        {"label": "Point 2", "text": "key idea under 10 words"},
        {"label": "Point 3", "text": "key idea under 10 words"}
      ]
    }
  }
]

Rules:
- Return exactly ${chunks.length} lesson objects
- Each lesson covers its corresponding section
- Choose level_3_visual type: "steps" for processes, "terms" for vocabulary (items have "term" and "definition"), "compare" for comparisons (items have "left" and "right")
- Keep language simple and encouraging
- Appropriate for ${gradeLevel} level`;

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
          content: 'You are a patient teacher. Output ONLY raw valid JSON array. No markdown. No backticks. Just raw JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 4000,
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI service error. Please try again in a moment.`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI returned an empty response. Please try again.');

  content = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const arrayMatch = content.match(/\[[\s\S]*\]/);
  if (!arrayMatch) throw new Error('Could not process AI response. Please try again.');

  try {
    return JSON.parse(arrayMatch[0]);
  } catch {
    throw new Error('Could not process AI response. Please try again.');
  }
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
        level_1: lesson.level_1 || 'Content from your uploaded notes.',
        level_2: lesson.level_2 || 'Think of this like a journey through the material.',
        level_3: lesson.level_3 || 'Step 1: Read. Step 2: Understand. Step 3: Review.',
        level_4: lesson.level_4 || 'Think about this: What is the most important idea from this section?',
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error. Please contact support.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Extract text
    let extractedText: string;
    if (pasteText) {
      extractedText = pasteText.trim();
      if (extractedText.length < 20) {
        return new Response(
          JSON.stringify({ error: 'Please paste more content. The text is too short to create lessons from.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
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

    let lessons: any[];
    try {
      lessons = await generateLessonsFromChunks(chunks, title, gradeLevel || 'University');
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!lessons || lessons.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not generate lessons from your content. Please try again.' }),
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