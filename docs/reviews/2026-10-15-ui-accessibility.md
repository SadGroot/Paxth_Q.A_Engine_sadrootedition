# UI, UX and accessibility review — 15 October 2026

The existing product has a useful foundation: one shared SKU workspace, separate QA/Catalog modes, persistent server jobs, source evidence editors and exports. Improve the existing screens before investing in a visual rewrite. The immediate problems are inaccessible selection, misleading QA feedback, understated deletion consequences and a layout that assumes desktop width.

This review applies the upstream **UI Designer**, **UX Architect** and **Accessibility Auditor** profiles in `design/design-ui-designer.md`, `design/design-ux-architect.md` and `testing/testing-accessibility-auditor.md`. They were used as review approaches, not installed as executable software. No product code or dependency was changed by this review.

## Scope and evidence

Reviewed `App.tsx`, dashboard, jobs/results, login, users, attribute sets/editor, scraper, provider settings, notifications, image picker/download and their connected state/API helpers. Findings distinguish source-confirmed behavior, small isolated reproductions and layout inferences. Priority: P1 = blocks a core task or risks data loss; P2 = fix before broad release; P3 = polish or limited privacy exposure.

Initial browser attempts used temporary copies of the existing suites outside the repository. Only import resolution and Vite's `envDir: false`/explicit project root were changed. The original tests remained unchanged, every API was already mocked by those tests, and no `.env`, production database or provider endpoint was used. All three initially stopped before page creation because cached Chromium lacked `libglib-2.0.so.0`; a subsequent isolated browser-library attempt is being evaluated. Runtime outcomes below must be read with that distinction.

This is not a complete WCAG conformance assessment. A real screen reader, voice control, forced colors and 200%/400% zoom have not been tested. No automated axe/Lighthouse run has been completed. Whole-app conformance is **not determined**; the source already contains patterns that need correction.

## Findings

### UI-01 — P1 / Serious: core actions depend on mouse-only selection and disclosure

**Confirmed in source.** The dashboard select-all header and each SKU selection cell use `onClick` on `<th>`/`<td>` and render SVG squares, with no native input, keyboard handler or focusable control: [DashboardModule.tsx:765](../../src/components/DashboardModule.tsx#L765), [DashboardModule.tsx:787](../../src/components/DashboardModule.tsx#L787). These selections gate Create Job and Scrape URLs. Attribute-set selection is similarly an `onClick` on `<li>` at [AttributeSetsModule.tsx:85](../../src/components/AttributeSetsModule.tsx#L85), and QA result expansion is a clickable `<div>` at [JobsModule.tsx:703](../../src/components/JobsModule.tsx#L703). A keyboard user cannot perform these core workflows through the rendered controls.

**Fix:** replace SKU squares with labelled native checkboxes; use a button inside each attribute-set list item and a button with `aria-expanded`/`aria-controls` for QA disclosure. Reuse the existing Catalog disclosure button at `JobsModule.tsx:655`. Preserve visible focus styles. This concerns WCAG **2.1.1 Keyboard**, with exposed control roles/states under **4.1.2 Name, Role, Value**. [W3C keyboard guidance](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html).

**Acceptance:** Tab/Space select two SKUs, select all filtered rows, create a job, select an attribute set and expand a QA result without a pointer. A screen reader announces the selection and disclosure states.

### UI-02 — P1: an unreviewed SKU can receive a green “No issues detected” message

**Confirmed in source.** `const issues = qa?.issues || []` at [JobsModule.tsx:696](../../src/components/JobsModule.tsx#L696) turns a missing QA result into an empty issue list. Expanded results at [JobsModule.tsx:773](../../src/components/JobsModule.tsx#L773) show a green “No issues detected for this SKU!” whenever that list is empty and `sku.error` is absent. A pending, ready or missing-source SKU with no QA result meets that condition.

**Fix:** render success only for a validated completed QA result. Missing QA should say “Not reviewed”; failed, cancelled or stale results need their own explanation. Keep processing completion separate from QA pass/warning/fail. This is a product-trust issue, not an asserted WCAG failure.

**Acceptance:** cover ready/no-result, missing-source/no-result, running, cancelled, failed, stale, completed/pass and completed/warning fixtures. Only completed/pass receives the positive empty-issues treatment.

### UI-03 — P1: Clear All understates the scope of irreversible deletion

**Confirmed across UI and API.** The confirmation names only the number of indexed SKUs at [DashboardModule.tsx:950](../../src/components/DashboardModule.tsx#L950), but `/api/data` deletes **all jobs and SKU data** at [catalog.ts:227](../../src/server/catalog.ts#L227). The context also clears jobs after success at [AppContext.tsx:148](../../src/context/AppContext.tsx#L148). This can surprise an administrator who expects SKU cleanup while preserving job records.

**Fix:** state that the action clears the shared workspace, including jobs and their associated stored results. Show both SKU and job counts and a clear irreversible-action label. Keep the server's active-run protection. Disable the confirmation while its request is in flight and retain the dialog with an error on failure. This is a destructive-action disclosure problem; no additional approval system is needed.

**Acceptance:** populate two jobs and three SKUs; the confirmation describes both, cancellation makes no request, and a rejected deletion keeps data and a useful error visible.

### UI-04 — P2: select-all uses equal counts instead of membership

**Confirmed by an isolated assert reproduction.** Both the checked appearance and toggle use `selectedSkus.size === filteredList.length`, at [DashboardModule.tsx:124](../../src/components/DashboardModule.tsx#L124) and [DashboardModule.tsx:766](../../src/components/DashboardModule.tsx#L766). Select SKU A, then search for SKU B so one row remains: the header appears selected despite B being unselected. Clicking it clears A rather than selecting B.

**Fix:** calculate whether every visible SKU is selected. Give the native select-all checkbox an indeterminate state when some visible rows are selected. Decide explicitly whether filter changes preserve hidden selections; if they do, show “2 selected, 1 hidden” and name the full selection in destructive confirmation.

**Acceptance:** test equal-sized disjoint sets, partial overlaps, empty results and hidden selections. Header state must reflect visible membership, and action counts must match the actual target SKUs.

### UI-05 — P2 / Serious: navigation and workspaces assume a wide viewport

**Source-confirmed layout choices; clipping magnitude needs browser evidence.** The global header holds brand, six admin navigation entries, mode switch, notifications and account in one nonwrapping flex row while the outer page hides overflow: [App.tsx:71](../../src/App.tsx#L71). The dashboard retains five statistic columns at all widths, its table sits inside `overflow-hidden`, and its filter/search row does not stack: [DashboardModule.tsx:618](../../src/components/DashboardModule.tsx#L618), [DashboardModule.tsx:635](../../src/components/DashboardModule.tsx#L635), [DashboardModule.tsx:749](../../src/components/DashboardModule.tsx#L749). Attribute Sets reserves a fixed 256px sidebar even on a 390px screen: [AttributeSetsModule.tsx:60](../../src/components/AttributeSetsModule.tsx#L60). Jobs action groups likewise stay in a single row at `JobsModule.tsx:419,472`.

**Fix:** a compact mobile header with an expandable native navigation menu, a stacked page header/toolbar, `grid-cols-2 md:grid-cols-3 xl:grid-cols-5` stats, and a labelled horizontal-scroll region for the dense table. Collapse the attribute index into a selector/list before the editor at small widths. Allow ordinary pages to scroll vertically; reserve overflow clipping for intentional regions. Evaluate WCAG **1.4.10 Reflow** and **1.4.4 Resize Text** in runtime checks; data tables may retain two-dimensional scrolling, but navigation and actions still must remain reachable.

**Acceptance:** at 320, 390, 768 and 1440 CSS pixels, every module, QA/Catalog mode and account action is reachable; the page does not require horizontal scrolling outside an intentional table; dialogs remain usable with an on-screen keyboard; repeat at 200%/400% zoom.

### UI-06 — P2 / Serious: modal behavior is inconsistent and sometimes absent

**Confirmed in source.** SAP, scraped-data and image editors use native `dialog.showModal()` at [DashboardModule.tsx:985](../../src/components/DashboardModule.tsx#L985), [DashboardModule.tsx:1049](../../src/components/DashboardModule.tsx#L1049) and [CatalogImagePicker.tsx:45](../../src/components/CatalogImagePicker.tsx#L45). In contrast, Job Details is a `<div role="dialog" aria-modal="true">` with no focus movement/trap or Escape handler at [JobsModule.tsx:542](../../src/components/JobsModule.tsx#L542); Users overlays at [UsersModule.tsx:344](../../src/components/UsersModule.tsx#L344) and dashboard deletion overlays at `DashboardModule.tsx:881` have no dialog semantics either. Setting `aria-modal` does not implement modal interaction. The global navigation's z-index 60 also exceeds these ordinary overlays' z-index 50, unlike the native top layer.

**Fix:** reuse the project's native-dialog approach. Give each dialog an accessible name, put initial focus on a sensible field or safe action, keep background inert, handle Escape and restore focus to its trigger. Block dismissal only while a mutation would otherwise leave an ambiguous state. Review WCAG **2.4.3 Focus Order** and **4.1.2 Name, Role, Value**. [W3C modal dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

**Acceptance:** every overlay moves focus inside; repeated Tab/Shift+Tab stays inside; Escape closes when safe; close restores the original trigger; the header cannot be operated through the overlay; the dialog is announced by name.

### UI-07 — P2 / Moderate: muted text and the save button miss normal-text contrast

**Confirmed by calculation of source color values, not screenshot sampling.** W3C relative-luminance calculations give:

| Foreground / background | Ratio | Existing usage |
| --- | ---: | --- |
| `#8C8882` / white | 3.52:1 | 10–12px navigation, labels, descriptions |
| `#8C8882` / `#FDFCFB` | 3.44:1 | body/help text on page background |
| `#8C8882` / `#F5F2EF` | 3.16:1 | table/filter text |
| white / `#7C8370` | 3.93:1 | 11px Attribute Set save button |

See [App.tsx:95](../../src/App.tsx#L95), [DashboardModule.tsx:764](../../src/components/DashboardModule.tsx#L764) and [AttributeSetEditor.tsx:200](../../src/components/AttributeSetEditor.tsx#L200). These are normal-sized text; WCAG **1.4.3 Contrast (Minimum)** calls for 4.5:1, with different rules for sufficiently large text and inactive controls. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

**Fix:** darken semantic muted text and the olive action color once, then replace repeated literals with a small set of CSS custom properties in the existing stylesheet. Raise core navigation/table controls to 12–14px or larger for comfort; font size alone does not remove the contrast requirement.

**Acceptance:** evaluate normal, hover and focus states against their actual backgrounds; every ordinary text pair reaches 4.5:1. Recheck opacity-based inactive attribute-list items separately.

### UI-08 — P2 / Moderate: account forms and dynamic feedback lack consistent semantics

**Confirmed in source.** Users form labels are adjacent to inputs/selects without `htmlFor`/IDs or wrapping association at [UsersModule.tsx:374](../../src/components/UsersModule.tsx#L374), [UsersModule.tsx:389](../../src/components/UsersModule.tsx#L389) and [UsersModule.tsx:424](../../src/components/UsersModule.tsx#L424). The Users modal close buttons have no accessible label. Login authentication errors are an ordinary `<div>` at [LoginScreen.tsx:69](../../src/components/LoginScreen.tsx#L69), and while login is pending its submit button replaces all text with a spinner at `LoginScreen.tsx:140`. Global notifications appear only inside a manually opened menu and are not announced: [NotificationsMenu.tsx:46](../../src/components/NotificationsMenu.tsx#L46). Notification “mark read” actions are clickable `<div>` elements at `NotificationsMenu.tsx:68`.

**Fix:** associate visible labels with fields; name icon buttons; preserve “Signing in…” text with `aria-busy`; announce login errors through an alert and attach field errors with `aria-describedby`. Add one concise polite live-status region for completion notices and immediate inline errors for failed actions. Use a button for mark-read. Add `aria-expanded` to the account trigger, Escape handling to popovers, and expose active module/filter state. Relevant criteria: **1.3.1 Info and Relationships**, **3.3.1 Error Identification**, **4.1.2 Name, Role, Value**, **4.1.3 Status Messages**. [W3C status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

**Acceptance:** a screen reader can name every user-management field, hears failed login without searching the page, and hears job/export failure while remaining in its workflow. Keyboard users can dismiss account/notification popovers and mark notices read.

### UI-09 — P3 / Low: account-specific notifications survive a change of signed-in account

**Confirmed in source; limited confidentiality impact.** Notifications are provider state at [AppContext.tsx:71](../../src/context/AppContext.tsx#L71). Logout and session expiry clear identity/jobs/users but not notifications at `AppContext.tsx:86,117`. A later sign-in within the same SPA can see earlier notices, including admin-only user-created/updated/removed names and assigned role at `UsersModule.tsx:85,119,137`. The menu is not available while unauthenticated, and this application intentionally shares catalog/jobs across signed-in accounts; this is account-boundary hygiene, not a claim of general tenant isolation failure. No passwords are included in those messages.

**Fix:** clear account-scoped notifications on logout, expiry and account replacement. If shared operational notices are intentional, distinguish them from account-management notices explicitly.

**Acceptance:** admin creates a user, signs out, and a regular user signs in without a page reload; the regular user's notification menu contains only their own new notices.

### UI-10 — P3: dense controls and infrastructure labels obscure the operational task

**Source-based design assessment.** The dashboard presents five counts, filters, upload, bulk creation, scraping, export and database deletion before a row can be reviewed. Many labels use 10px uppercase letterspacing. The global badge specifically says “Supabase Online” when it only reflects `/api/db-status`, and the sign-in page hardcodes “v2.4 Enterprise Edition” despite package version `0.0.0`: [App.tsx:83](../../src/App.tsx#L83), [LoginScreen.tsx:50](../../src/components/LoginScreen.tsx#L50). These are not evidence of complete provider or deployment health.

**Fix:** retain the restrained serif headings and warm neutral palette, but use sentence-case action labels and a clearer next-step hierarchy. Label the database check accurately, e.g. “Data connection available”; show health detail only where it helps administrators act. Use real build metadata if a version is needed. Distinguish **processed** counts from **passed QA** and **warnings** so users do not equate a completed run with valid product data.

## Concrete redesign proposal for the existing app

Keep React, Tailwind, Lucide, current modules and existing server APIs. No new component framework, dashboard package, animation dependency or theme project is needed.

| Existing area | Proposed change | Implementation reach |
| --- | --- | --- |
| Global shell | 64px brand/mode/account header; separate module navigation; compact expandable navigation below 768px; active module state announced | `App.tsx`, `UserNav.tsx`, `NotificationsMenu.tsx` |
| Dashboard heading | “QA workspace” / “Catalog workspace”, short file context, one primary Upload action; move destructive maintenance out of the main action cluster | `DashboardModule.tsx` |
| Readiness summary | Responsive five-card strip: Total, Ready, Missing source, Processed, Failed; show QA outcome separately from process completion | `DashboardModule.tsx`, existing status helpers |
| Bulk toolbar | Full-width labelled search; wrapping filters with selected state; only show contextual selection actions after a selection; explicitly count hidden selections | `DashboardModule.tsx` |
| SKU table | Real checkbox column; sticky headers; honest source/readiness labels; concise row actions; bounded horizontal scrolling on small screens | `DashboardModule.tsx` |
| Job list | Stack name/status, progress and actions at narrow widths; make View Results primary; show run owner/time, last-run status, current-evidence coverage separately | `JobsModule.tsx` |
| Results | Native dialog; clear “Not reviewed / Running / Pass / Warning / Fail / Stale” labels; evidence details and export as secondary actions | `JobsModule.tsx`, existing run helpers |
| Attribute sets | Keep desktop index; mobile selector/list before editor; 24–32px responsive title instead of fixed 60px field; protect unsaved edits when changing set or module | `AttributeSetsModule.tsx`, `AttributeSetEditor.tsx`, `App.tsx` |
| Forms | Reuse one small set of field/button classes, persistent labels, linked errors and consistent busy text | existing forms and `src/index.css` |

Use a small CSS token set for page/surface/text/muted/border/accent/error colors rather than introducing a design-system package. Preserve the existing 4/8px spacing scale; use 16px mobile page padding, 24–32px desktop padding, 14–16px body text and 12px supporting metadata. Aim for 44px primary touch controls as a usability target; evaluate WCAG 2.5.8's actual target-size/spacing requirements separately rather than claiming 44px is its minimum.

The normal QA flow should read **Upload → Resolve missing evidence → Select SKUs → Create job → Review outcomes → Export**. Catalog should retain its current attribute mapping/header preparation and validated file exports, with image selection reachable from the relevant run. Add brief next-step text to existing empty states instead of inventing new onboarding screens.

## Strengths to preserve

- Login already uses associated Username/Password labels, autocomplete attributes and server-backed identity; forged local storage cannot establish the app user (`AppContext.tsx:81-92`).
- SAP/data editing already preserves drafts on save failure, uses revision checks and native dialogs (`DashboardModule.tsx:74-119,985-1096`). Extend those patterns to the other overlays.
- The image picker uses a native dialog, named image choices, `aria-pressed`, an error/retry state and a responsive grid (`CatalogImagePicker.tsx:24-33,45-82`).
- The scraper distinguishes temporary preview from saved evidence, displays partial-collection warnings, exposes cancellation and substitutes image alt text for remote image loading (`ScraperModule.tsx:95-151`).
- Job polling errors and image-export progress already have useful alert/status semantics, while active jobs use native `<progress>` (`JobsModule.tsx:338,362,600`).
- Catalog result cells show warnings as text as well as color (`JobsModule.tsx:680-688`).

## Verification and release acceptance

| Check | Initial result |
| --- | --- |
| `test:sap-editor` (`DashboardModule.test.ts`) | BLOCKED before application assertions: Chromium cannot load `libglib-2.0.so.0` |
| `test:catalog-browser` (`CatalogMode.test.ts`) | BLOCKED for the same browser-loader error |
| `test:catalog-images-browser` (`CatalogImages.test.ts`) | BLOCKED for the same browser-loader error |
| Select-all disjoint-set reproduction | PASS: isolated assertions reproduce the incorrect checked state/toggle |
| Source-color contrast calculation | PASS: ratios calculated from exact source hex values; normal-text failures identified above |
| Desktop/mobile screenshots | Pending isolated-library retry; no screenshots claimed at this stage |
| Real screen reader / zoom / forced colors / reduced motion | NOT TESTED |
| axe or Lighthouse | NOT RUN |

Before broad deployment, run the three existing browser suites in a browser-ready CI image, add one keyboard path through upload/selection/job/result/export, and verify the eight QA states listed in UI-02. Add focused coverage for destructive-action copy/scope and select-all membership. Run automated accessibility checks against login, dashboard, job details, user management, attribute editor and their error/empty/loading states; then perform NVDA or VoiceOver testing on the complete QA and Catalog workflows. A green automated score alone is not a conformance claim.

Visual acceptance should include 320/390/768/1440px screenshots, 200%/400% zoom, long SKU/job/set names, empty and 1,000-row data, failed provider/database responses and an expired session during editing. Verify no clipped navigation/actions, consistent focus restoration, no false success messages and no loss of an unsaved draft without a clear choice.

Skipped: product implementation, new dependencies, live production requests, real provider calls and a formal accessibility certification. Remaining risk: static findings are actionable, but responsive appearance and assistive-technology behavior require the runtime checks above.
