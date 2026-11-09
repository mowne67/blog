# SOURCES.md

Where the facts about Mowne come from. Any claim written into this site (roles,
dates, what was built, education) must trace to one of these. **Do not invent
numbers, outcomes or job titles**, and do not soften a source into something
that sounds better than what it says.

## The sources

| Source                | Where                                                                      | Authoritative for                                              |
| --------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Resume                | `Profile.pdf` (repo root)                                                   | The formal record: roles, dates, education                      |
| Supplied résumé | `public/resume/Mownetharan-AI-Engineer.pdf` (original `AI_Engineer_Mownetharan_25092026.pdf`, provided 10 Nov 2026) | Public résumé download, aerospace degree at IIT Madras, data science electives, and applied AI work used in the introduction. Published unchanged at the user's request. |
| GitHub avatar | `https://avatars.githubusercontent.com/u/79999567?s=400`, saved as `assets/profile/github-avatar.png` (10 Nov 2026) | The existing pixel identicon used beside the introduction; not a portrait photograph. |
| rustpyxl benchmark report and raw samples | `mowne67/rustpyxl` at `40befaa8b51b773c5efa7530d0eedee64a2344fc`, `docs/benchmarks.md` and `docs/results.json` (inspected 10 Nov 2026) | Homepage chart: mixed-value, standalone streaming reads; 4.921 s / 0.489 s and 47.1 MiB / 32.8 MiB, rounded from raw medians. Report supplies the 10 Oct 2026 measurement date, environment, methodology and limitations. |
| pydocx-fast reported benchmark and test | `mowne67/pydocx-fast` at `866aca599ba1bc8969ba322d63208d5a6de84d83`, `README.md` and `test_pydocx_fast.py` (inspected 10 Nov 2026) | Homepage timings for 50,000 paragraphs: write/save 17.6 s / 5.5 s; load/read 1.35 s / 0.41 s. The source does not report hardware or peak memory; these are reported results, not a fresh benchmark run. |
| Public name           | GitHub profile (https://github.com/mowne67) and the conversation, Oct 2026   | "Mownetharan" as the public form of the name, "Mowne" as the handle. Used in the page titles, the footer, the author byline and the `Person` JSON-LD |
| LinkedIn export       | `profile_dump.txt`, `profile_dump_utf8.txt` (plain-text dump of the resume) | Same content, greppable. What each role actually involved       |
| LinkedIn profile      | https://linkedin.com/in/mowne                                               | The live version of the above. Beats the local dump when they differ |
| GitHub profile README | https://github.com/mowne67 (repo `mowne67/mowne67`)                         | Self-described current role and framing, in his own words       |
| GitHub                | https://github.com/mowne67                                                  | Code, repo count, what is actually public                       |
| Tools showcase snapshot | https://github.com/mowne67/tools/tree/f43a1655ca22f801c7c2134e0eb18648a5b194ff | Existing project descriptions imported into `tools/` |
| rustpyxl README | https://github.com/mowne67/rustpyxl#readme (inspected 10 Oct 2026) | Streaming XLSX API, openpyxl compatibility bridge, and current limitations in `tools/` |
| jsonpath-rx README | https://github.com/mowne67/jsonpath-rx#readme (inspected 10 Oct 2026) | Rust/Python JSONPath API, mutations, and compatibility boundaries in `tools/` |
| pydocx-fast README | https://github.com/mowne67/pydocx-fast#readme (inspected 10 Oct 2026) | Drop-in python-docx performance fixes, the two hot paths fixed, and benchmark figures in `tools/` |
| Health Eligible README | `../Health-Eligible-Backend/README.md` (private, not in this repo)          | What was built at ITO Health: programs, architecture, features  |
| Health Eligible code and merged history | `itohealth/Health-Eligible-Backend`, `dev` at `09c9c8998720f06a25e67f96d4d7bb115592af7b` (private; inspected 4 Oct 2026) | Tool inventory in `posts/2026-10-04-tools-behind-health-eligible.md`; code use and experiments, not verification of live vendor configuration |
| Health Eligible public site | https://healtheligible.org                                            | Public production example, confirmed by Mowne in conversation (Oct 2026) |
| Indivia AI backend | `indivia-ai/indivia-backend`, `main` at `1756e6a27737a2b7c1fbc48f0b40985de22efcd4` (private; inspected 5 Oct 2026) | Personalized marketing email generation and product recommendations: `CODEBASE_OVERVIEW.md`, `app/services/email_service.py`, `app/api/recommendation_routes.py` |
| This site             | `index.html` (work section and project capabilities)                           | The edited version. Downstream of everything above              |

## Precedence

When two sources disagree, prefer in this order:

1. What Mowne says directly in the conversation
2. LinkedIn profile (live)
3. GitHub profile README
4. `Profile.pdf` / the local dumps
5. The site's own copy

If a conflict is load-bearing (a date, a title, a claim about impact), **ask
rather than pick**. Publishing a wrong employment date is worse than waiting.

## Known conflicts, as of 2026-08-20

- **The local dump is stale.** Its dates stop around May 2026 and it still
  lists Genpact as "Present". Genpact actually ended **April 2026** (confirmed
  by Mowne). Treat any "Present" in `profile_dump.txt` as unverified.
- **Titles differ between LinkedIn and the GitHub README.** LinkedIn:
  "Assistant Manager (Generative AI)" at Genpact, "Founding AI Engineer" at
  Indivia AI. The README: "Data Scientist" and "Lead AI Engineer". The site
  currently follows LinkedIn.
- **Two email addresses.** The site and README use `mownetharan@gmail.com`;
  the resume uses `aksmownetharan@gmail.com`. Unresolved. Use the site's.
- **Overlapping dates are real, not errors.** Genpact (Dec 2024 to Apr 2026)
  overlaps Indivia AI (Aug to Dec 2025) and ITO Health (Dec 2025 onward).

## Things no source covers

The older `Profile.pdf` says nothing about what was built at **ITO Health** or
**Indivia AI**. Their work cards are covered by the Health Eligible README and
Indivia AI backend, respectively (see the table). The supplied September 2026
résumé also describes the ITO Health work.

See [AGENTS.md](AGENTS.md) for how the site itself is built.

## Supplied résumé, November 2026

The supplied PDF lists ITO Health from May 2026. Mowne explicitly confirmed
on 10 November 2026 that the portfolio should retain **December 2025**.
The downloadable PDF is the exact supplied file; its dates and formatting
have not been edited. The introduction avoids repeating dates or conflicting
titles. The PDF uses the same public email as the site.

## Health Eligible tool inventory evidence

The October 2026 post uses the private repository snapshot above and its merged
`dev` history. Public copy describes tool names and roles without reproducing
private source, credentials, user records, or configuration values.

- Runtime and utilities: `pyproject.toml`, `Dockerfile`, `api/app.py`,
  `api/server.py`, `api/models.py`, `api/utils.py`,
  `conversation/engine/llm_conversation_engine.py`, and
  `conversation/engine/session_state.py`.
- Models and retrieval: `conversation/model_config.py`,
  `conversation/agent/agent_graph.py`, `conversation/agent/tools.py`,
  `rules/scraper/`, the rule extractors, and `tests/automated/cloud/`.
- Voice: `api/services/openai_realtime.py`, `xai_realtime.py`,
  `elevenlabs_stt.py`, and `elevenlabs_tts.py`.
- Analytics and reporting: `api/infra/`, `scripts/langfuse_*.py`,
  `scripts/converse_case.py`, `scripts/run_normalized_cases.py`, and
  `scripts/generate_iss_flow_pdf.py`.
- Evaluation: `evaluation/README.md`, `evaluation/deepeval/`,
  `evaluation/giskard/`, `tests/load/`, and `.github/workflows/offline_tests.yaml`.
  Coverage tools are evidenced by declared dependencies; the post does not
  claim that CI runs coverage or that a particular coverage level was achieved.
- Infrastructure and workflows: `terraform/`, `bash/`, `.github/workflows/`,
  `api/infra/quota.py`, `api/services/{share,incident,email,jira}_service.py`,
  `scripts/policy_scan.py`, `deploy.sh`, `Procfile`, `.platform/`, and
  `CLAUDE.md` (documented cloudflared preview workflow). Code establishes the
  configured deployment target, not which resources are live in AWS.
- Typesafe AI: `prototypes/typesafe-*` and
  `conversation/extraction/jev_ambiguity.py` (benchmarks and optional integrations).
- Historical Gemini/DeepAgents/vector retrieval: `7bd3e3e`, `2ce06a7`,
  `4b47e38`, and `fe14539^:conversation/agent/tools.py`. Bedrock integration:
  `29842f0` and provider configuration in the audited snapshot.
- Historical AWS speech/audio: `69ca229^:api/services/polly_tts.py` and
  `69ca229^:api/services/streaming_transcription.py`; adapters removed in `69ca229`.
- Historical quota tools: SlowAPI in `56d115f:api/server.py`, direct SQLite
  implementation in `292584b`, and DynamoDB replacement in `ecb6109`.
- Historical PR-Agent: added in `7240799`, removed in `421640b`.
