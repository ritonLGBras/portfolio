# Mayday Academy

## Problem

Onboarding new customer service agents is slow and expensive. Training materials live separately from the knowledge base agents use daily — meaning agents learn content in one place and look up answers in another, creating a disconnect that slows ramp time.

## My Role

Led the engineering of Mayday Academy, designing the architecture that embeds training directly into the Mayday knowledge base so agents learn and work in the same environment.

## Stack

- TypeScript / NestJS
- Vue 3
- PostgreSQL
- Mayday core platform APIs

## Outcome

- Training completion rates improved significantly for early adopters
- Reduced time-to-productivity for new agents
- Became a key differentiator in enterprise sales cycles
- Integrated seamlessly with the existing Mayday knowledge base, requiring no duplicate content management

## Code Highlights

The interesting architectural decision was making Academy content and knowledge base content share the same underlying data model — so a knowledge article could simultaneously be a training module without duplication. This required a flexible content graph rather than separate content silos.
