# Code Review Task

Perform comprehensive code review. Be thorough but concise.

## Check For:

**Secrets & Config** - No hardcoded API keys, tokens, or credentials. Uses env vars or .env files. .gitignore covers sensitive files.
**Async & Concurrency** - Async functions properly awaited, no blocking calls in async paths, WebSocket connections cleaned up, event loops not blocked by CPU-heavy work.
**Error Handling** - Try-except around all external API calls (OpenAI, Deepgram, ElevenLabs, etc.), graceful degradation on API failures, helpful error messages with context.
**Audio Pipeline** - Sample rates consistent across STT/TTS chain, correct audio encoding (PCM, opus, mp3), buffer sizes appropriate, no silent data corruption.
**Latency** - No unnecessary sequential API calls that could be parallel, streaming used where available, time-to-first-byte considered, no expensive operations in the hot path.
**Resource Cleanup** - WebSocket connections closed properly, audio streams released, file handles closed, no leaked connections on error paths.
**Python Quality** - Type hints on function signatures, no bare `except:`, no mutable default arguments, f-strings over concatenation, docstrings on public functions.
**Production Readiness** - No `print()` statements (use `logging`), no TODOs left unaddressed, no hardcoded URLs or magic numbers, no `# DEBUG` or test scaffolding left in.
**Security** - API keys not logged or exposed in error messages, user input validated before passing to APIs, no PII in logs.
**Architecture** - Follows existing patterns in the codebase, separation between pipeline logic and API glue, config externalised.

## Output Format

### ✅ Looks Good
- [Item 1]
- [Item 2]

### ⚠️ Issues Found
- **[Severity]** [file:line] - [Issue description]
  - Fix: [Suggested fix]

### 📊 Summary
- Files reviewed: X
- Critical issues: X
- Warnings: X

## Severity Levels
- **CRITICAL** - Leaked secrets, data loss, crashes, security holes
- **HIGH** - Bugs, latency killers, resource leaks, broken audio pipeline
- **MEDIUM** - Code quality, missing error handling, maintainability
- **LOW** - Style, minor improvements, documentation gaps

$ARGUMENTS
