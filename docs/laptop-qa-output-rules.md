## 7. SEVERITY & STATUS

Use only the application's lowercase severity values. Translate the former CRITICAL/HIGH levels to `critical`, MEDIUM to `moderate`, and LOW to `minor`.

| Severity | Definition |
|---|---|
| critical | Wrong product identity, brand, model/MPN, SKU/base code, invalid or contradictory EAN, mixed configurations; wrong CPU, RAM, storage, GPU, OS, significant display specifications, or unsupported major claims |
| moderate | Missing verified attributes, wrong placement/bullet order, inaccurate secondary specifications, missing required content, or incomplete verification |
| minor | Capitalization, spacing, punctuation, grammar, minor keyword issues |

Use only `pass`, `warning`, or `fail` for `qa_status`:
- `fail`: At least one critical finding, including unresolved product identity or material technical contradictions.
- `warning`: Other findings, source conflicts, or incomplete verification remain, without a critical finding.
- `pass`: Every applicable check is complete with no findings or unresolved source conflicts.

Represent unresolved identity, conflicting sources, and insufficient evidence as issues with explanations; never mark these checks as a clean pass. Use `data_mismatch` only for a verified contradiction with a nonempty source value and complete correction; `unsupported_claim` for an unverified populated claim; `missing_data` for an absent required or source-supported value; and `formatting` or `spelling_grammar` for the corresponding presentation defects.

---

## 8. REQUIRED QA OUTPUT

Return only the application's structured QA JSON object with `qa_status`, `confidence`, `summary`, `issue_count`, `issues`, and `source_notes`. Do not return separate tables, corrected records, approval labels, or alternative statuses.

Review every original attribute, including correct fields and intentional blanks. Report findings and incomplete checks in `issues`, using exact original headers in `field`. Identify supporting evidence and source conflicts explicitly. Never invent evidence or corrections.

For each issue, provide `field`, `issue_type`, `severity`, `uploaded_value`, `source_truth`, `explanation`, `suggested_fix`, and `cell_color`. All text fields must be strings. Use `critical/red`, `moderate/orange`, or `minor/yellow`. Follow the application's required types and allowed values for every field.

Provide the complete evidence-supported replacement cell value in `suggested_fix`; leave it empty when a verified replacement cannot be supplied and explain why. Preserve verified identity and dedicated EAN values unless explicitly authorized to change them. Preserve the approved naming, title, bullet, description, and original-header conventions. Unsupported optional blanks remain acceptable; do not invent replacement facts.

Summarize the outcome and unresolved verification needs in `summary`. Record conflicting sources in `source_notes.source_conflicts` and mark `sap_used` and `url_used` only for supplied evidence actually used. The application derives issue counts, severity colors, and corrected exports from these findings.

---

