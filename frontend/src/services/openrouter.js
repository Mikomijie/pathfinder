const OPENROUTER_KEY = process.env.REACT_APP_OPENROUTER_KEY;
const MODEL = 'openrouter/free';

async function callOpenRouter(prompt, maxTokens = 400) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://pathfinder-git-main-mikomijies-projects.vercel.app',
      'X-Title': 'Pathfinder'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a patient, encouraging teacher for neurodivergent students in Nigeria. Output ONLY raw valid JSON. Do NOT use markdown code blocks or backticks. Just raw JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${response.status} — ${err}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error('Empty response from OpenRouter');
  }

  let content = data.choices[0].message.content;
  content = content
    .replace(/^```json\n?/i, '')
    .replace(/^```\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();

  return content;
}

export async function generateInteractiveQuestion(topicTitle, lessonText) {
  try {
    const prompt = `Generate ONE multiple choice question about: "${topicTitle}"
Based on: "${(lessonText || '').slice(0, 600)}"

Return this exact JSON structure:
{"question":"your question here","options":["option A","option B","option C","option D"],"answer":0,"explanation":"brief encouraging explanation"}

answer = index (0-3) of correct option. Keep language simple and encouraging.`;

    const text = await callOpenRouter(prompt, 300);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('generateInteractiveQuestion error:', err);
    return null;
  }
}

export async function generateQuiz(topicTitle, lessonText) {
  try {
    const prompt = `Generate exactly 3 multiple choice questions about: "${topicTitle}"
Based on: "${(lessonText || '').slice(0, 600)}"

Return this exact JSON array:
[{"question":"q1","options":["A","B","C","D"],"answer":0,"explanation":"explanation"},{"question":"q2","options":["A","B","C","D"],"answer":1,"explanation":"explanation"},{"question":"q3","options":["A","B","C","D"],"answer":2,"explanation":"explanation"}]

answer = index (0-3) of correct option. Keep language simple.`;

    const text = await callOpenRouter(prompt, 600);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array in response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('generateQuiz error:', err);
    return null;
  }
}

export async function generateFlashcards(topicTitle, lessonText) {
  try {
    const prompt = `Extract 5 key concept pairs from this lesson about: "${topicTitle}"
Lesson: "${(lessonText || '').slice(0, 600)}"

Return this exact JSON array:
[{"front":"key term or short question","back":"simple clear answer under 20 words"},{"front":"key term","back":"answer"},{"front":"key term","back":"answer"},{"front":"key term","back":"answer"},{"front":"key term","back":"answer"}]`;

    const text = await callOpenRouter(prompt, 500);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array in response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('generateFlashcards error:', err);
    return null;
  }
}

export async function generateLessonFromText(topicTitle, subject, contentText) {
  try {
    const prompt = `Create a complete adaptive lesson about: "${topicTitle}" for subject: "${subject}"
Content to base it on: "${contentText.slice(0, 2000)}"

Return this exact JSON:
{"level_1":"Simple clear explanation in 3-4 sentences. Plain language.","level_2":"Same concept using a real-world analogy from Nigerian daily life. 3-4 sentences.","level_3":"Break into numbered steps. Format: Step 1: ... Step 2: ... etc","level_4":"One reflective question. Start with Think about this:"}`;

    const text = await callOpenRouter(prompt, 800);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('generateLessonFromText error:', err);
    return null;
  }
}