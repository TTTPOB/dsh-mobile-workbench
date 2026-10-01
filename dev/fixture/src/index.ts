/** Local deterministic model for the mobile UI audit. */
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { LlmAdapter, ToolCallId } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import { setTimeout as delay } from 'node:timers/promises'
import { realpathSync, statSync } from 'node:fs'
import { dirname, isAbsolute } from 'node:path'

export const name = 'mobile-audit-fixture'
export const inject = ['llm']
export interface Config { fixtureFile: string; paceMs: number }
export const Config = Schema.object({
  fixtureFile: Schema.string().required(),
  paceMs: Schema.number().default(35),
})

export const REPLY = [
  '# 手机界面对比：确定性测试回复',
  '',
  '✅ 已完成本地只读资料检查。这段回复来自 **Mobile Audit** 本地模型，没有网络请求，没有真实模型凭据。',
  '',
  '## 1. 阅读与滚动',
  '请先从顶部阅读到这里，再向下滚动到最后一节。中文段落、英文标识与行内代码应保持清晰，窄屏下不应出现整页横向滚动。这个测试不评价模型能力，只为插件对比提供相同内容。',
  '',
  '> 检查重点：工具卡片能够展开；长回复能够连续滚动；输入框仍然可用。',
  '',
  '## 2. 可操作检查清单',
  '- [x] 使用正式模型适配器生成真实 agent turn',
  '- [x] 通过官方 read 工具读取本地测试资料',
  '- [ ] 展开和收起工具卡片，检查参数与结果',
  '- [ ] 切换侧栏，检查会话列表与返回按钮',
  '- [ ] 点击输入框，检查手机键盘出现后的布局',
  '',
  '## 3. 窄屏表格',
  '| 项目 | 操作 | 预期 |',
  '| --- | --- | --- |',
  '| 工具卡片 | 点击展开 | 能读到本地文件结果 |',
  '| 消息区域 | 上下滚动 | 内容不被固定底栏遮挡 |',
  '| 输入框 | 输入中文 | 光标与发送按钮可见 |',
  '| 导航 | 打开侧栏 | 能回到当前会话 |',
  '',
  '## 4. 代码块与复制',
  '```ts',
  'const audit = { model: "Mobile Audit", network: false, mode: "read-only" }',
  'console.log(audit)',
  '```',
  '',
  '代码块可以有自己的横向滚动，但不应把整个页面撑宽。复制按钮、语言标签与代码文字应分开显示，触摸时不应误触消息菜单。',
  '',
  ...Array.from({ length: 8 }, (_, index) => [
    '### 阅读段落 ' + String(index + 1),
    '这是固定的中文长段落，用于观察手机浏览器的阅读密度、行高与滚动位置。打开工具结果以后，再返回这段文字，确认内容没有突然跳动。不同插件可能改变导航、按钮大小和卡片间距，但这份资料与模型回复保持相同，方便用截图逐项对照。请注意末尾消息是否完整、输入区是否覆盖正文，以及侧栏收起后是否恢复原来的滚动位置。',
    '',
  ]).flat(),
  '## 5. 完成标记',
  '**MOBILE_AUDIT_COMPLETE** — 已到达回复末尾。再次发送“开始手机界面审计”，会在新的正常 turn 中再次读取同一文件并生成同样的回复。',
].join('\n')

/** Stateless progression derives only from the current request history. */
export class MobileAuditAdapter extends LlmAdapter {
  constructor(private readonly config: Config) { super() }
  override providerInfo(provider: string) { return { id: provider, name: 'Mobile Audit (local fixture)' } }
  override async listModels(provider: string) {
    return [{ provider, id: 'mobile-audit', name: 'Mobile Audit', description: 'Deterministic local Chinese reply + read tool' }]
  }
  override async resolveModel(provider: string, model: string) {
    if (model !== 'mobile-audit') throw new Error('Mobile Audit only supports model mobile-audit')
    return { provider, id: model, name: 'Mobile Audit', context: { contextWindow: 131072 } }
  }
  override async *stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    options.signal?.throwIfAborted()
    if (options.purpose === 'session-title') {
      yield* this.text('手机界面审计', options)
      return
    }
    const lastUser = options.messages.findLastIndex(message => message.role === 'user' &&
      (message.source === undefined || message.source.kind === 'user'))
    const prompt = options.messages[lastUser]?.content
      .filter(block => block.type === 'text').map(block => block.text).join('\n') ?? ''
    // The child marker takes precedence and never enters a delegation branch.
    const childTask = prompt.startsWith('MOBILE_AUDIT_CHILD_TASK')
    const scenario = childTask ? 'child-read'
      : prompt.includes('演示子智能体') ? 'subagent'
      : prompt.includes('演示提问') ? 'question'
      : prompt.includes('演示审批') ? 'approval' : 'read'
    const callId = ToolCallId('mobile-audit-' + scenario + '-' + String(Math.max(0, lastUser)))
    const result = options.messages.slice(lastUser + 1).find(message =>
      message.role === 'tool' && message.source?.kind === 'tool' && message.source.callId === callId)
    if (result === undefined) {
      if (scenario === 'subagent') {
        yield* this.tool('创建一个本地子智能体，只读测试资料并等待其简短回复。', 'subagent', {
          description: '只读检查手机测试资料',
          prompt: 'MOBILE_AUDIT_CHILD_TASK\n只读取固定测试资料并给出简短中文确认；不要创建任何子代理。',
          // Omission uses the official provider's compatible parent-route inheritance.
          run_in_background: false,
        }, callId, options)
      } else if (scenario === 'question') {
        yield* this.tool('请选择一个选项，选择后我会给出简短确认。', 'ask_user_question', {
          questions: [{
            id: 'mobile-audit-choice', header: '手机界面提问演示',
            question: '这次先检查哪个界面？', multi_select: false,
            options: [
              { label: '检查工具卡片', description: '检查工具轨迹的展开与收起。' },
              { label: '检查子智能体', description: '检查进入子会话再返回父会话。' },
            ],
          }],
        }, callId, options)
      } else if (scenario === 'approval') {
        yield* this.tool('申请一次临时权限扩展，只输出固定测试标记；请在界面批准或拒绝。', 'bash', {
          command: "printf 'MOBILE_AUDIT_APPROVAL_OK\\n'",
          description: '输出移动端审批测试的固定标记',
          workdir: dirname(this.config.fixtureFile),
          sandbox_permissions: 'workspace-write',
          justification: '验证移动端审批交互',
        }, callId, options)
      } else {
        yield* this.tool(childTask ? '子智能体开始只读检查固定测试资料。'
          : '先只读检查本地测试资料，然后提供用于手机布局对比的长回复。', 'read', {
          file_path: this.config.fixtureFile, offset: 1, limit: 40,
        }, callId, options)
      }
      return
    }
    const resultText = result.content.filter(block => block.type === 'text').map(block => block.text).join('\n')
    if (scenario === 'child-read') {
      yield* this.text('子智能体已返回只读资料检查结果。MOBILE_AUDIT_CHILD_COMPLETE\n' +
        (resultText.includes('MOBILE_AUDIT_READ_OK') ? '已读到固定标记 MOBILE_AUDIT_READ_OK。' : resultText), options)
    } else if (scenario === 'subagent') {
      yield* this.text('子智能体工具已返回。可展开工具轨迹、进入子会话，然后返回父会话。\n\n' +
        'MOBILE_AUDIT_SUBAGENT_COMPLETE\n' + resultText, options)
    } else if (scenario === 'question') {
      yield* this.text('已收到提问工具结果：' + resultText + '\nMOBILE_AUDIT_QUESTION_COMPLETE', options)
    } else if (scenario === 'approval') {
      // Official bash rendering omits exit-code 0; interruption/nonzero markers append to stdout.
      const completed = result.role === 'tool' && result.isError !== true &&
        resultText.trim() === 'MOBILE_AUDIT_APPROVAL_OK'
      yield* this.text(completed
        ? '已批准并执行固定 printf 命令，没有读取或修改文件。MOBILE_AUDIT_APPROVAL_COMPLETE'
        : '审批演示未成功执行，不会自动重试。MOBILE_AUDIT_APPROVAL_NOT_RUN\n' + resultText, options)
    } else {
      yield* this.text(REPLY, options)
    }
  }
  private async *tool(intro: string, name: string, args: Record<string, unknown>,
    callId: ReturnType<typeof ToolCallId>, options: GenerateOptions): AsyncIterable<StreamChunk> {
    const argumentsJson = JSON.stringify(args)
    yield* this.textBlocks(intro, options)
    yield { type: 'block-start', index: 1, blockType: 'tool-call' }
    yield { type: 'tool-call-delta', index: 1, id: callId, name, argumentsDelta: argumentsJson }
    yield { type: 'block-end', index: 1, block: { type: 'tool-call', id: callId, name, arguments: argumentsJson } }
    yield { type: 'usage', usage: { inputTokens: 128, outputTokens: 64 } }
    yield { type: 'finish', reason: { kind: 'tool-calls' } }
  }
  private async *textBlocks(text: string, options: GenerateOptions): AsyncIterable<StreamChunk> {
    yield { type: 'block-start', index: 0, blockType: 'text' }
    for (let offset = 0; offset < text.length; offset += 72) {
      options.signal?.throwIfAborted()
      if (this.config.paceMs > 0) await delay(this.config.paceMs, undefined, { signal: options.signal })
      yield { type: 'text-delta', index: 0, text: text.slice(offset, offset + 72) }
    }
    yield { type: 'block-end', index: 0, block: { type: 'text', text } }
  }
  private async *text(text: string, options: GenerateOptions): AsyncIterable<StreamChunk> {
    yield* this.textBlocks(text, options)
    yield { type: 'usage', usage: { inputTokens: 128, outputTokens: Math.ceil(text.length / 2) } }
    yield { type: 'finish', reason: { kind: 'stop' } }
  }
}

/** Register one reversible route through the official LLM registry. */
export function apply(ctx: Context, config: Config): void {
  if (!Number.isInteger(config.paceMs) || config.paceMs < 0 || config.paceMs > 1000) {
    throw new Error('paceMs must be an integer between 0 and 1000')
  }
  if (!isAbsolute(config.fixtureFile) || !statSync(config.fixtureFile).isFile()) {
    throw new Error('fixtureFile must name an existing absolute file')
  }
  ctx.llm.registerAdapter(['mobile-audit'], new MobileAuditAdapter({ ...config, fixtureFile: realpathSync(config.fixtureFile) }))
}
