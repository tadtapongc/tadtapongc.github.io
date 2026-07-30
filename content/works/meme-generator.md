---
title: MemeAI Generator
subtitle: A modern Next.js platform co-authored with AI, integrating advanced 27B parameter vision models to autonomously generate context-aware meme captions from user-uploaded images.
short_description: "Next.js platform using 27B parameter vision models to autonomously generate context-aware meme captions."
date: 2026-05
category: technical
card_tag: Full-Stack · AI
header_tag: Full-Stack · AI
icon: 😂
thumbnail: /images/meme-generator.jpg
banner: /images/meme-detail.jpg
meta_items:
  - label: Role
    value: Architect & AI Orchestrator
  - label: Timeline
    value: '2026'
  - label: Core Tech
    value: Next.js, Prisma, Qwen3.6 27B, AI Coding Tools
  - label: Live App
    value: Visit Site ↗
    link: https://samsantech-compengess.vercel.app
---

### 1. The Challenge & Objectives
Translating image context into humorous text requires sophisticated multimodal AI. I aimed to bridge this gap by rapidly prototyping a full-stack platform using modern AI development tools. The challenge was orchestrating complex parsing logic and connecting multiple external APIs seamlessly.

Beyond the API integration, the engineering challenge involved guiding the AI to build a resilient parsing system capable of taming unpredictable LLM outputs.

### 2. Architecture & Execution
By taking an architect-first approach, I directed AI code generation to construct a Next.js 14 application that leverages Server Actions for secure API execution.

- <strong>Multimodal Inference:</strong> Guided AI to implement client-side image downscaling and base64 conversion before interfacing with the Qwen3.6 27B vision model via the Groq API.
- <strong>LLM Parsing Fallback Engine:</strong> Collaborated with AI to engineer a robust 3-layer parsing fallback (direct parse, aggressive sanitization, regex extraction), ensuring the application gracefully recovers even if the model hallucinates formatting.
- <strong>Database & Storage:</strong> Prompted the AI to implement efficient base64 encoding strategies with Prisma ORM, persisting image data directly as BLOBs to eliminate external object storage overhead.

> #### Key Engineering Takeaway
>
> "By orchestrating AI development tools, I was able to rapidly integrate multiple disparate technologies—from Next.js Server Actions to multimodal LLM APIs—focusing purely on system architecture and robust fallback logic rather than boilerplate code."

### 3. Results & Impact
The result is a highly performant, interactive platform featuring optimistic UI updates for likes and saves, demonstrating the sheer velocity achievable when combining modern web frameworks with AI-assisted coding.
