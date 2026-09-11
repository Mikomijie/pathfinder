import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callOpenRouter(prompt: string): Promise<string> {
  const key = Deno.env.get('OPENROUTER_API_KEY');
  if (!key) throw new Error('OPENROUTER_API_KEY not set');

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
          content: 'You are a patient, encouraging teacher for neurodivergent students in Nigeria. Output ONLY raw valid JSON. No markdown, no backticks, no code blocks. Just raw JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${err}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenRouter');

  content = content
    .replace(/^```json\n?/i, '')
    .replace(/^```\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();

  return content;
}

async function extractTextFromPDF(base64: string): Promise<string> {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const pdfText = new TextDecoder('latin1').decode(bytes);
  const textMatches: string[] = [];

  const parenRegex = /\(([^)]{2,})\)/g;
  let match;
  while ((match = parenRegex.exec(pdfText)) !== null) {
    const text = match[1]
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .trim();
    if (text.length > 3 && /[a-zA-Z]{2,}/.test(text)) {
      textMatches.push(text);
    }
  }

  const extracted = textMatches.join(' ').replace(/\s+/g, ' ').trim();

  if (extracted.length < 50) {
    throw new Error('Could not extract text from this PDF. Please use "Paste Notes" instead and paste your content directly.');
  }

  return extracted.substring(0, 6000);
}

async function generateChunkLesson(chunkText: string, chunkIndex: number, topicTitle: string): Promise<any> {
  const prompt = `Create an adaptive micro-lesson for Part ${chunkIndex + 1} about: "${topicTitle}"

Content: "${chunkText.slice(0, 1500)}"

Return this exact JSON:
{"title":"lesson title max 8 words","level_1":"Simple clear explanation in 3-4 sentences.","level_2":"Same concept using a real-world Nigerian analogy. 3-4 sentences.","level_3":"Step 1: ... Step 2: ... Step 3: ...","level_4":"Think about this: one reflective question"}`;

  const text = await callOpenRouter(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');
  return JSON.parse(jsonMatch[0]);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { pdfBase64, pasteText, topicTitle, studentId, gradeLevel } = await req.json();

    if (!pdfBase64 && !pasteText) {
      return new Response(
        JSON.stringify({ error: 'No content provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract or use text
    let extractedText: string;
    if (pasteText) {
      extractedText = pasteText.substring(0, 6000);
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

    const chunkSize = 1500;
    const chunks: string[] = [];
    for (let i = 0; i < extractedText.length; i += chunkSize) {
      chunks.push(extractedText.slice(i, i + chunkSize));
    }

    const processChunks = chunks.slice(0, 5);
    const title = topicTitle || 'Uploaded Notes';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const savedLessons = [];

    for (let i = 0; i < processChunks.length; i++) {
      try {
        const lesson = await generateChunkLesson(processChunks[i], i, title);

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
            title: lesson.title || `${title} — Part ${i + 1}`,
            description: `From uploaded notes: ${title}`,
            grade_level: gradeLevel || 'University',
            order_index: i + 1,
            student_id: studentId
          })
        });

        const topicData = await topicRes.json();
        const topic = Array.isArray(topicData) ? topicData[0] : topicData;
        if (!topic?.id) continue;

        await fetch(`${supabaseUrl}/rest/v1/lessons`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            topic_id: topic.id,
            level_1: lesson.level_1,
            level_2: lesson.level_2,
            level_3: lesson.level_3,
            level_4: lesson.level_4
          })
        });

        savedLessons.push({
          topicId: topic.id,
          title: topic.title,
          partNumber: i + 1
        });

      } catch (err) {
        console.error(`Chunk ${i} failed:`, err);
      }
    }

    if (savedLessons.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not generate lessons. Please try again or use Paste Notes mode.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalParts: savedLessons.length,
        lessons: savedLessons,
        message: `Successfully created ${savedLessons.length} micro-lessons`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('Process PDF error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Something went wrong' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});