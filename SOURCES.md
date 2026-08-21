# SOURCES.md

Where the facts about Mowne come from. Any claim written into this site (roles,
dates, what was built, education) must trace to one of these. **Do not invent
numbers, outcomes or job titles**, and do not soften a source into something
that sounds better than what it says.

## The sources

| Source                | Where                                                                      | Authoritative for                                              |
| --------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Resume                | `Profile.pdf` (repo root)                                                   | The formal record: roles, dates, education                      |
| LinkedIn export       | `profile_dump.txt`, `profile_dump_utf8.txt` (plain-text dump of the resume) | Same content, greppable. What each role actually involved       |
| LinkedIn profile      | https://linkedin.com/in/mowne                                               | The live version of the above. Beats the local dump when they differ |
| GitHub profile README | https://github.com/mowne67 (repo `mowne67/mowne67`)                         | Self-described current role and framing, in his own words       |
| GitHub                | https://github.com/mowne67                                                  | Code, repo count, what is actually public                       |
| This site             | `index.html` (work section), `about.html`                                   | The edited version. Downstream of everything above              |

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

The resume says nothing about what was built at **ITO Health** or **Indivia
AI**. The site's cards for those two are deliberately thin. They need Mowne's
own words, not a plausible guess.

See [AGENTS.md](AGENTS.md) for how the site itself is built.
