export const assetPath = (file: string) => `/assets/${file}`

export const navItems = [
  { key: 'home', label: '平台概览', href: '#top' },
  { key: 'capabilities', label: '产品介绍', href: '#agent' },
  { key: 'solutions', label: '解决方案', href: '#solutions' },
  { key: 'guides', label: '接入指南', href: '#guides' },
  { key: 'help', label: '帮助中心', href: '#help' },
  { key: 'contact', label: '联系我们', href: '#contact' },
] as const

export type NavKey = (typeof navItems)[number]['key']

export const capabilities = [
  { id: 'cap-voice', label: '语音交互' },
  { id: 'cap-vision', label: '视觉与文档理解' },
  { id: 'cap-dialogue', label: '对话与需求理解' },
  { id: 'cap-rag', label: 'RAG 知识库接入与问答' },
  { id: 'cap-generation', label: '内容与方案生成' },
  { id: 'cap-recommendation', label: '个性化推荐与匹配' },
  { id: 'cap-emotion-ai', label: '情绪线索理解与回应' },
  { id: 'cap-orchestration', label: '任务编排与执行' },
] as const

export type CapabilityId = (typeof capabilities)[number]['id']

export type Solution = {
  id: string
  name: string
  description: string
  caps: CapabilityId[]
}

// Mapping taken from the 10 variants of the Figma component "方案与能力关联图".
export const solutions: Solution[] = [
  {
    id: 'education',
    name: '教育场景解决方案',
    description: '为学习疑问与日常练习提供及时、连贯的陪伴。',
    caps: ['cap-voice', 'cap-vision', 'cap-dialogue', 'cap-rag', 'cap-generation', 'cap-recommendation'],
  },
  {
    id: 'elder',
    name: '适老化解决方案',
    description: '通过自然交流和清晰引导，降低设备与服务的使用门槛。',
    caps: ['cap-voice', 'cap-vision', 'cap-dialogue', 'cap-rag', 'cap-emotion-ai', 'cap-orchestration'],
  },
  {
    id: 'sleep',
    name: '助眠解决方案',
    description: '把睡前内容、灯光和定时安排组合成连贯的放松流程。',
    caps: ['cap-voice', 'cap-dialogue', 'cap-recommendation', 'cap-orchestration'],
  },
  {
    id: 'home',
    name: '智能家居解决方案',
    description: '用一句自然表达连接家庭设备与日常任务。',
    caps: ['cap-voice', 'cap-dialogue', 'cap-orchestration'],
  },
  {
    id: 'emotion',
    name: '情绪陪伴解决方案',
    description: '通过持续交流与可选内容，提供日常陪伴和放松引导。',
    caps: ['cap-voice', 'cap-dialogue', 'cap-recommendation', 'cap-emotion-ai'],
  },
  {
    id: 'space',
    name: '智慧空间解决方案',
    description: '让酒店和办公空间的服务信息与环境控制共同响应需求。',
    caps: ['cap-vision', 'cap-dialogue', 'cap-recommendation', 'cap-orchestration'],
  },
  {
    id: 'lighting',
    name: '灯光设计生成方案',
    description: '把空间需求整理成可讨论、可校核的灯光概念方案。',
    caps: ['cap-vision', 'cap-dialogue', 'cap-rag', 'cap-generation', 'cap-recommendation'],
  },
  {
    id: 'sales',
    name: '门店销售单生成方案',
    description: '把客户需求与选品记录快速整理成可确认的销售单草稿。',
    caps: ['cap-voice', 'cap-dialogue', 'cap-rag', 'cap-generation', 'cap-recommendation', 'cap-orchestration'],
  },
  {
    id: 'aftercare',
    name: '产品服务与售后',
    description: '从产品问答到问题整理，帮助用户找到清晰的服务下一步。',
    caps: ['cap-voice', 'cap-vision', 'cap-dialogue', 'cap-rag', 'cap-generation', 'cap-orchestration'],
  },
  {
    id: 'health',
    name: '个人健康咨询',
    description: '把可信健康知识转化成易理解、可继续咨询的信息。',
    caps: ['cap-voice', 'cap-dialogue', 'cap-rag', 'cap-generation'],
  },
]

/**
 * Connector slots from the Figma diagram (1312px canvas). `top`/`h` are the slot box;
 * each slot has an inactive ("背景") and active ("已启用") SVG asset with their own heights.
 */
type Connector = { top: number; h: number; off: [string, number]; on: [string, number] }

export const leftConnectors: Connector[] = [
  { top: 100, h: 280, off: ['ffe7b.svg', 281], on: ['7f6e7.svg', 282] },
  { top: 164, h: 216, off: ['5d62e.svg', 217], on: ['79a7b.svg', 218] },
  { top: 228, h: 152, off: ['bf556.svg', 153], on: ['9b2e2.svg', 154] },
  { top: 292, h: 88, off: ['911bb.svg', 89], on: ['c6c39.svg', 90] },
  { top: 356, h: 24, off: ['bdb7a.svg', 25], on: ['a806e.svg', 26] },
  { top: 380, h: 40, off: ['d532e.svg', 41], on: ['e0d2f.svg', 42] },
  { top: 380, h: 104, off: ['81106.svg', 105], on: ['3512b.svg', 106] },
  { top: 380, h: 168, off: ['16d96.svg', 169], on: ['18c12.svg', 170] },
  { top: 380, h: 232, off: ['64846.svg', 233], on: ['68b51.svg', 234] },
  { top: 380, h: 296, off: ['3e701.svg', 297], on: ['1d8e2.svg', 298] },
]

// The dialogue slot is active in every variant, so the design only ships its active asset.
export const rightConnectors: Connector[] = [
  { top: 164, h: 216, off: ['ac427.svg', 217], on: ['13c4d.svg', 218] },
  { top: 228, h: 152, off: ['03721.svg', 153], on: ['bc745.svg', 154] },
  { top: 292, h: 88, off: ['d34b4.svg', 90], on: ['d34b4.svg', 90] },
  { top: 356, h: 24, off: ['c1138.svg', 25], on: ['132ac.svg', 26] },
  { top: 380, h: 40, off: ['836bb.svg', 41], on: ['dfaa0.svg', 42] },
  { top: 380, h: 104, off: ['fe570.svg', 105], on: ['b7cbc.svg', 106] },
  { top: 380, h: 168, off: ['1b75a.svg', 169], on: ['3b333.svg', 170] },
  { top: 380, h: 232, off: ['addbd.svg', 233], on: ['50ff7.svg', 234] },
]

