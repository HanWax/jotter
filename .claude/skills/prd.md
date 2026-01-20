---
name: prd
description: Generate a Product Requirements Document from an implementation plan
---

# PRD Generator Skill

When invoked, this skill generates a comprehensive PRD in markdown format.

## Instructions

1. Read the implementation plan from the specified file (or current context)
2. Generate a PRD with these sections:
   - **Overview**: Product summary, target users, key value proposition
   - **Goals**: Primary objectives and success criteria
   - **User Stories**: Key user journeys in "As a... I want... So that..." format
   - **Functional Requirements**: Detailed feature requirements (MoSCoW prioritized)
   - **Non-Functional Requirements**: Performance, security, scalability
   - **Success Metrics**: KPIs and measurable outcomes
   - **Timeline**: High-level milestones (without time estimates)
   - **Out of Scope**: Explicitly deferred items
   - **Open Questions**: Unresolved decisions
3. Output the PRD to `docs/PRD.md`

## Usage
```
/prd [path-to-plan]
```

If no path provided, use the most recent plan in context or prompt for location.
