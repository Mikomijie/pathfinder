const OPENROUTER_KEY = process.env.REACT_APP_OPENROUTER_KEY;
const MODEL = 'openrouter/free';

async function callOpenRouter(prompt, maxTokens = 400) {
  if (!OPENROUTER_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Pathfinder'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a patient, encouraging teacher for neurodivergent students in Nigeria. Output ONLY raw valid JSON. No markdown. No backticks. No code blocks. No extra text. Just raw JSON.'
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

  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error('Empty response from OpenRouter');
  }

  let content = data.choices[0].message.content;

  content = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return content;
}

function extractJSON(text, arrayMode = false) {
  if (!text) throw new Error('No text to parse');
  const pattern = arrayMode ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
  const match = text.match(pattern);
  if (!match) throw new Error(`No valid JSON ${arrayMode ? 'array' : 'object'} found in response`);
  return JSON.parse(match[0]);
}

export async function generateInteractiveQuestion(topicTitle, lessonText) {
  const title = topicTitle || 'This topic';
  const text = lessonText || 'Explain the key concepts of this topic.';

  try {
    const prompt = `Generate ONE multiple choice question to check understanding of: "${title}"
Based on this lesson: "${text.slice(0, 600)}"

Return ONLY this JSON object:
{"question":"your question here","options":["Option A","Option B","Option C","Option D"],"answer":0,"explanation":"brief encouraging explanation of why the answer is correct"}

Rules:
- answer is the index (0-3) of the correct option
- Keep language simple and encouraging
- No time pressure implied in the question
- Make distractors (wrong answers) plausible but clearly wrong`;

    const content = await callOpenRouter(prompt, 300);
    return extractJSON(content, false);
  } catch (err) {
    console.error('generateInteractiveQuestion error:', err.message);
    return null;
  }
}

export async function generateQuiz(topicTitle, lessonText) {
  const title = topicTitle || 'This topic';
  const text = lessonText || 'Explain the key concepts of this topic clearly and simply.';

  try {
    const prompt = `Generate exactly 3 multiple choice questions about: "${title}"
Based on: "${text.slice(0, 600)}"

Return ONLY this JSON array:
[
{"question":"question 1","options":["A","B","C","D"],"answer":0,"explanation":"encouraging explanation"},
{"question":"question 2","options":["A","B","C","D"],"answer":1,"explanation":"encouraging explanation"},
{"question":"question 3","options":["A","B","C","D"],"answer":2,"explanation":"encouraging explanation"}
]

Rules:
- answer is the index (0-3) of the correct option
- Each question tests a different part of the lesson
- Keep language simple and encouraging`;

    const content = await callOpenRouter(prompt, 600);
    return extractJSON(content, true);
  } catch (err) {
    console.error('generateQuiz error:', err.message);
    return null;
  }
}

export async function generateFlashcards(topicTitle, lessonText) {
  const title = topicTitle || 'This topic';
  const text = lessonText || 'Key concepts from this topic.';

  try {
    const prompt = `Extract 5 key concept pairs from this lesson about: "${title}"
Content: "${text.slice(0, 600)}"

Return ONLY this JSON array:
[
{"front":"key term or short question","back":"simple clear answer under 20 words"},
{"front":"key term or short question","back":"simple clear answer under 20 words"},
{"front":"key term or short question","back":"simple clear answer under 20 words"},
{"front":"key term or short question","back":"simple clear answer under 20 words"},
{"front":"key term or short question","back":"simple clear answer under 20 words"}
]

Rules:
- front under 10 words
- back under 20 words
- Simple Nigerian English
- Focus on most important concepts`;

    const content = await callOpenRouter(prompt, 500);
    return extractJSON(content, true);
  } catch (err) {
    console.error('generateFlashcards error:', err.message);
    return null;
  }
}

export async function generateLessonFromText(topicTitle, subject, contentText) {
  const title = topicTitle || 'This topic';
  const text = contentText || '';

  try {
    const prompt = `Create a complete adaptive lesson about: "${title}" for subject: "${subject}"
Based on this content: "${text.slice(0, 2000)}"

Return ONLY this JSON object:
{"level_1":"Simple clear explanation in 3-4 sentences. Plain language, no jargon.","level_2":"Same concept using a real-world Nigerian analogy. 3-4 sentences.","level_3":"Step 1: ... Step 2: ... Step 3: ... (key points as numbered steps)","level_4":"Think about this: one reflective question to check understanding","level_3_visual":{"type":"steps","title":"How it works","items":[{"label":"Step 1","text":"first key point under 10 words"},{"label":"Step 2","text":"second key point under 10 words"},{"label":"Step 3","text":"third key point under 10 words"}]}}

The level_3_visual type must be one of:
- "steps" for processes or sequences
- "compare" for comparisons (items have "left" and "right" keys)
- "terms" for key vocabulary (items have "term" and "definition" keys)

Pick the type that best fits the topic content.
Keep all levels appropriate for the student. Use simple, encouraging language.`;

    const content = await callOpenRouter(prompt, 1000);
    return extractJSON(content, false);
  } catch (err) {
    console.error('generateLessonFromText error:', err.message);
    return null;
  }
}