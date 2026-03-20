# Ask Mayday

## Problem

Customer service agents spend a significant portion of their time searching for the right answer across scattered knowledge bases, wikis, and internal docs. Every second spent searching is a second not spent helping customers — leading to longer handle times, frustrated agents, and inconsistent answers.

## My Role

Core contributor on the engineering side. Worked closely with the AI team (Victor Benichoux) to design and implement the RAG pipeline, integrate LLM APIs, and ship the feature into the production Mayday platform.

## Stack

- TypeScript / NestJS (backend API)
- Vue 3 (frontend integration)
- RAG pipeline with vector search
- LLM APIs (OpenAI-compatible)
- PostgreSQL

## Outcome

- Deployed to 100+ enterprise customers including Fnac Darty, Doctolib, Qonto, EDF, Free, and Edenred
- Agents get accurate, sourced answers in seconds instead of minutes
- Measurable reduction in average handle time for early adopters
- Established Mayday as the category leader for AI-powered knowledge management in France

## Code Highlights

The core challenge was making RAG reliable enough for production. The key insight was treating retrieval quality as a first-class concern — not just finding semantically similar chunks, but ranking them by recency, source authority, and query intent before passing to the LLM.
