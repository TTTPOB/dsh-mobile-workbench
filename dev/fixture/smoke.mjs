import assert from 'node:assert/strict'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { hostRequire } from './runtime.mjs'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
const require = hostRequire()
// Source mode checks scoped changes without writing dist, overlay, or the main plugin build.
let fixture
if (process.argv.includes('--source')) {
  let source = stripTypeScriptTypes(readFileSync(new URL('./src/index.ts', import.meta.url), 'utf8'), { mode: 'transform' })
  for (const name of ['@deepseek-ai/dsh-llm', '@deepseek-ai/schemastery']) {
    source = source.replaceAll("'" + name + "'", JSON.stringify(pathToFileURL(require.resolve(name)).href))
  }
  fixture = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))
} else {
  fixture = await import('./dist/index.js')
}
const { Context } = await import(pathToFileURL(require.resolve('@deepseek-ai/cordis')).href)
const { default: LlmRuntime } = await import(pathToFileURL(require.resolve('@deepseek-ai/dsh-llm')).href)
const fixtureFile = fileURLToPath(new URL('./workspace/mobile-audit.md', import.meta.url))
const collect = async stream => { const chunks = []; for await (const chunk of stream) chunks.push(chunk); return chunks }
const config = fixture.Config({ fixtureFile })
assert.equal(config.paceMs, 35)
assert.throws(() => fixture.Config({ paceMs: 0 }))
assert.throws(() => fixture.apply({}, { fixtureFile, paceMs: -1 }))
assert.throws(() => fixture.apply({}, { fixtureFile: 'relative.md', paceMs: 0 }))
const ctx = new Context()
await ctx.plugin(LlmRuntime)
try {
  const fiber = await ctx.plugin(fixture, { fixtureFile, paceMs: 0 })
  assert.equal(ctx.llm.listProviders().find(item => item.id === 'mobile-audit').name, 'Mobile Audit (local fixture)')
  assert.equal((await ctx.llm.listModels('mobile-audit'))[0].name, 'Mobile Audit')
  const adapter = new fixture.MobileAuditAdapter({ fixtureFile, paceMs: 0 })
  const options = { provider: 'mobile-audit', model: 'mobile-audit', messages: [{ role: 'user', content: [{ type: 'text', text: '开始手机界面审计' }] }] }
  const first = await collect(adapter.stream(options))
  const call = first.find(chunk => chunk.type === 'block-end' && chunk.block.type === 'tool-call').block
  assert.equal(call.name, 'read')
  assert.equal(JSON.parse(call.arguments).file_path, fixtureFile)
  const secondOptions = { ...options, messages: [...options.messages, { role: 'tool', source: { kind: 'tool', callId: call.id }, content: [{ type: 'text', text: 'MOBILE_AUDIT_READ_OK' }] }] }
  const [a, b] = await Promise.all(['session-a', 'session-b'].map(sessionId => collect(adapter.stream({ ...secondOptions, sessionId }))))
  assert.deepEqual(a, b)
  assert.equal(a.filter(chunk => chunk.type === 'text-delta').map(chunk => chunk.text).join(''), fixture.REPLY)
  assert.ok(fixture.REPLY.includes('MOBILE_AUDIT_COMPLETE'))
  const repeat = await collect(adapter.stream({ ...secondOptions, messages: [...secondOptions.messages, options.messages[0]] }))
  assert.equal(repeat.at(-1).reason.kind, 'tool-calls')
  const controller = new AbortController()
  const slow = new fixture.MobileAuditAdapter({ fixtureFile, paceMs: 50 })
  const cancelled = collect(slow.stream({ ...secondOptions, signal: controller.signal }))
  controller.abort(new Error('fixture cancellation'))
  await assert.rejects(cancelled)
  const scenarioRequest = text => ({ ...options, messages: [{ role: 'user', content: [{ type: 'text', text }] }] })
  const toolCall = chunks => chunks.find(chunk => chunk.type === 'block-end' && chunk.block.type === 'tool-call').block
  const dailyRequest = scenarioRequest('整理移动端登录页的改进清单')
  const dailyCall = toolCall(await collect(adapter.stream(dailyRequest)))
  assert.equal(dailyCall.name, 'read')
  assert.equal(JSON.parse(dailyCall.arguments).file_path, fixtureFile)
  const dailyResponse = await collect(adapter.stream({ ...dailyRequest, messages: [...dailyRequest.messages,
    { role: 'tool', source: { kind: 'tool', callId: dailyCall.id }, isError: false,
      content: [{ type: 'text', text: 'MOBILE_AUDIT_READ_OK' }] }] }))
  const dailyText = dailyResponse.filter(chunk => chunk.type === 'text-delta').map(chunk => chunk.text).join('')
  assert.equal(dailyText, fixture.DAILY_REPLY)
  assert.equal(dailyResponse.at(-1).reason.kind, 'stop')
  assert.ok(dailyText.length < 500)
  assert.equal((dailyText.match(/^\d\. /gm) ?? []).length, 3)
  assert.ok(dailyText.includes('下一步'))
  assert.ok(dailyText.includes('未修改业务文件'))
  assert.ok(dailyText.includes('统计为合成测试内容'))
  assert.ok(!dailyText.includes('手机界面对比：确定性测试回复'))
  assert.ok(!dailyText.includes('阅读段落'))
  const longName = 'Mobile Audit — Extended Reasoning Preview'
  const extended = (await ctx.llm.listModels('mobile-audit')).find(item => item.id === 'mobile-audit-extended-preview')
  assert.equal(extended.name, longName)
  assert.equal((await adapter.resolveModel('mobile-audit', extended.id)).name, longName)
  assert.ok(extended.description.includes('synthetic'))
  const extendedReply = await collect(adapter.stream({ ...options, model: extended.id }))
  assert.equal(toolCall(extendedReply).name, 'read')
  const delegated = toolCall(await collect(adapter.stream(scenarioRequest('演示子智能体'))))
  assert.equal(delegated.name, 'subagent')
  assert.equal(JSON.parse(delegated.arguments).run_in_background, false)
  const childRequest = scenarioRequest(JSON.parse(delegated.arguments).prompt)
  const childCall = toolCall(await collect(adapter.stream(childRequest)))
  assert.equal(childCall.name, 'read')
  const childReply = await collect(adapter.stream({ ...childRequest, messages: [...childRequest.messages,
    { role: 'tool', source: { kind: 'tool', callId: childCall.id }, content: [{ type: 'text', text: 'MOBILE_AUDIT_READ_OK' }] }] }))
  assert.equal(childReply.at(-1).reason.kind, 'stop')
  assert.ok(!childReply.some(chunk => chunk.type === 'tool-call-delta'))
  const questionRequest = scenarioRequest('演示提问')
  const questionCall = toolCall(await collect(adapter.stream(questionRequest)))
  assert.equal(questionCall.name, 'ask_user_question')
  const questionArgs = JSON.parse(questionCall.arguments)
  assert.equal(questionArgs.questions[0].options.length, 2)
  // Only this local smoke uses a deterministic answerer; the shipped overlay retains the real UI.
  for (const name of ['@deepseek-ai/dsh-agent', '@deepseek-ai/dsh-system-prompt', '@deepseek-ai/dsh-tools', '@deepseek-ai/dsh-user-questions']) {
    const module = await import(pathToFileURL(require.resolve(name)).href)
    await ctx.plugin(module.default)
  }
  const askPlugin = await import(pathToFileURL(require.resolve('@deepseek-ai/dsh-tool-ask-user')).href)
  await ctx.plugin(askPlugin)
  const removeAnswerer = ctx.on('user-questions/request', async request => ({
    answers: [{ id: request.questions[0].id, selected: ['检查子智能体'] }],
  }))
  const questionResult = await ctx.tools.execute({ name: questionCall.name, callId: questionCall.id,
    arguments: questionArgs, signal: new AbortController().signal })
  assert.equal(questionResult.isError, false)
  const confirmation = await collect(adapter.stream({ ...questionRequest, messages: [...questionRequest.messages,
    { role: 'tool', source: { kind: 'tool', callId: questionCall.id }, content: questionResult.content }] }))
  const confirmationText = confirmation.filter(chunk => chunk.type === 'text-delta').map(chunk => chunk.text).join('')
  assert.ok(confirmationText.includes('检查子智能体'))
  assert.ok(confirmationText.includes('MOBILE_AUDIT_QUESTION_COMPLETE'))
  removeAnswerer()
  const approvalRequest = scenarioRequest('演示审批')
  const approvalCall = toolCall(await collect(adapter.stream(approvalRequest)))
  assert.equal(approvalCall.name, 'bash')
  const approvalArgs = JSON.parse(approvalCall.arguments)
  assert.equal(approvalArgs.command, "printf 'MOBILE_AUDIT_APPROVAL_OK\\n'")
  assert.equal(approvalArgs.workdir, fileURLToPath(new URL('./workspace', import.meta.url)))
  assert.equal(approvalArgs.sandbox_permissions, 'workspace-write')
  assert.equal(approvalArgs.justification, '验证移动端审批交互')
  const { validateEscalationArgs } = await import(pathToFileURL(require.resolve('@deepseek-ai/dsh-sandbox')).href)
  validateEscalationArgs(approvalArgs.sandbox_permissions, approvalArgs.justification)
  // Exercise only adapter result branches; never execute or answer an actual approval here.
  for (const [text, isError, marker] of [
    ['MOBILE_AUDIT_APPROVAL_OK\n', false, 'MOBILE_AUDIT_APPROVAL_COMPLETE'],
    ['approval denied', true, 'MOBILE_AUDIT_APPROVAL_NOT_RUN'],
    ['MOBILE_AUDIT_APPROVAL_OK\n[exit code: 1]', false, 'MOBILE_AUDIT_APPROVAL_NOT_RUN'],
    ['MOBILE_AUDIT_APPROVAL_OK\n[timed out after 100ms]', false, 'MOBILE_AUDIT_APPROVAL_NOT_RUN'],
    ['MOBILE_AUDIT_APPROVAL_OK\n[killed by signal: SIGTERM]', false, 'MOBILE_AUDIT_APPROVAL_NOT_RUN'],
    ['MOBILE_AUDIT_APPROVAL_OK\n', true, 'MOBILE_AUDIT_APPROVAL_NOT_RUN'],
  ]) {
    const response = await collect(adapter.stream({ ...approvalRequest, messages: [...approvalRequest.messages,
      { role: 'tool', source: { kind: 'tool', callId: approvalCall.id }, isError, content: [{ type: 'text', text }] }] }))
    assert.equal(response.at(-1).reason.kind, 'stop')
    assert.ok(response.filter(chunk => chunk.type === 'text-delta').map(chunk => chunk.text).join('').includes(marker))
    assert.ok(!response.some(chunk => chunk.type === 'tool-call-delta'))
  }
  await fiber.dispose()
  assert.deepEqual(ctx.llm.listProviders(), [])
  console.log(JSON.stringify({ registered: true, dispose: true, twoSessionIsolation: true, cancellation: true, replyCharacters: fixture.REPLY.length, tool: call.name, childRecursionGuard: true, officialQuestionTool: true, questionConfirmation: true, approvalArguments: true, approvalResultBranches: true, dailyReading: true, extendedModelName: true, syntheticStatistics: true }))
} finally {
  await ctx.fiber.dispose()
}
