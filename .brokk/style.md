# Coding Style Guide — Podcastly

This repository is small and intentionally minimal. The rules below capture the concrete conventions used here (and required by the chosen license) rather than general best practices.

## Scope
Applies to all source files in this project (Python and JavaScript) and to repository-level metadata (LICENSE, README, entry scripts).

## License & file headers (required)
- The project is licensed under GNU GPL v3. Keep the full license text in LICENSE at the repository root.
- Every source file MUST include a short license header near the top with:
  - One-line copyright
  - A one‑line pointer to the full GPLv3 text (LICENSE)
  - A warranty disclaimer pointer (as recommended by GPL)
- Use this minimal header template (update year/author/contact):

  ```text
  <project or file brief description>
  Copyright (C) <year> <author name>

  This file is part of Podcastly and is licensed under the GNU General Public License v3.
  See the project LICENSE file for the full terms: https://www.gnu.org/licenses/gpl-3.0.html
  ```

- If you add other license terms to specific files, note them explicitly in those files as required by GPL section 7.

## Entry scripts / executables
- Executable Python scripts at the repository root should:
  - Begin with the shebang: #!/usr/bin/env python
    - This repository currently uses the generic `python` env wrapper to preserve environment flexibility (virtualenvs, pyenv). Do not hardcode absolute interpreter paths.
  - Be marked executable (chmod +x) when intended to be run.
  - Use `main.py` (or another concise name) as the top-level entry point for CLI-like scripts.

## Runtime legal notice for interactive programs
- If a program has an interactive interface, it SHOULD print a short legal/attribution notice on startup, per GPL guidance. A minimal example:

  ```text
  Podcastly — Copyright (C) <year> <author>
  This program comes with ABSOLUTELY NO WARRANTY; see LICENSE for details.
  ```

- Provide commands or UI affordances to display the full license text or direct users to LICENSE.

## Dependency / implementation style
- The codebase prefers "vanilla" implementations:
  - Python: prefer using the standard library where practical; avoid heavy external frameworks unless necessary.
  - JavaScript: prefer plain JS (no framework assumptions). Keep third-party usage explicit and minimal.
- When adding dependencies, document them in README and keep them intentional (no automatic scaffolding).

## README and repository metadata
- README.md MUST include:
  - Short project description (one or two lines).
  - License declaration (GPL v3) and pointer to LICENSE.
  - Brief instructions on how to contact maintainers (electronic and paper mail) or where such contact info is stored.
- Keep README concise and factual.

## Adding new files / changes
- New source files: include the required license header and a one-line file description.
- If you modify or extend files, add a brief “modified by” or change note inside the file if the change is substantial (this follows GPL’s recommendation to mark modified versions).

## Notes / rationale (non-normative)
- The explicit per-file license header and startup notice reflect GPL v3 expectations and the repository’s existing minimal style.
- The shebang choice is deliberate to favor environment portability over forcing a specific system interpreter.

If you need a short header snippet or the startup notice adapted for a particular file or CLI, say which file and I’ll generate it.