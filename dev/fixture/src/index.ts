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

/** Compact synthetic advice for everyday mobile reading screenshots. */
export const DAILY_REPLY = [
  '建议先解决登录过程中的阻碍，再调整视觉细节：',
  '',
  '1. **P0 · 让操作更明确**：把“登录”设为唯一主按钮，忘记密码与注册作为次级入口，避免用户反复寻找下一步。',
  '2. **P1 · 减少输入负担**：账号与密码保留清晰标签，支持密码显示切换；错误提示放在对应输入框旁，并保留已填内容。',
  '3. **P1 · 照顾单手与键盘状态**：让按钮有足够的触摸区域，键盘弹出时仍能看到当前输入框和登录入口，减少不必要的滚动。',
  '',
  '**下一步**：先确认现有登录流程与错误状态，再画一版低保真方案，重点检查小屏和键盘弹出后的操作路径。以上是建议，不是已完成的改动或测试。',
  '',
  '_本地演示：建议与统计为合成测试内容，未修改业务文件。_',
].join('\n')

/** Distinct finite task markers: parent delegates once, leaf reads once and stops. */
export const NESTED_PARENT_MARKER = 'MOBILE_AUDIT_NESTED_PARENT_TASK'
export const NESTED_LEAF_MARKER = 'MOBILE_AUDIT_NESTED_LEAF_TASK'
export const NESTED_PARENT_DESCRIPTION = 'MOBILE_AUDIT_NESTED_B · 两层目录父节点'
export const NESTED_LEAF_DESCRIPTION = 'MOBILE_AUDIT_NESTED_D · 只读叶子'

/** Stateless progression derives only from the current request history. */
export class MobileAuditAdapter extends LlmAdapter {
  constructor(private readonly config: Config) { super() }
  override providerInfo(provider: string) { return { id: provider, name: 'Mobile Audit (local fixture)' } }
  override async listModels(provider: string) {
    return [
      { provider, id: 'mobile-audit', name: 'Mobile Audit', description: 'Deterministic local Chinese reply + read tool' },
      { provider, id: 'mobile-audit-extended-preview', name: 'Mobile Audit — Extended Reasoning Preview',
        description: 'Local synthetic menu stress fixture; no external model, network or credentials' },
    ]
  }
  override async resolveModel(provider: string, model: string) {
    const entry = (await this.listModels(provider)).find(candidate => candidate.id === model)
    if (entry === undefined) throw new Error('Mobile Audit does not support model ' + model)
    return { ...entry, context: { contextWindow: 131072 } }
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
    // Markers precede user trigger text; only the marked parent delegates.
    const childTask = prompt.startsWith('MOBILE_AUDIT_CHILD_TASK')
    const scenario = prompt.startsWith(NESTED_LEAF_MARKER) ? 'nested-leaf'
      : prompt.startsWith(NESTED_PARENT_MARKER) ? 'nested-parent'
      : childTask ? 'child-read'
      : prompt.includes('演示多层子智能体') ? 'nested-root'
      : prompt.includes('演示后台任务') ? 'background'
      : prompt.includes('演示子智能体') ? 'subagent'
      : prompt.includes('演示提问') ? 'question'
      : prompt.includes('演示审批') ? 'approval'
      : prompt.includes('整理移动端登录页的改进清单') ? 'daily-read' : 'read'
    const callId = ToolCallId('mobile-audit-' + scenario + '-' + String(Math.max(0, lastUser)))
    const result = options.messages.slice(lastUser + 1).find(message =>
      message.role === 'tool' && message.source?.kind === 'tool' && message.source.callId === callId)
    if (result === undefined) {
      if (scenario === 'background') {
        yield* this.tool('提交一个约20秒的本地后台测试任务，只输出固定标记。', 'bash', {
          command: 'node -e "setTimeout(() => console.log(\'MOBILE_AUDIT_BACKGROUND_DONE\'), 20000)"',
          description: '演示本地后台任务固定标记',
          workdir: dirname(this.config.fixtureFile),
          run_in_background: true,
        }, callId, options)
      } else if (scenario === 'nested-root' || scenario === 'nested-parent') {
        const parent = scenario === 'nested-root'
        yield* this.tool(parent ? '创建固定两层目录测试父节点B，由其首轮创建叶子D。' : '父节点B首轮仅创建一次只读叶子D。', 'subagent', {
          description: parent ? NESTED_PARENT_DESCRIPTION : NESTED_LEAF_DESCRIPTION,
          prompt: parent
            ? NESTED_PARENT_MARKER + '\n只创建一次固定只读叶子D，等待工具结果后结束。不要自我调用或创建其他子代理。'
            : NESTED_LEAF_MARKER + '\n只读取固定测试资料并给出简短确认后结束。不要创建子代理；不得进入父节点测试场景。',
          run_in_background: false,
        }, callId, options)
      } else if (scenario === 'subagent') {
        yield* this.tool('创建一个本地子智能体，只读测试资料并等待其简短回复。', 'subagent', {
          description: prompt.split('：').slice(1).join('：').trim() || '只读检查手机测试资料',
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
        yield* this.tool(childTask || scenario === 'nested-leaf' ? '子智能体开始只读检查固定测试资料。'
          : scenario === 'daily-read' ? '先读取本地参考资料，再整理一份简短的改进建议。'
          : '先只读检查本地测试资料，然后提供用于手机布局对比的长回复。', 'read', {
          file_path: this.config.fixtureFile, offset: 1, limit: 40,
        }, callId, options)
      }
      return
    }
    const resultText = result.content.filter(block => block.type === 'text').map(block => block.text).join('\n')
    if (scenario === 'background') {
      const submitted = result.isError !== true && /^started background job \S+/.test(resultText.trim())
      yield* this.text(submitted
        ? '本地后台测试已提交，尚未完成。请查看右上角后台任务与更多菜单；任务结束以后以实际通知为准。'
        : '后台测试未确认提交，不会自动重试。\n' + resultText, options)
    } else if (scenario === 'nested-leaf' || scenario === 'nested-parent' || scenario === 'nested-root') {
      const expected = scenario === 'nested-leaf' ? 'MOBILE_AUDIT_READ_OK'
        : scenario === 'nested-parent' ? 'MOBILE_AUDIT_NESTED_D_COMPLETE' : 'MOBILE_AUDIT_NESTED_B_COMPLETE'
      const marker = scenario === 'nested-leaf' ? 'MOBILE_AUDIT_NESTED_D'
        : scenario === 'nested-parent' ? 'MOBILE_AUDIT_NESTED_B' : 'MOBILE_AUDIT_NESTED_ROOT'
      const completed = result.isError !== true && resultText.includes(expected)
      yield* this.text((completed ? '固定两层测试步骤完成。' + marker + '_COMPLETE'
        : '固定两层测试步骤未确认完成，不自动重试。' + marker + '_NOT_COMPLETE') + '\n' + resultText, options)
    } else if (scenario === 'child-read') {
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
    } else if (scenario === 'daily-read') {
      yield* this.text(DAILY_REPLY, options)
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
