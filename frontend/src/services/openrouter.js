const OPENROUTER_KEY = process.env.REACT_APP_OPENROUTER_KEY;
const MODEL = 'openrouter/free';

// Retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 5) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const waitTime = Math.min(3000 * (attempt - 1), 20000); // 0s, 3s, 6s, 9s, 12s
        console.log(`Retry ${attempt}/${maxRetries - 1}, waiting ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
  }
  throw lastError;
}

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
          content: 'You are a patient, encouraging teacher for neurodivergent students in Nigeria. Output ONLY raw valid JSON. No markdown. No backticks. No code blocks. No extra text. Just raw JSON that can be parsed by JSON.parse().'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
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

  // Clean markdown wrappers
  content = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!content) {
    throw new Error('Empty content after cleaning');
  }

  return content;
}

function extractJSON(text, arrayMode = false) {
  if (!text) throw new Error('No text to parse');
  
  // Use NON-GREEDY matching instead of greedy
  const pattern = arrayMode ? /\[[\s\S]*?\]/ : /\{[\s\S]*?\}/;
  const match = text.match(pattern);
  
  if (!match) throw new Error(`No valid JSON ${arrayMode ? 'array' : 'object'} found in response`);
  
  const extracted = match[0];
  const parsed = JSON.parse(extracted);
  
  return parsed;
}

export async function generateInteractiveQuestion(topicTitle, lessonText) {
  const title = topicTitle || 'This topic';
  const text = lessonText || 'Explain the key concepts of this topic.';

  const prompt = `You are creating ONE quiz question ONLY from this exact lesson material. You MUST NOT use any external knowledge.

LESSON MATERIAL:
"${text.slice(0, 600)}"

Create ONE multiple choice question that:
- Tests understanding of a specific fact, concept, or detail FROM the material
- Has ONE correct answer (index 0-3)
- Has 3 wrong answers based on the material (not random guesses)
- Does NOT ask generic questions like "What did you learn?"
- Does NOT use external knowledge about "${title}"

Return ONLY this JSON object (no extra text):
{"question":"specific question from the material","options":["answer option A from material","answer option B from material","answer option C from material","answer option D from material"],"answer":0,"explanation":"why this answer is correct based on the material"}

CRITICAL: The question MUST be answerable ONLY from the provided material above.`;

  try {
    const content = await retryWithBackoff(() => callOpenRouter(prompt, 300), 5);
    const question = extractJSON(content, false);
    
    if (question && question.question && Array.isArray(question.options) && question.options.length === 4) {
      return question;
    }
    throw new Error('Invalid question format');
  } catch (err) {
    console.error('generateInteractiveQuestion error:', err.message);
    return null;
  }
}

export async function generateQuiz(topicTitle, lessonText) {
  const title = topicTitle || 'This topic';
  const text = lessonText || 'Explain the key concepts of this topic clearly and simply.';

  const prompt = `You are creating a quiz ONLY from this exact lesson material. You MUST NOT use any external knowledge.

LESSON MATERIAL:
"${text.slice(0, 600)}"

Your task:
- Create EXACTLY 3 multiple choice questions
- EVERY question MUST be answerable ONLY from the material above
- EVERY wrong answer MUST be based on the material (not random distractors)
- Questions MUST test specific facts, concepts, examples, or definitions FROM the material
- Do NOT create generic questions like "What is the main idea?" or "How can you apply this?"
- Do NOT use external knowledge about "${title}"
- Each question must test a DIFFERENT concept from the material

Return ONLY this JSON array (no extra text, no markdown):
[
{"question":"specific question from material","options":["answer A from material","answer B from material","answer C from material","answer D from material"],"answer":0,"explanation":"why this is correct based on the material"},
{"question":"another specific question from material","options":["option A","option B","option C","option D"],"answer":1,"explanation":"explanation based on material"},
{"question":"third specific question from material","options":["option A","option B","option C","option D"],"answer":2,"explanation":"explanation based on material"}
]

IMPORTANT: If the material is short or lacks detail, base questions on what IS there. Do NOT add information from external sources.`;

  try {
    const content = await retryWithBackoff(() => callOpenRouter(prompt, 600), 5);
    const quiz = extractJSON(content, true);
    
    // Validate that we got actual questions
    if (Array.isArray(quiz) && quiz.length === 3) {
      const validQuestions = quiz.filter(q => q.question && Array.isArray(q.options) && q.options.length === 4 && typeof q.answer === 'number');
      if (validQuestions.length === 3) {
        return validQuestions;
      }
    }
    throw new Error('Invalid quiz format returned');
  } catch (err) {
    console.error('generateQuiz error:', err.message);
    return [];
  }
}

export async function generateFlashcards(topicTitle, lessonText) {
  const title = topicTitle || 'This topic';
  const text = lessonText || 'Key concepts from this topic.';

  const prompt = `You are extracting key concepts ONLY from this exact lesson material. Do NOT use external knowledge.

LESSON MATERIAL:
"${text.slice(0, 600)}"

Extract up to 5 key concept pairs FROM the material:
- Each pair should test understanding of specific facts, definitions, or concepts from the material
- Do NOT use external knowledge about "${title}"
- Front side: key term or short question (under 10 words)
- Back side: answer from the material (under 20 words)

Return ONLY this JSON array (no extra text):
[
{"front":"key term from material","back":"definition or answer from material"},
{"front":"key term from material","back":"definition or answer from material"},
{"front":"key term from material","back":"definition or answer from material"},
{"front":"key term from material","back":"definition or answer from material"},
{"front":"key term from material","back":"definition or answer from material"}
]

Use simple Nigerian English. Extract only what is in the material.`;

  try {
    const content = await retryWithBackoff(() => callOpenRouter(prompt, 500), 5);
    const flashcards = extractJSON(content, true);
    
    if (Array.isArray(flashcards) && flashcards.length > 0) {
      const validFlashcards = flashcards.filter(f => f.front && f.back);
      if (validFlashcards.length > 0) {
        return validFlashcards;
      }
    }
    throw new Error('Invalid flashcards format');
  } catch (err) {
    console.error('generateFlashcards error:', err.message);
    return [];
  }
}

export async function generateLessonFromText(topicTitle, subject, contentText) {
  const title = topicTitle || 'This topic';
  const text = contentText || '';

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

  try {
    const content = await retryWithBackoff(() => callOpenRouter(prompt, 1000), 5);
    return extractJSON(content, false);
  } catch (err) {
    console.error('generateLessonFromText error:', err.message);
    return null;
  }
}