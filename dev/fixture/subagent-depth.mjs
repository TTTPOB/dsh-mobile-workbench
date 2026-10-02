/** Test overlay capacity, validated with the installed public subagent schema. */
import { pathToFileURL } from 'node:url'

export async function fixtureSubagentConfig(require) {
  const { default: SubagentRuntime } = await import(pathToFileURL(require.resolve('@deepseek-ai/dsh-subagent')).href)
  const defaults = SubagentRuntime.Config({})
  // Replacing the whole config must retain the other shipped capacity setting.
  return { maxDepth: 2, maxActiveSubagents: defaults.maxActiveSubagents.get() }
}
