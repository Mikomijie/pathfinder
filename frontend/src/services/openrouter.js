console.log('OpenRouter key loaded:', process.env.REACT_APP_OPENROUTER_KEY?.slice(0, 10));
const OPENROUTER_KEY = process.env.REACT_APP_OPENROUTER_KEY;
const MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

export async function generateInteractiveQuestion(topicTitle, lessonText) {
  const prompt = `You are a patient, encouraging teacher for neurodivergent students in Nigeria.

Generate ONE multiple choice question about: "${topicTitle}"
Based on this lesson content: "${lessonText.slice(0, 800)}"

Return ONLY valid JSON, no extra text, no markdown, no backticks:
{"question":"question text here","options":["option A","option B","option C","option D"],"answer":0,"explanation":"brief encouraging explanation of why the answer is correct"}

Rules:
- answer is the index (0-3) of the correct option
- Keep language simple and clear
- Make options plausible but only one correct
- Explanation should be warm and encouraging
- No time pressure implied in the question`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Pathfinder'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300
    })
  });

  const data = await response.json();
  const text = data.choices[0].message.content;

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

export async function generateQuiz(topicTitle, lessonText) {
  const prompt = `You are a patient, encouraging teacher for neurodivergent students in Nigeria.

Generate exactly 3 multiple choice questions about: "${topicTitle}"
Based on this lesson: "${lessonText.slice(0, 800)}"

Return ONLY valid JSON array, no extra text, no markdown, no backticks:
[
  {"question":"question 1","options":["A","B","C","D"],"answer":0,"explanation":"encouraging explanation"},
  {"question":"question 2","options":["A","B","C","D"],"answer":1,"explanation":"encouraging explanation"},
  {"question":"question 3","options":["A","B","C","D"],"answer":2,"explanation":"encouraging explanation"}
]

Rules:
- answer is the index (0-3) of the correct option
- Keep language simple and clear
- Each question tests a different part of the lesson
- Explanations should be warm and encouraging
- No time pressure implied`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Pathfinder'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 600
    })
  });

  const data = await response.json();
  const text = data.choices[0].message.content;

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

export async function generateFlashcards(topicTitle, lessonText) {
  const prompt = `You are a patient teacher for neurodivergent students in Nigeria.

Extract 5 key concept pairs from this lesson about: "${topicTitle}"
Lesson: "${lessonText.slice(0, 800)}"

Return ONLY valid JSON array, no extra text, no markdown, no backticks:
[
  {"front":"key term or short question","back":"simple clear answer, max 2 lines"},
  {"front":"key term or short question","back":"simple clear answer, max 2 lines"},
  {"front":"key term or short question","back":"simple clear answer, max 2 lines"},
  {"front":"key term or short question","back":"simple clear answer, max 2 lines"},
  {"front":"key term or short question","back":"simple clear answer, max 2 lines"}
]

Rules:
- Keep front under 10 words
- Keep back under 20 words
- Use simple Nigerian English
- Focus on the most important concepts`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Pathfinder'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  const data = await response.json();
  const text = data.choices[0].message.content;

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}