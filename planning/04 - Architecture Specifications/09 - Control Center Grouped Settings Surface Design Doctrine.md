---
type: Architecture
subtype: "Design Doctrine"

title: "Control Center Grouped Settings Surface Design Doctrine"
document_id: "WEB-ARCH-DOC-2026-0009-ACT"

classification: Internal
authority_level: Departmental
department: "Website"
office: "Planning / 04 - Architecture Specifications"
owner: "Founder / CEO (Public: ARTAN)"

stakeholders:
  - "Founder / CEO (Public: ARTAN)"
  - "Website Systems & Development Agent (WSDA)"
  - "Design Execution Agent (DXA)"
  - "Debugging & Systems Integrity Agent (DSIA)"
  - "Software Applications Development Agent (SADA)"
  - "Codex / Local Implementation Agents"

legal_sensitive: false
requires_gc_review: false
requires_creo_review: true
approval_status: Approved

gsa_protocol: "Pending Website Propagation"
gsa_approved: false

status: Active
lifecycle: Architecture Locked
system: "Website-Governed"

spine_version: "1.4"
template_lock: "Global-Metadata-Standard-v1.6"
version: "1.2.0"

created_date: "2026-05-03"
last_updated: "2026-05-03"
last_reviewed: "2026-05-03"
review_cycle: "As Needed"

effective_date: "2026-05-03"

publish: false
publish_to_website: false
featured: false
visibility: Internal
institutional_visibility: Departmental

scope:
  - "Control Center Grouped Settings Surface Design System"
  - "Stage Section Reference Implementation"
  - "Apple-Style Grouped Settings Surface Pattern"
  - "Radio List and Toggle Control Ownership"
  - "Interaction Settings Typography and Spacing Tokens"
  - "Website Menu and Settings Surface Propagation"
  - "Control Center Header Reference System"
  - "Control Center Nested Panel Navigation System"
  - "Stage-Native Radio and Toggle Primitive Propagation"
  - "Apple-Native Nested Settings Architecture"
  - "Reusable Platform Menu Nested Surface Architecture"
  - "Global Drill-In Row and Back Navigation Primitive Planning"

index_targets:
  - "Website Planning Index"
  - "Architecture Specifications Index"
  - "Implementation Change Log"

vault_path: "planning/04 - Architecture Specifications/09 - Control Center Grouped Settings Surface Design Doctrine.md"

related:
  - "planning/04 - Architecture Specifications/02 - Website Modular Architecture Doctrine.md"
  - "planning/08 - Implementation Change Logs/01 - AI Development Cockpit Implementation Change Log.md"
  - "docs/assets/fragments/layers/website/home/interaction-settings/sections/stage.html"
  - "docs/assets/css/layers/website/home/interaction-settings/interaction-settings-shell.css"
  - "docs/assets/css/core/03-primitives/radio-list.css"
  - "docs/assets/js/core/01-foundation/radio-list.js"
  - "docs/assets/js/layers/website/home/interaction-settings/sections/stage.js"
  - "docs/assets/fragments/layers/website/home/interaction-settings/00-interaction-settings-shell.html"

tags:
  - "website"
  - "control-center"
  - "design-doctrine"
  - "grouped-settings"
  - "stage"
  - "radio-list"
  - "nested-panels"
  - "section-header"
  - "stage-native-primitives"
  - "apple-native-settings"
  - "platform-menu"
  - "drill-in-navigation"
---

## I. Purpose

This doctrine defines the approved grouped settings surface system for the Neuroartan Control Center.

It records the confirmed Stage section as the canonical implementation model for all current and future Control Center sections, menu settings, and comparable grouped configuration interfaces across the website.

This document exists so implementation agents can reproduce the approved structure without reinterpretation, approximation, duplicated ownership, cursor overrides, or visual drift.

---

## II. Approved Source Reference

Canonical approved implementation reference:

```text
/Users/artan/Documents/Neuroartan/website/docs/assets/fragments/layers/website/home/interaction-settings/sections/stage.html
```

Canonical Control Center shell style owner:

```text
/Users/artan/Documents/Neuroartan/website/docs/assets/css/layers/website/home/interaction-settings/interaction-settings-shell.css
```

Canonical reusable radio-list primitive:

```text
/Users/artan/Documents/Neuroartan/website/docs/assets/css/core/03-primitives/radio-list.css
```

Canonical reusable radio-list behavior owner:

```text
/Users/artan/Documents/Neuroartan/website/docs/assets/js/core/01-foundation/radio-list.js
```

Canonical Stage behavior owner:

```text
/Users/artan/Documents/Neuroartan/website/docs/assets/js/layers/website/home/interaction-settings/sections/stage.js
```

---

## III. Design Principle

The approved system follows an Apple-style grouped settings surface model.

Each functional category appears as a titled group with a rounded surface beneath it. Rows live inside the grouped surface. Separators appear only between rows. Individual rows do not use independent card borders, heavy hover effects, active shadows, or decorative state overlays.

The interface must remain quiet, direct, and operational.

---

## IV. Required Group Structure

Every section using this doctrine must follow this hierarchy:

```text
Section Header
Group Title
Grouped Surface
Row
Row Separator
Row
```

The approved Stage structure is:

```text
Stage
Mode
Visibility
Motion
Density
Contrast
Background Depth
```

Each group must represent one clear functional category.

If one category contains two different control types, the controls may appear as subgroups inside that category only when they remain visually separated by the approved subgroup spacing token.

---

## V. Control Type Rules

### A. Radio List

Radio lists are used only when options are mutually exclusive inside one clear group.

Examples:

```text
Mode: Standard / Developer Focus / Minimal / Presentation
Motion intensity: Full / Reduced / Minimal
Density: Comfortable / Compact
Contrast: Standard / Soft / High
Background Depth: Cinematic / Clean / Flat
```

Only one radio item may be active per radio group.

### B. Toggle

Toggles are used only for independent on/off controls.

Examples:

```text
Interactive circle
Footer visibility
Ambient layer
Idle animation
Visual feedback
```

Toggles must not be represented as radio lists.

### C. Static Rows

Static rows must not be used for controls that appear selectable unless there is a real operational selection mechanism.

The prior Stage contrast and Background Depth static rows were rejected because they appeared selectable while exposing no alternative choices.

---

## VI. Interaction Ownership Rule

Only the actual control may own interaction.

For radio lists, the radio control button owns the setting attribute and interaction.

For toggles, the toggle button owns the setting attribute and interaction.

Text, descriptions, row surfaces, empty row areas, and grouped surfaces must not own setting attributes or trigger state changes.

Approved ownership pattern:

```text
Row = visual container
Text = non-interactive content
Description = non-interactive content
Radio button = interactive owner
Toggle button = interactive owner
```

No cursor overrides are permitted to simulate interactivity or non-interactivity.

Cursor behavior must emerge from correct HTML ownership, not CSS cursor manipulation.

---

## VII. Cursor Rule

Do not add cursor override rules to solve interaction ownership.

Forbidden as a fix strategy:

```css
cursor:pointer;
cursor:default;
```

The correct fix is structural:

```text
Use non-interactive row containers
Use real button elements only for the radio control and toggle switch
Place data-home-interaction-setting only on the actual interactive control
```

---

## VIII. Text and Description Rule

Labels, descriptions, and section headers share one Control Center text ownership layer.

The approved active state is:

```text
Section description visible in the section header
Row-level descriptions preserved in markup but visually disabled for this Control Center surface
Inner item labels use the same typography tokens as the left navigation items
```

Radio-list item labels and toggle row labels must consume the same text tokens as the left Control Center navigation labels.

Approved inner item label token ownership:

```css
color:var(--home-interaction-settings-panel-nav-color);
font-size:var(--home-interaction-settings-panel-nav-font-size);
font-weight:var(--home-interaction-settings-panel-nav-font-weight);
line-height:var(--home-interaction-settings-panel-nav-line-height);
```

The radio-list primitive must not independently own Control Center typography.

Control Center typography ownership belongs in:

```text
interaction-settings-shell.css
```

The reusable primitive may provide structure, but local product typography must be inherited from the shell owner.

---

## IX. Row Description Visibility Rule

The approved row text markup preserves both label and description.

Approved semantic structure:

```text
Label
Description retained in markup
```

For the current Control Center surface, row-level descriptions are visually disabled through CSS rather than deleted from HTML.

Approved CSS behavior:

```css
.home-interaction-settings-panel__radio-list .ui-radio-list__description,
.home-interaction-settings-panel__toggle-row .home-interaction-settings-panel__option-description{
  display:none;
}
```

This preserves future reuse while keeping the current surface quiet, Apple-style, and operational.

---

## X. Period Rule

Control Center descriptions and Stage row descriptions do not end with periods.

Approved:

```text
Balanced depth and feedback for normal use
```

Rejected:

```text
Balanced depth and feedback for normal use.
```

This applies to tab descriptions, row descriptions, and concise platform-facing settings language.

---

## XI. Group Surface Tokens

The grouped settings surface is owned by the Control Center shell.

Approved token layer:

```css
--home-interaction-settings-control-group-gap:var(--spacing-none);
--home-interaction-settings-control-group-padding-top:var(--spacing-xl);
--home-interaction-settings-control-group-title-margin-bottom:var(--spacing-sm);
--home-interaction-settings-control-group-surface-bg:var(--home-interaction-settings-panel-control-bg);
--home-interaction-settings-control-group-surface-border:var(--home-interaction-settings-panel-header-separator);
--home-interaction-settings-control-group-surface-radius:var(--home-interaction-settings-panel-control-radius);
--home-interaction-settings-control-group-row-padding-y:var(--spacing-sm);
--home-interaction-settings-control-group-row-padding-x:var(--spacing-md);
--home-interaction-settings-control-group-row-separator:var(--home-interaction-settings-panel-header-separator);
--home-interaction-settings-control-subgroup-gap:var(--spacing-sm);
```

Group spacing must use these tokens or their canonical successors.

Hardcoded spacing is not permitted.

---

## XII. Section Header System

The approved Control Center section header is now modeled after the finalized Stage header.

Each section header must contain:

```text
Icon and section title on the first row
Section description below the icon/title row
Description aligned to the same left edge as the icon row
Thin separator between header and content
```

Approved header structure:

```html
<header class="home-interaction-settings-panel__section-heading home-interaction-settings-panel__section-heading--with-icon">
  <div class="home-interaction-settings-panel__section-title-row">
    <span class="home-interaction-settings-panel__section-icon" aria-hidden="true">
      <img class="ui-icon-theme-aware" src="/assets/icons/core/system/unclassified/stage.svg" alt="">
    </span>
    <h3 class="home-interaction-settings-panel__section-title">Stage</h3>
  </div>
  <p class="home-interaction-settings-panel__section-description">Adjust the visual interaction environment</p>
</header>
```

The old top-shell active description beside the Control Center title is disabled for this Control Center surface and preserved only as reusable shell infrastructure.

The approved section header tokens include:

```css
--home-interaction-settings-section-gap:var(--spacing-xl);
--home-interaction-settings-section-padding-bottom:var(--spacing-xl);
--home-interaction-settings-section-icon-size:var(--layout-interaction-settings-section-icon-size-large, calc(var(--home-interaction-settings-panel-icon-size) * 1.6));
--home-interaction-settings-section-icon-gap:var(--layout-interaction-settings-section-icon-gap, calc(var(--home-interaction-settings-panel-nav-item-gap) * 1.25));
--home-interaction-settings-section-header-padding-top:var(--spacing-none);
--home-interaction-settings-section-header-padding-bottom:var(--home-interaction-settings-panel-inner-padding-top);
--home-interaction-settings-section-header-separator:var(--home-interaction-settings-panel-header-separator);
--home-interaction-settings-section-title-color-prominent:var(--home-interaction-settings-panel-nav-hover-color);
--home-interaction-settings-section-title-size-large:var(--layout-interaction-settings-section-title-size-large, calc((var(--home-interaction-settings-title-size) + var(--home-interaction-settings-panel-nav-font-size)) / 2));
--home-interaction-settings-section-copy-gap:var(--layout-interaction-settings-section-copy-gap, var(--spacing-sm));
--home-interaction-settings-section-description-color:var(--home-interaction-settings-active-description-color);
--home-interaction-settings-section-description-size:var(--home-interaction-settings-active-description-size);
--home-interaction-settings-section-description-weight:var(--home-interaction-settings-active-description-weight);
--home-interaction-settings-section-description-line-height:var(--home-interaction-settings-active-description-line-height);
```

The icon and title must be visually centered against each other through the shared section title row system.

The section title size must remain token-driven. The current approved title size is the midpoint between the previous large title and the left navigation label size.

All section headers must use real icon assets through `ui-icon-theme-aware` instead of placeholder glyphs.

Section descriptions belong inside the section header. Row-level descriptions remain present in markup but are visually disabled through CSS for this Control Center surface.

---

## XIII. Separator Rule

Separators appear in three approved places only:

```text
Between section header and content
Between rows inside a grouped surface
Between major shell regions such as sidebar and content
```

Separators must not be used as decorative dividers between every micro-element.

Separators must use theme-aware existing separator tokens.

---

## XIV. Reusable Radio List Primitive

The radio-list primitive exists as a global reusable primitive.

CSS owner:

```text
/Users/artan/Documents/Neuroartan/website/docs/assets/css/core/03-primitives/radio-list.css
```

JavaScript owner:

```text
/Users/artan/Documents/Neuroartan/website/docs/assets/js/core/01-foundation/radio-list.js
```

The primitive must provide:

```text
single-select behavior
right-side radio control placement
radio state synchronization
keyboard support on the actual radio control
reusable structure for future settings surfaces
```

The primitive must not own Control Center-specific typography, shell spacing, or section semantics.

---

## XV. Stage Behavior Ownership

Stage setting behavior is owned by:

```text
/Users/artan/Documents/Neuroartan/website/docs/assets/js/layers/website/home/interaction-settings/sections/stage.js
```

Stage behavior must bind to the actual interactive controls only.

Rows must not be treated as controls.

The body-state attributes remain the operational output layer for visual Stage behavior.

---

## XVI. Rejected Patterns

The following patterns are rejected:

```text
Full-row buttons for radio rows
Full-row buttons for toggle rows
Cursor overrides to simulate clickable or non-clickable areas
Hover overlays on rows
Active shadows on setting rows
Independent card borders on each item
Static rows that look selectable but expose no choices
Duplicated typography ownership between primitive and shell
Descriptions appearing and disappearing on hover
Multiple unrelated radio groups inside one visual group without clear group titles
Hardcoded spacing or one-off visual compensation
```

---

## XVII. Required Implementation Pattern for New Sections

When implementing a new Control Center section, agents must follow this sequence:

```text
1. Define clear groups
2. Determine whether each control is radio or toggle
3. Use grouped settings surface wrappers
4. Use row separators only inside grouped surfaces
5. Use right-side controls
6. Keep text and descriptions non-interactive
7. Apply no cursor overrides
8. Remove periods from concise UI descriptions
9. Reuse Control Center shell tokens
10. Verify one active radio item per radio group
```

---

## XVIII. Propagation Requirement

This doctrine must be applied to all future Control Center sections and comparable menu settings surfaces.

The Stage section is the approved reference implementation.

Other sections must not be restyled independently if they are intended to follow this system.

Changes to this system must be made at the shared token or primitive level first, then propagated through compliant section markup.

---

## XIX. Current Approval State

The grouped settings surface system is approved for the Stage section and propagated to the remaining Control Center sections.

Approved elements include:

```text
Stage header with icon
Unified section headers across all Control Center sections
Section descriptions inside the section header
Disabled top-shell active description for the Control Center surface
Apple-style grouped surfaces
Group titles
Rounded group containers
Thin row separators
Right-side radio and toggle controls
Stage-native ui-radio-list primitive
Stage-native toggle primitive
No terminal periods in UI descriptions
Root interaction ownership on actual controls only
Reusable radio-list primitive
Control Center shell text ownership
Left-navigation typography tokens reused for inner setting labels
Row descriptions preserved in markup and visually hidden through CSS
```

The following section baseline was verified during implementation:

```text
accessibility.html: header=1 icon=1 description=1 ui_radio=1 toggles=1
changelog.html: header=1 icon=1 description=1 ui_radio=1 toggles=2
chat-history.html: header=1 icon=1 description=1 ui_radio=0 toggles=2
developer.html: header=1 icon=1 description=1 ui_radio=0 toggles=2
memory.html: header=1 icon=1 description=1 ui_radio=1 toggles=3
model.html: header=1 icon=1 description=1 ui_radio=1 toggles=0
overview.html: header=1 icon=1 description=1 ui_radio=0 toggles=0
privacy.html: header=1 icon=1 description=1 ui_radio=0 toggles=2
response.html: header=1 icon=1 description=1 ui_radio=1 toggles=2
session.html: header=1 icon=1 description=1 ui_radio=0 toggles=2
stage.html: header=1 icon=1 description=1 ui_radio=5 toggles=5
voice.html: header=1 icon=1 description=1 ui_radio=0 toggles=2
workspace.html: header=1 icon=1 description=1 ui_radio=1 toggles=0
```

---

## XX. Apple-Native Nested Settings Architecture

The next approved design direction is an Apple-native nested settings architecture for Control Center sections and future Platform Menu surfaces.

The model follows the native settings pattern:

```text
Left navigation remains stable
Right panel shows the selected parent section
A drill-in row opens a child panel inside the same right panel
The parent panel gives its space to the child panel
A back control appears in the shell header area
The user can return to the parent section without resetting the left navigation
```

This must behave like a settings environment, not like a modal, overlay, external page, or duplicated shell.

The first pilot is Session.

Example flow:

```text
Control Center
Session
Active chat
```

When the user selects `Active chat`, the Session surface is replaced by the Active chat child surface inside the same right panel.

The nested panel must feel like a continuation of the same surface, with the same header rhythm, grouped surface logic, row tokens, icon system, and interaction ownership rules.

This architecture is intended to be reused later for the Platform Menu, where the current menu system is not yet mature enough to support deeper Apple-native navigation.

---

## XXI. Folder-Based Section Module Rule

Every Control Center section may eventually be promoted from a single flat HTML fragment into a folder-based section module.

Current flat model:

```text
sections/session.html
```

Approved future module model:

```text
sections/session/
  index.html
  active-chat.html
  reset-behavior.html
  persistence.html
```

The `index.html` file owns the parent section surface.

Child files own deeper nested panel surfaces.

The left Control Center navigation must continue to point to the parent section route, while the right panel may move deeper into child surfaces.

All section folders must be registered through the fragment authority system before runtime loading is treated as canonical.

No folder or file creation may occur without a live rescan and explicit structural approval.

No flat-to-folder conversion may occur by assumption.

The current flat files remain valid until the folder-based structure is scanned, mapped, approved, created, registered, and verified.

---

## XXII. Global Drill-In Row and Back Navigation System

Nested panel rows must use a reusable drill-in row primitive.

A drill-in row is not a toggle and not a radio list.

Approved drill-in row behavior:

```text
Row represents navigation into a child settings surface
Right-side accessory icon indicates entry
Actual navigation ownership belongs to the approved control element
Text remains calm and non-decorative
No cursor overrides
No overlay panels
No duplicated shell
```

The right-side accessory must be token-based and reusable.

The drill-in row primitive must be usable in:

```text
Control Center
Platform Menu
Future website settings surfaces
Future application settings surfaces
```

When a nested panel is active, the shell must expose a reversible navigation state.

Approved shell behavior:

```text
Control Center title remains stable
A back control appears near the Control Center title area
The active nested panel owns the right panel content
The parent section can be restored without resetting Control Center state
The left navigation remains intact
```

The previously disabled top active-description system may remain available as reusable shell infrastructure, but it must not be reintroduced as a visible description layer for the current Control Center section headers.

Required global primitive candidates:

```text
Drill-in row primitive
Accessory icon primitive
Back control primitive
Nested panel state controller
Section module loader
Nested panel breadcrumb or context label
Fragment authority registration pattern
```

These primitives must be implemented cleanly from root ownership and not patched onto individual rows.

---

## XXIII. Next Implementation Sequence

The next implementation phase must follow this sequence:

```text
1. Rescan the Control Center section folder and shell files
2. Rescan fragment authority and include registration files
3. Map current flat section ownership
4. Map the required folder-based section module structure
5. Define the reusable drill-in row primitive
6. Define the accessory icon primitive
7. Define the nested panel state controller
8. Define the shell back-control location and behavior
9. Register the section-folder loading model through fragment authority
10. Implement the pattern first in Session as the pilot section
11. Verify visual and runtime behavior
12. Propagate only after Session is approved
13. Record the approved pattern for Platform Menu reuse
```

The Stage section remains the visual baseline for surface styling, header rhythm, typography, icon alignment, token usage, primitive ownership, and no-overlay execution.

The Session nested panel pilot must not start until the fragment authority path and runtime ownership are scanned and mapped.

---

## XXIV. Platform Menu Reuse Requirement

The nested settings architecture must be documented and implemented as a reusable website system, not as a Control Center-only feature.

The Platform Menu is an intended downstream consumer of this system.

The Platform Menu must eventually be able to reuse:

```text
Grouped surface tokens
Section header system
Drill-in row primitive
Accessory icon primitive
Back control primitive
Nested panel state controller
Folder-based module structure
Fragment authority registration model
```

This prevents the Platform Menu from becoming a separate immature system with duplicated logic, duplicated visual rules, or independent navigation behavior.

The Control Center Session pilot is the proof model.

After Session is approved, the architecture must be propagated into a global reusable primitive layer before Platform Menu adoption.

---

## Change Log

- 2026-05-03 — v1.2.0 Expanded the doctrine into an Apple-native nested settings architecture specification. Documented the folder-based section module direction, drill-in row primitive requirement, reusable back-navigation system, fragment authority registration requirement, Session pilot sequence, and future Platform Menu reuse requirement. Operator Name: Artan. Operator Personnel ID: CEO-001-01-01. Agent Name: Website Systems & Development Agent (WSDA). Agent ID: A-0205-0022. Execution Date: 2026-05-03. Execution Context: Apple-native nested settings architecture planning and reusable Platform Menu propagation requirement.
- 2026-05-03 — v1.1.0 Baseline locked after Control Center surface propagation and final header refinement. Recorded unified Stage-native section headers, token-based icon/title/description system, disabled top-shell active description for the Control Center surface, hidden row-level descriptions through CSS while preserving markup, Stage-native radio and toggle primitive propagation, left-navigation typography token reuse for inner item labels, and the next-phase nested panel architecture direction for drill-in rows and reversible Control Center subpanels. Operator Name: Artan. Operator Personnel ID: CEO-001-01-01. Agent Name: Website Systems & Development Agent (WSDA). Agent ID: A-0205-0022. Execution Date: 2026-05-03. Execution Context: Control Center baseline lock, Stage-style propagation, and nested panel architecture planning.
- 2026-05-03 — v1.0.0 Initial doctrine created and normalized. Established the Stage section as the canonical grouped settings surface reference for Control Center, menu settings, and comparable website configuration interfaces. Bound the approved grouped surface model, radio-list primitive, toggle ownership, typography ownership, spacing tokens, separator rules, period rule, interaction ownership rule, and no-cursor-override rule into a reusable architecture specification. Operator Name: Artan. Operator Personnel ID: CEO-001-01-01. Agent Name: Website Systems & Development Agent (WSDA). Agent ID: A-0205-0022. Execution Date: 2026-05-03. Execution Context: Control Center Stage section design finalization and global website design-system doctrine creation.

---

## Document Control & Validation

GSA PROTOCOL STATUS: Pending Website Propagation  
GSA APPROVAL: false  
DOCUMENT STATUS: Active — Architecture Locked  
VISIBILITY: Internal  
PUBLISH TO WEBSITE: No  
VERSION: 1.2.0

---

END OF DOCUMENT