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

  const prompt = `Generate ONE multiple choice question to check understanding of: "${title}"
Based on this lesson: "${text.slice(0, 600)}"

Return ONLY this JSON object:
{"question":"your question here","options":["Option A","Option B","Option C","Option D"],"answer":0,"explanation":"brief encouraging explanation of why the answer is correct"}

Rules:
- answer is the index (0-3) of the correct option
- Keep language simple and encouraging
- No time pressure implied in the question
- Make distractors (wrong answers) plausible but clearly wrong`;

  try {
    const content = await retryWithBackoff(() => callOpenRouter(prompt, 300), 5);
    return extractJSON(content, false);
  } catch (err) {
    console.error('generateInteractiveQuestion error:', err.message);
    // Return fallback question instead of null
    return {
      question: "What did you learn from this lesson?",
      options: ["I learned the main concepts", "I need to review more", "I understood everything", "I need help"],
      answer: 0,
      explanation: "Great! Review what you've learned so far."
    };
  }
}

export async function generateQuiz(topicTitle, lessonText) {
  const title = topicTitle || 'This topic';
  const text = lessonText || 'Explain the key concepts of this topic clearly and simply.';

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

  try {
    const content = await retryWithBackoff(() => callOpenRouter(prompt, 600), 5);
    return extractJSON(content, true);
  } catch (err) {
    console.error('generateQuiz error:', err.message);
    // Return fallback quiz instead of null
    return [
      {
        question: "What was the main idea?",
        options: ["Main concept", "Secondary idea", "Unrelated topic", "Not clear"],
        answer: 0,
        explanation: "The main idea is the core concept to remember."
      },
      {
        question: "How can you apply this?",
        options: ["In real life", "Only in class", "Never", "Unsure"],
        answer: 0,
        explanation: "Understanding helps you apply knowledge in real situations."
      },
      {
        question: "Do you feel confident?",
        options: ["Very confident", "Somewhat confident", "Need more practice", "Not yet"],
        answer: 1,
        explanation: "That's normal. Keep practicing!"
      }
    ];
  }
}

export async function generateFlashcards(topicTitle, lessonText) {
  const title = topicTitle || 'This topic';
  const text = lessonText || 'Key concepts from this topic.';

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

  try {
    const content = await retryWithBackoff(() => callOpenRouter(prompt, 500), 5);
    return extractJSON(content, true);
  } catch (err) {
    console.error('generateFlashcards error:', err.message);
    // Return fallback flashcards instead of null
    return [
      { front: "What is the main topic?", back: title },
      { front: "Why is this important?", back: "It helps you understand key concepts." },
      { front: "What should I remember?", back: "The key ideas from this lesson." },
      { front: "How do I practice?", back: "Review regularly and test yourself." },
      { front: "Am I doing well?", back: "Yes! Keep learning and improving." }
    ];
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
    // Return fallback lesson instead of null
    return {
      level_1: `${title} is an important concept. It helps you understand key ideas in ${subject}. Take your time to learn at your own pace.`,
      level_2: `Think of ${title} like something familiar in your daily life. It works the same way as things you already understand.`,
      level_3: "Step 1: Read and understand. Step 2: Think about how it applies. Step 3: Practice and remember.",
      level_4: `What do you find most interesting about ${title}? How can you use this in your life?`,
      level_3_visual: {
        type: "steps",
        title: "How to Learn This",
        items: [
          { label: "Step 1", text: "Read the explanation carefully" },
          { label: "Step 2", text: "Think about the example" },
          { label: "Step 3", text: "Practice with questions" }
        ]
      }
    };
  }
}