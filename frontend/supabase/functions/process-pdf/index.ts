import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function callOpenRouter(prompt: string, maxTokens = 800): Promise<string> {
  const key = Deno.env.get('OPENROUTER_API_KEY');
  if (!key) throw new Error('OPENROUTER_API_KEY not configured');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://pathfinder-git-main-mikomijies-projects.vercel.app',
      'X-Title': 'Pathfinder'
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [
        {
          role: 'system',
          content: 'You are a patient, encouraging teacher for neurodivergent students in Nigeria. Output ONLY raw valid JSON. No markdown. No backticks. No code blocks. Just raw JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown error');
    throw new Error(`OpenRouter ${response.status}: ${errText}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenRouter');

  content = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return content;
}

function extractJSON(text: string): any {
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
  }
  throw new Error('No valid JSON found in response');
}

async function extractTextFromPDF(base64: string): Promise<string> {
  // Decode base64 to bytes
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // Decode as latin1 to preserve byte values
  const pdfText = new TextDecoder('latin1').decode(bytes);
  const textMatches: string[] = [];

  // Extract text from PDF string literals (between parentheses)
  const parenRegex = /\(([^)]{2,200})\)/g;
  let match;
  while ((match = parenRegex.exec(pdfText)) !== null) {
    const text = match[1]
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\\[0-7]{3}/g, '') // octal escapes
      .trim();

    // Only keep strings with real words
    if (text.length > 3 && /[a-zA-Z]{3,}/.test(text) && !/^[\s\d\W]+$/.test(text)) {
      textMatches.push(text);
    }
  }

  // Also try to extract from stream content
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let streamMatch;
  while ((streamMatch = streamRegex.exec(pdfText)) !== null) {
    const streamContent = streamMatch[1];
    // Look for text showing patterns like (text) Tj or (text) TJ
    const tjRegex = /\(([^)]{2,200})\)\s*T[jJ]/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(streamContent)) !== null) {
      const text = tjMatch[1].replace(/\\n/g, ' ').replace(/\\r/g, ' ').trim();
      if (text.length > 3 && /[a-zA-Z]{3,}/.test(text)) {
        textMatches.push(text);
      }
    }
  }

  const extracted = textMatches
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\s]/g, '') // remove non-printable chars
    .trim();

  if (extracted.length < 50) {
    throw new Error(
      'Could not extract enough text from this PDF. This may be a scanned or image-based PDF. Please use "Paste Notes" mode and paste your content directly.'
    );
  }

  return extracted.substring(0, 8000);
}

async function generateChunkLesson(
  chunkText: string,
  chunkIndex: number,
  topicTitle: string
): Promise<any> {
  const prompt = `Create an adaptive micro-lesson for Part ${chunkIndex + 1} about: "${topicTitle}"

Content to teach from:
"${chunkText.slice(0, 1500)}"

Return ONLY this JSON object:
{"title":"lesson title max 8 words","level_1":"Simple clear explanation in 3-4 sentences. Plain language.","level_2":"Same concept using a real-world Nigerian analogy. 3-4 sentences.","level_3":"Step 1: ... Step 2: ... Step 3: ... (key concepts as numbered steps)","level_4":"Think about this: one reflective question about this content"}

Keep language simple and encouraging. Appropriate for university students.`;

  const text = await callOpenRouter(prompt, 800);
  return extractJSON(text);
}

async function saveToSupabase(
  lesson: any,
  index: number,
  topicTitle: string,
  studentId: string,
  gradeLevel: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ topicId: string; title: string; partNumber: number } | null> {
  try {
    // Insert topic
    const topicRes = await fetch(`${supabaseUrl}/rest/v1/topics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        subject: 'Uploaded Notes',
        title: lesson.title || `${topicTitle} — Part ${index + 1}`,
        description: `Uploaded from: ${topicTitle}`,
        grade_level: gradeLevel || 'University',
        order_index: index + 1,
        student_id: studentId,
      })
    });

    if (!topicRes.ok) {
      const err = await topicRes.text();
      console.error(`Topic insert failed: ${err}`);
      return null;
    }

    const topicData = await topicRes.json();
    const topic = Array.isArray(topicData) ? topicData[0] : topicData;
    if (!topic?.id) return null;

    // Insert lesson content
    const lessonRes = await fetch(`${supabaseUrl}/rest/v1/lessons`, {
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
        level_3: lesson.level_3 || 'Step 1: Read the content. Step 2: Understand the key points. Step 3: Review.',
        level_4: lesson.level_4 || 'Think about this: What is the most important idea from this section?',
      })
    });

    if (!lessonRes.ok) {
      const err = await lessonRes.text();
      console.error(`Lesson insert failed: ${err}`);
      return null;
    }

    return {
      topicId: topic.id,
      title: topic.title,
      partNumber: index + 1,
    };
  } catch (err) {
    console.error(`saveToSupabase error for chunk ${index}:`, err);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
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
    const { pdfBase64, pasteText, topicTitle, studentId, gradeLevel } = body;

    if (!pdfBase64 && !pasteText) {
      return new Response(
        JSON.stringify({ error: 'No content provided. Please upload a PDF or paste your notes.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: 'Student ID required.' }),
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

    // Extract or use text
    let extractedText: string;

    if (pasteText) {
      extractedText = pasteText.trim().substring(0, 8000);
      if (extractedText.length < 20) {
        return new Response(
          JSON.stringify({ error: 'Please paste more content. The text you provided is too short.' }),
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

    // Split into chunks
    const chunkSize = 1500;
    const chunks: string[] = [];
    const words = extractedText.split(/\s+/);
    let currentChunk = '';

    for (const word of words) {
      if ((currentChunk + ' ' + word).length > chunkSize && currentChunk.length > 0) {
        // Split at sentence boundary if possible
        const lastSentence = currentChunk.lastIndexOf('. ');
        if (lastSentence > chunkSize * 0.5) {
          chunks.push(currentChunk.substring(0, lastSentence + 1).trim());
          currentChunk = currentChunk.substring(lastSentence + 2) + ' ' + word;
        } else {
          chunks.push(currentChunk.trim());
          currentChunk = word;
        }
      } else {
        currentChunk = currentChunk ? currentChunk + ' ' + word : word;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());

    // Limit to 5 chunks max for free tier
    const processChunks = chunks.slice(0, 5);
    const title = (topicTitle || 'My Notes').trim();

    console.log(`Processing ${processChunks.length} chunks for topic: ${title}`);

    // Generate lessons for each chunk
    const savedLessons: { topicId: string; title: string; partNumber: number }[] = [];

    for (let i = 0; i < processChunks.length; i++) {
      try {
        console.log(`Processing chunk ${i + 1} of ${processChunks.length}`);
        const lesson = await generateChunkLesson(processChunks[i], i, title);
        const saved = await saveToSupabase(lesson, i, title, studentId, gradeLevel, supabaseUrl, supabaseKey);
        if (saved) {
          savedLessons.push(saved);
        }
      } catch (err) {
        console.error(`Chunk ${i} failed:`, err);
        // Continue with remaining chunks even if one fails
      }
    }

    if (savedLessons.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Could not generate lessons from your content. Please try again or use shorter text.'
        }),
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