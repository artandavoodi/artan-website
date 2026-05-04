---
type: Workflow Specification
subtype: "Repository Development Workflow"

title: "Repository Development Workflow Specification"
document_id: "NA-WEBSITE-PLANNING-WORKFLOW-SPEC-0001"

classification: Internal
authority_level: Departmental
department: "Website Systems & Development"
office: "Website Planning"
owner: "Website Systems & Development Agent"

stakeholders:
  - "Founder / CEO"
  - "Website Systems & Development Agent"
  - "Developer Operations"
  - "GitHub Repository Workflow"
  - "Codex"

legal_sensitive: false
requires_gc_review: false
requires_creo_review: true
approval_status: Draft

gsa_protocol: "Pending Founder Validation"
gsa_approved: false

status: Active
lifecycle: Draft
system: "Website Planning"

spine_version: "1.0"
template_lock: "Global Document Metadata Standard"
version: "0.2"

created_date: "2026-05-02"
last_updated: "2026-05-04"
last_reviewed: "2026-05-04"
review_cycle: "Weekly"

effective_date: "2026-05-02"

publish: false
publish_to_website: false
featured: false
visibility: Internal
institutional_visibility: Departmental

scope:
  - "Repository development workflow"
  - "Terminal scan generation"
  - "Exact file targeting"
  - "Patch instruction workflow"
  - "GitHub commit message workflow"
  - "Developer Operations Console terminal dock planning"
  - "Full View console command and scan surface planning"
  - "Approval-gated terminal execution flow"
  - "Developer runtime and log console workflow"

index_targets:
  - "Website Planning Index"
  - "Repository Workflow Register"
  - "AI Development Cockpit Planning Layer"

vault_path: "/Users/artan/Documents/Neuroartan/website/planning/06 - GitHub & Terminal Workflows/01 - Repository Development Workflow Specification.md"

related:
  - "/Users/artan/Documents/Neuroartan/website/planning/00 - Index & Dashboards/00 - Website Planning Index.md"
  - "/Users/artan/Documents/Neuroartan/website/planning/01 - Strategic Decisions/01 - Web App Development Continuity Decision.md"
  - "/Users/artan/Documents/Neuroartan/website/planning/02 - Execution Roadmaps/01 - Thirty Day AI Development Cockpit Roadmap.md"
  - "/Users/artan/Documents/Neuroartan/website/planning/03 - Codex Prompt Queue/01 - Codex Daily Prompt Queue.md"
  - "/Users/artan/Documents/Neuroartan/website/planning/04 - Architecture Specifications/01 - AI Development Cockpit Architecture Specification.md"
  - "/Users/artan/Documents/Neuroartan/website/planning/05 - Provider & Runtime Strategy/01 - Model Provider Strategy.md"
  - "/Users/artan/Documents/Neuroartan/website/planning/07 - Daily Execution Records/01 - Daily Execution Log.md"
  - "/Users/artan/Documents/Neuroartan/website/planning/04 - Architecture Specifications/03 - Developer Mode Architecture Specification.md"
  - "/Users/artan/Documents/Neuroartan/website/planning/04 - Architecture Specifications/04 - AI Coding Agent Runtime Specification.md"
  - "/Users/artan/Documents/Neuroartan/website/docs/assets/fragments/layers/website/development-cockpit/developer-operations-console-directive.html"

tags:
  - "website-planning"
  - "repository-workflow"
  - "terminal-scan"
  - "github-workflow"
  - "development-continuity"
  - "developer-operations-console"
  - "developer-console-full-view"
  - "developer-console-terminal-dock"
  - "approval-gated-terminal"
  - "runtime-logs"
---

# Repository Development Workflow Specification

---

## 1. Specification Purpose

This document defines the repository development workflow for the AI Development Cockpit.

The workflow exists to preserve a precise development rhythm across terminal scans, exact file targeting, patch instruction generation, GitHub commit message preparation, verification, and next-action control.

---

## 2. Operating Principle

The repository workflow must remain simple, modular, and human-operable.

The cockpit should generate precise commands and instructions. It does not need to directly automate every repository action in the first cycle.

The workflow must preserve the established pattern:

1. scan
2. identify owner
3. open exact file
4. apply controlled change
5. verify result
6. prepare commit message
7. define next action

---

## 3. Active Root Boundary

The active institutional root is:

`/Users/artan/Documents/Neuroartan`

The active website root is:

`/Users/artan/Documents/Neuroartan/website`

The cockpit must never assume deprecated paths.

All generated repository commands must use verified active roots.

---

## 4. Repository Scope Registry

The cockpit should support repository scope selection through a data registry.

Required scope categories:

| Scope | Root |
|---|---|
| Website | `/Users/artan/Documents/Neuroartan/website` |
| Software | `/Users/artan/Documents/Neuroartan/software` |
| Office | `/Users/artan/Documents/Neuroartan/office` |
| Vault | `/Users/artan/Documents/Neuroartan/I` |
| Developer | `/Users/artan/Documents/Neuroartan/developer` |

The registry should prevent hardcoded root paths inside workflow modules.

---

## 5. Terminal Scan Generator

The terminal scan generator should produce commands that reveal structure without polluting results with build artifacts.

Default exclusions should include:

- `.git`
- `node_modules`
- `.next`
- `dist`
- `build`
- derived data
- cache directories

A scan command should clearly state:

- active root
- scan purpose
- included file types
- excluded directories
- output limit

---

## 6. File Target Selector

The file target selector should support exact-path workflows.

It should generate one file path at a time when a file must be opened.

It must preserve this operating rule:

```text
Open exactly this file next.
```

The cockpit should not ask the user to open a folder when a file is required.

---

## 7. Patch Instruction Generator

The patch instruction generator should convert analysis into precise edit instructions.

Each patch instruction should include:

- target file
- exact owner section when known
- root cause
- required change
- forbidden changes
- verification command

Patch instructions should not contain broad refactoring language unless the full refactor is explicitly approved.

---

## 8. GitHub Commit Message Generator

The GitHub commit message generator should prepare concise commit messages only after verification.

A commit message should include:

- affected layer
- change type
- concise summary
- no exaggerated claims
- no unverified completion language

Example pattern:

```text
website: stabilize platform menu rail toggle icon routing
```

---

## 9. Verification Workflow

Every repository change should be verified before being called complete.

Verification may include:

- terminal scan
- grep confirmation
- browser behavior check
- file diff review
- link/path test
- console test

If behavior has not been observed, the cockpit must label the result as unverified.

---

## 10. No-Overlay Rule

The cockpit must not generate workaround or overlay fixes as final implementation.

A final fix must identify the owner and correct the owner.

If a temporary diagnostic containment is used, it must be labeled temporary and removed before final completion.

---

## 11. No-Hardcode Rule

The cockpit must avoid hardcoding values when a registry, token, metadata field, or configuration source should own them.

Hardcoded values are permitted only when they are static structural references and no registry exists yet.

When a hardcoded value is temporary, the cockpit should mark it for future registry migration.

---

## 12. Codex Workflow Integration
## 12A. Developer Operations Console Terminal Direction

The Developer Operations Console shall eventually include a terminal dock in Full View.

The terminal dock shall not live inside the homepage interaction panel.

The terminal dock shall belong to the Developer Operations Console because it supports developer operations, repository workflow, scan output, command generation, runtime review, and future agent coordination.

The terminal dock shall be introduced only after the following conditions are stable:

- Developer Operations Console Full View shell
- Mini View and Full View state handling
- Full View topbar preservation
- Full View viewport suppression
- tab-template rendering
- parent-token styling inheritance
- one clean scroll owner

The terminal dock may support:

- scan command display
- terminal command proposal
- copyable command output
- local scan result review
- runtime log surface
- agent coordination transcript
- approval-gated execution handoff

The terminal dock must preserve the existing repository workflow:

1. scan
2. identify owner
3. open exact file
4. apply controlled change
5. verify result
6. prepare commit message
7. define next action

The terminal dock must not execute destructive commands automatically.

Any future execution bridge must remain approval-gated and must preserve clear human control.

Codex prompts should use this workflow specification as the execution discipline.

Each Codex prompt should include:

- active root
- target scope
- exact creation or edit boundaries
- forbidden unrelated modifications
- verification command
- expected completion output

Codex should not receive a broad instruction to restructure the whole repository.

---

## 13. Daily Execution Record Link

Every completed workflow should produce a daily execution log entry.

The entry should record:

- date
- objective
- files touched
- verification performed
- result
- blockers
- next action

The daily record preserves continuity when tool access or conversation continuity is limited.

---

## 14. Success Criteria

This workflow is successful when the cockpit can generate:

- clean scan commands
- exact file paths
- patch instructions
- verification commands
- commit messages
- next-action directives
- daily execution log entries
- Developer Operations Console terminal-dock command plans
- Full View scan-output review surfaces
- approval-gated terminal handoff records
- runtime log review surfaces

The workflow should reduce dependency on memory and preserve execution continuity.

---

## Change Log

- 2026-05-04 — v0.2 Added Developer Operations Console terminal dock direction, Full View command and scan surface planning, approval-gated terminal workflow constraints, runtime log review direction, and relationship to the Developer Operations Console architecture. Operator Name: Artan. Operator Personnel ID: CEO-001-01-01. Agent Name: Website Systems & Development Agent. Agent ID: A-0205-0022. Execution Context: Repository Development Workflow propagation for Developer Operations Console under `/Users/artan/Documents/Neuroartan/website`.
- 2026-05-02 — v0.1 Initial repository development workflow specification created for terminal, GitHub, exact-path, and patch-instruction workflows. Operator Name: Artan. Operator Personnel ID: CEO-001-01-01. Agent Name: Website Systems & Development Agent. Agent ID: A-0205-0022. Execution Context: Website planning layer under `/Users/artan/Documents/Neuroartan/website`.

---

## Document Control & Validation

GSA PROTOCOL STATUS: Pending Founder Validation  
GSA APPROVAL: false  
DOCUMENT STATUS: Draft — Repository Development Workflow Specification  
VISIBILITY: Internal  
PUBLISH TO WEBSITE: No  
VERSION: 0.2

---

END OF DOCUMENT