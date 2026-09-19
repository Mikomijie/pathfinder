import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://pathfinder-chi-seven.vercel.app',
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
    if (!text || text.trim().length < 50) {
      throw new Error('Could not extract enough text from this PDF. Please use Paste Notes instead.');
    }
    return text.substring(0, 8000);
  } catch (err: any) {
    if (err.message.includes('Could not extract')) throw err;
    throw new Error('Could not read this PDF. Please use Paste Notes instead and paste your content directly.');
  }
}

async function generateAllLessons(
  text: string,
  topicTitle: string,
  gradeLevel: string
): Promise<any[]> {
  const key = Deno.env.get('OPENROUTER_API_KEY');
  if (!key) throw new Error('OPENROUTER_API_KEY not configured');

  const prompt = `You are a patient, encouraging teacher for neurodivergent students in Nigeria.

Transform this content into exactly 3 micro-lessons about: "${topicTitle}"

Content:
"""
${text.substring(0, 6000)}
"""

Return ONLY this raw JSON array, no markdown, no backticks, no extra text:
[
  {
    "title": "lesson title max 8 words",
    "level_1": "Simple clear explanation in 3-4 sentences. Plain language.",
    "level_2": "Same concept using a real-world Nigerian analogy. 3-4 sentences.",
    "level_3": "Step 1: ... Step 2: ... Step 3: ...",
    "level_4": "Think about this: one reflective question about this content",
    "level_3_visual": {
      "type": "steps",
      "title": "How it works",
      "items": [
        {"label": "Step 1", "text": "first key point under 10 words"},
        {"label": "Step 2", "text": "second key point under 10 words"},
        {"label": "Step 3", "text": "third key point under 10 words"}
      ]
    }
  },
  {
    "title": "lesson title max 8 words",
    "level_1": "Simple clear explanation in 3-4 sentences.",
    "level_2": "Real-world Nigerian analogy. 3-4 sentences.",
    "level_3": "Step 1: ... Step 2: ... Step 3: ...",
    "level_4": "Think about this: one reflective question",
    "level_3_visual": {
      "type": "terms",
      "title": "Key Concepts",
      "items": [
        {"term": "key term", "definition": "simple definition under 10 words"},
        {"term": "key term", "definition": "simple definition under 10 words"},
        {"term": "key term", "definition": "simple definition under 10 words"}
      ]
    }
  },
  {
    "title": "lesson title max 8 words",
    "level_1": "Simple clear explanation in 3-4 sentences.",
    "level_2": "Real-world Nigerian analogy. 3-4 sentences.",
    "level_3": "Step 1: ... Step 2: ... Step 3: ...",
    "level_4": "Think about this: one reflective question",
    "level_3_visual": {
      "type": "compare",
      "title": "Compare",
      "items": [
        {"left": "concept A point", "right": "concept B point"},
        {"left": "concept A point", "right": "concept B point"},
        {"left": "concept A point", "right": "concept B point"}
      ]
    }
  }
]

Rules:
- Return ONLY the JSON array
- Each lesson covers a different part of the content
- Choose the level_3_visual type that best fits each lesson: "steps" for processes, "terms" for vocabulary, "compare" for comparisons
- Keep language simple and encouraging
- Appropriate for ${gradeLevel} students`;

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
    throw new Error(`OpenRouter error: ${err}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI. Please try again.');

  content = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const arrayMatch = content.match(/\[[\s\S]*\]/);
  if (!arrayMatch) throw new Error('Could not parse AI response. Please try again.');

  return JSON.parse(arrayMatch[0]);
}

async function saveLesson(
  lesson: any,
  index: number,
  topicTitle: string,
  studentId: string,
  gradeLevel: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ topicId: string; title: string } | null> {
  try {
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

    if (!topicRes.ok) return null;
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
    // Verify Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

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
        JSON.stringify({ error: 'Server configuration error.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Verify the user is actually authenticated
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': authHeader,
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || supabaseKey,
      }
    });

    if (!userRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid session. Please log in again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const userData = await userRes.json();
    if (!userData?.id || userData.id !== studentId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Student ID mismatch.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Extract text
    let extractedText: string;
    if (pasteText) {
      extractedText = pasteText.trim().substring(0, 8000);
      if (extractedText.length < 20) {
        return new Response(
          JSON.stringify({ error: 'Please paste more content. The text is too short.' }),
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

    // Generate all lessons in one AI call
    let lessons: any[];
    try {
      lessons = await generateAllLessons(extractedText, title, gradeLevel || 'University');
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!lessons || lessons.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not generate lessons. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Save all lessons
    const savedLessons = [];
    for (let i = 0; i < lessons.length; i++) {
      const saved = await saveLesson(
        lessons[i], i, title, studentId, gradeLevel, supabaseUrl, supabaseKey
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
        message: `Successfully created ${savedLessons.length} micro-lessons from your notes`,
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