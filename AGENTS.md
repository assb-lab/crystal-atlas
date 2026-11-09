# Development workflow

- Implementation follows Issue → feature branch → pull request.
- Create or identify the tracking GitHub Issue before implementing new scope. State acceptance criteria and deferred work in the Issue.
- Start feature branches from the current `develop`, normally `feat/issue-<number>-<description>`.
- Open feature PRs against `develop`, reference the tracking Issue, and include validation results and outstanding limitations.
- `develop` is the integration branch. Propose a `develop` → `main` PR only when the user asks to promote the accumulated development work.
- Do not merge PRs or delete branches without explicit user authorization. A request to implement and open a PR authorizes routine implementation, validation, commit and push within that Issue's scope.
- Preserve unrelated worktree changes. Keep PDFs, credentials and local curation files out of Git; `refs/` stays ignored.
- For browser changes, build the exact feature branch and verify the static-hosted and single-HTML outputs at desktop and about 400px. Keep document-backed claims, inferred relations, editorial navigation, model provenance and unperformed checks distinguishable.
