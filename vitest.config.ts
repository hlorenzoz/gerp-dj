import { configDefaults, defineConfig } from 'vitest/config';

// Agent worktrees live in .claude/worktrees inside the repo: never collect their tests.
export default defineConfig({ test: { exclude: [...configDefaults.exclude, '.claude/**'] } });
