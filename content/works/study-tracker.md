---
title: "Paced Study Tracker"
subtitle: "A centralized academic management dashboard co-architected with AI, featuring dynamic timeline triage, markdown note parsing, and JSONB cloud synchronization."
short_description: "Paced Study Tracker"
date: "2026-05"
category: "technical"
card_tag: "Full-Stack · Productivity"
header_tag: "Full-Stack · Productivity"
icon: "📚"
thumbnail: "/images/study.jpg"
banner: "/images/study-detail.jpg"
meta_items:
  - label: "Role"
    value: "Architect & AI Orchestrator"
  - label: "Timeline"
    value: "2026"
  - label: "Core Tech"
    value: "Next.js 14, Drizzle ORM, AI Pair Programming"
  - label: "Live App"
    value: "Visit Site ↗"
    link: "https://getpaced.vercel.app"
---

<article class="content-block fade-in">
        <h3>1. The Challenge & Objectives</h3>
        <p>
          Academic workflows are frequently fragmented across disparate syllabi, calendars, and note-taking silos. The objective was to engineer a singular, high-performance interface to unify this experience. By utilizing AI-assisted development, I focused heavily on data architecture and user experience, delegating the boilerplate generation to the AI.
        </p>
        <p>
          The core challenge was orchestrating the AI to model highly relational academic data efficiently, avoiding expensive multi-table joins in PostgreSQL.
        </p>
      </article>

      <article class="content-block fade-in">
        <h3>2. Architecture & Execution</h3>
        <p>
          Constructed with Next.js 14 utilizing the App Router, I served as the primary architect, directing the AI to implement a fluid, desktop-class user experience backed by a unique document-oriented data model.
        </p>
        <ul>
          <li><strong>Document-Oriented SQL via JSONB:</strong> Directed the AI to leverage PostgreSQL's native <code>jsonb</code> datatype through Drizzle ORM. The complete academic hierarchy is encapsulated as a single JSON document, radically reducing read/write latency.</li>
          <li><strong>Algorithmic Dashboard Triage:</strong> Guided the AI to construct a bespoke triage engine that aggregates tasks across active courses, intelligently categorizing items into Overdue, In-Progress, and Upcoming states.</li>
          <li><strong>Secure Markdown Engine:</strong> Orchestrated the integration of the <code>marked</code> library with a custom AST Renderer, prompting the AI to aggressively sanitize outputs via <code>DOMPurify</code> to guarantee strict protection against XSS vulnerabilities.</li>
        </ul>
      </article>

      <div class="highlight-card fade-in">
        <h4>Key Engineering Takeaway</h4>
        <p>
          "Collaborating with AI allowed me to boldly experiment with a JSONB document-oriented schema within a traditional SQL database. The AI seamlessly translated this architectural vision into reality, resulting in instantaneous client-side interactions paired with transparent cloud persistence."
        </p>
      </div>

      <article class="content-block fade-in">
        <h3>3. Results & Impact</h3>
        <p>
          Paced delivers a frictionless, real-time experience yielding zero perceptible load times, proving that modern full-stack architecture coupled with AI orchestration can produce production-grade platforms at incredible speed.
        </p>
      </article>
