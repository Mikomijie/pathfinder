# Pathfinder — Adaptive Learning for Every Mind

Pathfinder is a neurodiversity-first adaptive learning platform built for students and teachers in Nigeria and West Africa. It adapts how it teaches, not just what it teaches, meeting every learner where they are regardless of how their brain processes information.

## What Problem We Are Solving

In Nigerian classrooms, neurodivergent students — those with ADHD, dyslexia, autism, or slow processing — are consistently mislabeled as lazy, dull, or difficult. The same lesson is delivered the same way to every student regardless of how their brain works. Teachers have no tools to understand why a student struggles. Students fall behind, lose confidence, and disengage entirely.

At university level, ADHD students face an additional crisis. University assumes executive function skills — time management, self-regulation, task initiation, focus — that ADHD brains genuinely struggle with. No Nigerian university teaches these skills. Students fail not because they are unintelligent but because they were never taught how to manage their own brain in an unstructured environment.

Pathfinder solves this by giving every student a patient, adaptive, voice-enabled learning experience that meets them where they are, and by giving every teacher real insight into how each student learns.

## Core Features

### The 4-Level Adaptive Lesson System

Every lesson in Pathfinder has four explanation levels. A student starts at Level 1 and moves deeper only if they need to. There is no penalty for needing more explanation. There is no time pressure.

Level 1 is a simple, plain-language explanation with no jargon. Level 2 is the same concept explained using a real-world analogy rooted in Nigerian daily life. Level 3 is a visual representation — for hardcoded curriculum topics, this is a hand-crafted SVG diagram. For AI-generated topics, it is a structured step-by-step breakdown. Level 4 is an interactive question the student attempts themselves, rendered as clickable answer cards with immediate feedback.

### Voice Support

Every lesson can be listened to rather than read. This is critical for dyslexic learners. The voice system uses the browser's built-in Web Speech API, automatically selecting the best available English voice and reading at a calibrated pace. No API cost. No internet dependency beyond the initial page load.

### Topic Search and AI Lesson Generation

Secondary school students can search any topic beyond the pre-built curriculum. When a student types a topic that does not exist in the database, Pathfinder generates a full 4-level adaptive lesson using OpenRouter AI, saves it to the database, and takes the student directly into the lesson. Every generated lesson becomes part of the shared curriculum for all future students.

### PDF Upload for University Students

University students upload their lecture notes as PDF files or paste text directly. Pathfinder sends the content to a Supabase Edge Function which extracts the text, splits it into chunks, and uses OpenRouter to generate a complete 4-level adaptive lesson for each chunk. A 6000-character document becomes five structured micro-lessons with voice support, all accessible within 30 seconds of upload.

### Skills Hub

A dedicated section for university students covering five categories of executive function skills that Nigerian universities assume students already have but never teach. Each category — Study Skills, Time and Planning, Focus and Attention, Emotional Regulation, and Career Readiness — contains lessons following the same 4-level format, with Level 4 being a concrete action the student can take immediately.

### Quiz System

After each lesson, students take a three-question quiz with immediate per-question feedback. Correct answers turn green instantly. Wrong answers reveal the correct option and an encouraging explanation. The score is saved to the database and contributes to the student's overall progress statistics. After completing a quiz, students are automatically shown the next topic in the subject sequence.

### Flashcard System

Five flashcards per topic with a flip animation, voice support on both sides, and a simple spaced repetition mechanic. Cards marked as known are tracked separately from cards that need more review. After completing a set, students can restart only the cards they struggled with.

### Teacher Dashboard

Teachers create classes and receive a unique class code in the format PATH-XXXX. Students enter this code during signup or from their home page to join the class. Teachers upload materials for each class, which appear in the student's subjects page under a dedicated section. The teacher dashboard shows all students across all classes with their join dates.

### Real Progress Tracking

All progress is stored in Supabase and reflected in real time. The home page shows the next incomplete topic rather than the last studied one, so students always know exactly what to do next. The progress page shows a visual journey map for each subject with clickable topic nodes showing completion status, level reached, and quiz score.

### Class Code System

Teachers create a class and receive a unique code. Students enter the code and are added to the class roster. Teacher-uploaded materials appear in the student's My Subjects page. This creates a direct pipeline from teacher preparation to student learning without any manual distribution of files.

## Student Experience

### Secondary School Students (Primary 1 to SSS 3)

The sidebar contains Home, My Subjects, Flashcards, Progress, and Settings. The home page greets the student by name, shows a dark card with the next incomplete lesson, displays subject progress cards with real data, and includes a daily tip adapted for neurodivergent learners. A class code input field appears for students who did not enter a code at signup.

My Subjects contains a prominent search bar at the top. Below it are the three main subject cards — Mathematics, English Language, and Basic Science — each showing a real progress bar pulled from the database. Students can click any subject to see the full topics list with a visual journey path, or search any topic to access it directly or generate it via AI.

### University Students

University students have all the same features plus Upload Notes and Skills Hub in their sidebar. The home page shows an onboarding screen for new users with three clear starting options: upload notes, search any topic, or open the skills hub. Returning users see their last lesson and quick action buttons.

## Teacher Experience

The teacher home page prominently displays the primary class code for immediate sharing. Quick stats show total students, materials uploaded, and total classes. The My Classes page allows creating multiple classes with auto-generated codes. The Upload Materials page saves material titles and descriptions to the class, which then appear in student dashboards. The Students page shows a roster of all joined students across all classes.

## Technology Stack

The frontend is built with React using Create React App and styled with Tailwind CSS. Authentication and the database are handled by Supabase. PDF processing runs in a Supabase Edge Function written in TypeScript using Deno. AI lesson generation uses OpenRouter with the free model tier. Voice is handled by the browser's built-in Web Speech API at no cost. The application is deployed on Vercel.

## Database Schema

The Supabase database contains the following tables. The profiles table stores all user data including role, grade level, school name, and student level. The classes table stores teacher classes with auto-generated codes. The class_members table links students to classes. The class_materials table stores materials uploaded by teachers. The topics table stores all lesson topics including pre-built curriculum and AI-generated topics. The lessons table stores the four explanation levels for each topic. The quiz_questions table stores five questions per pre-built topic. The student_progress table tracks each student's level reached, completion status, score, and last studied timestamp for every topic they have interacted with.

Row Level Security is enabled on all tables. Students can only read and write their own progress data. Teachers can only manage their own classes and materials.

## Pre-Built Curriculum

The initial curriculum covers nine topics across three subjects. Mathematics includes Introduction to Fractions, Adding Fractions, and Multiplying Fractions. English Language includes Parts of Speech, Punctuation Marks, and Writing a Good Paragraph. Basic Science includes Photosynthesis, The Human Digestive System, and States of Matter. Each topic has a fully written four-level lesson, a custom SVG visual for Level 3, five quiz questions, and five flashcards. All content is written in plain, encouraging language appropriate for Nigerian secondary school students.

## AI Integration

OpenRouter is used as the AI gateway, routing requests to the best available free model. It is used for generating adaptive lessons for any topic a student searches, generating interactive questions for AI-created lessons when no quiz questions exist in the database, processing PDF and pasted text uploads into structured micro-lessons for university students, and generating lesson content for teacher-uploaded materials.

The Supabase Edge Function handles all OpenRouter calls for PDF processing server-side, keeping the API key secure and allowing larger documents to be processed without browser memory constraints.

## Running Locally

Clone the repository and navigate to the frontend directory. Copy the environment variables file and fill in your Supabase project URL, Supabase anon key, and OpenRouter API key. Install dependencies with npm install and start the development server with npm start. The app will run at localhost:3000.

To deploy the Supabase Edge Function, install the Supabase CLI, link to your project using supabase link, set the required secrets using supabase secrets set, and deploy using supabase functions deploy process-pdf.

## Environment Variables

REACT_APP_SUPABASE_URL is the URL of your Supabase project. REACT_APP_SUPABASE_ANON_KEY is the public anon key from your Supabase project settings. REACT_APP_OPENROUTER_KEY is your OpenRouter API key available at openrouter.ai.

The Edge Function requires OPENROUTER_API_KEY set as a Supabase secret. The SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically by Supabase to all Edge Functions.

## Competition Context

Pathfinder was built for two competitions. The Babcock Priority Innovation Challenge on Neurodiversity, titled Different Minds, awards one million naira for the best innovation addressing neurodiversity in Nigerian education. The Qavaa Innovate AI Challenge 2026 awards one thousand US dollars for the best AI-powered solution to a real problem. Pathfinder was submitted to both competitions in September 2026.

## Design Philosophy

Every design decision in Pathfinder was made with neurodivergent learners in mind. The interface uses a calm, consistent color palette with no flashing elements. Text is large and well-spaced. There are no time limits anywhere in the application. Wrong answers are met with encouragement rather than failure states. Progress is framed as a journey rather than a percentage. The focus mode removes the sidebar entirely for distraction-free learning. Daily tips are written specifically for ADHD and dyslexic learners based on evidence from neurodiversity research.

The teacher-facing design prioritizes the class code above all else because that is the first thing a teacher needs. Materials upload is simple and requires only a title, keeping the friction low for teachers who are not technology-confident.

## Contributing

This project is currently maintained as a competition submission. The repository is public for review purposes. Contributions, feedback, and suggestions are welcome via GitHub issues.

## License

MIT
