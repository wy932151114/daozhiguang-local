// ============================================================
// DZS Web Console — API 客户端（统一契约层）
// 所有API返回 { success: true, data: T, timestamp: string, source: string }
// 所有页面通过 result.data.xxx 访问数据
// ============================================================

import axios from 'axios';

// ============================================================
// 统一 API 响应类型
// ============================================================
export interface APIResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  source: string;
}

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================
// 八字排盘
// ============================================================
export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: string;
  longitude?: number;
  birthPlace?: string;
  useTrueSolar?: boolean;
}

export interface BaziPillar {
  heavenlyStem: string;
  earthlyBranch: string;
  full: string;
  nayin: string;
  hiddenStems: string[];
  kongWang: string[];
  tenGod?: string;
}

export interface BaziResult {
  pillars: {
    year: BaziPillar;
    month: BaziPillar;
    day: BaziPillar;
    hour: BaziPillar;
  };
  dayMaster: string;
  dayMasterElement: string;
  gender: string;
  elementBalance: {
    scores: Record<string, number>;
    percentage: Record<string, number>;
    totalScore: number;
  };
  strength: {
    bodyStrength: string;
    strengthScore: number;
    deLing: boolean;
    deDi: boolean;
    deShi: boolean;
    rootBranches: string[];
    supportPower: number;
    opposePower: number;
    description: string;
  };
  usefulGod: {
    yongShen: string[];
    xiShen: string[];
    jiShen: string[];
    balanceState: string;
    missing: string[];
    excess: string[];
  };
  trueSolarTime?: {
    hour: number;
    minute: number;
    shichen: string;
    crossed: boolean;
    offsetMinutes: number;
  };
}

export async function calculateBazi(input: BaziInput): Promise<APIResponse<BaziResult>> {
  const { data } = await api.post<APIResponse<BaziResult>>('/bazi/calculate', input);
  return data;
}

// ============================================================
// 五行能量分析
// ============================================================
export interface EnergyAnalysisInput {
  baziResult: { elementBalance: { scores: Record<string, number> } };
  monthBranch: string;
  currentYear?: number;
}

export interface EnergyFieldItem {
  base: number;
  seasonalBoost: number;
  finalScore: number;
  finalPercent: number;
}

export interface WuxingEnergyResult {
  energyField: {
    wood: EnergyFieldItem;
    fire: EnergyFieldItem;
    earth: EnergyFieldItem;
    metal: EnergyFieldItem;
    water: EnergyFieldItem;
  };
  totalEnergy: number;
  dominantElement: string;
  balanceState: string;
  stability: number;
}

export async function analyzeEnergy(input: EnergyAnalysisInput): Promise<APIResponse<WuxingEnergyResult>> {
  const { data } = await api.post<APIResponse<WuxingEnergyResult>>('/energy/analyze', input);
  return data;
}

// ============================================================
// 九宫飞星
// ============================================================
export interface PalaceData {
  position: number;
  name: string;
  direction: string;
  star: {
    number: number;
    name: string;
    wuxing: string;
    type: string;
    color: string;
  };
  energy: number;
  type: string;
  suitable?: string[];
  avoid?: string[];
}

export interface NinePalaceResult {
  palaces: PalaceData[];
  year: PalaceData[];
  month: PalaceData[];
  day: PalaceData[];
  summary: {
    bestDirection: string;
    worstDirection: string;
    auspiciousStars: number[];
    inauspiciousStars: number[];
    bestTime: string;
  };
  text: string;
}

export async function calculateNinePalaceApi(year: number, month: number, day: number): Promise<APIResponse<NinePalaceResult>> {
  const { data } = await api.post<APIResponse<NinePalaceResult>>('/nine-palace/calculate', { year, month, day });
  return data;
}

// ============================================================
// AI 生成
// ============================================================
export interface AiGenerateInput {
  type: string;
  prompt: string;
  systemPrompt: string;
  baziData?: any;
  energyData?: any;
}

export interface AiGenerateResult {
  output: string;
  validation: { passed: boolean; errors: string[]; warnings: string[] };
  tokenUsage: { prompt: number; completion: number; total: number };
  riskCheck: { passed: boolean; warnings: string[] };
}

export async function generateAI(input: AiGenerateInput): Promise<APIResponse<AiGenerateResult>> {
  const { data } = await api.post<APIResponse<AiGenerateResult>>('/ai/generate', input);
  return data;
}

// ============================================================
// CV 空间扫描
// ============================================================
export interface CVElement {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  wuxing: string;
}

export interface CVSpatialMapping {
  palace: string;
  elements: Array<{ type: string; x: number; y: number }>;
}

export interface CVConflict {
  type: string;
  description: string;
  severity: string;
  remedy: string;
}

export interface CVAdvice {
  type: string;
  content: string;
}

export interface CVScanResult {
  elements: CVElement[];
  spatialMap: CVSpatialMapping[];
  confidence: number;
  conflicts: CVConflict[];
  advice: CVAdvice[];
}

export async function analyzeCVScan(input: Record<string, any>): Promise<APIResponse<CVScanResult>> {
  const { data } = await api.post<APIResponse<CVScanResult>>('/cv/analyze', input, { timeout: 60000 });
  return data;
}

// ============================================================
// 验证状态
// ============================================================
export interface ValidationStatus {
  passed: boolean;
  errors: number;
  warnings: number;
  lastCheck: string;
}

export async function getValidationStatus(): Promise<APIResponse<ValidationStatus>> {
  const { data } = await api.get<APIResponse<ValidationStatus>>('/validation/status');
  return data;
}

export default api;
