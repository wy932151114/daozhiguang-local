// ============================================================
// DZS Web Console — React Query Hooks
// 统一API调用层，所有页面通过 hooks 发起请求
// ============================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  calculateBazi,
  analyzeEnergy,
  calculateNinePalaceApi,
  generateAI,
  analyzeCVScan,
  getValidationStatus,
  type BaziInput,
  type BaziResult,
  type EnergyAnalysisInput,
  type WuxingEnergyResult,
  type NinePalaceResult,
  type AiGenerateInput,
  type AiGenerateResult,
  type CVScanResult,
  type ValidationStatus,
  type APIResponse,
} from '../api';

// ============================================================
// Query Keys
// ============================================================
export const queryKeys = {
  bazi: ['bazi'] as const,
  energy: ['energy'] as const,
  ninePalace: (year: number, month: number, day: number) => ['nine-palace', year, month, day] as const,
  validation: ['validation'] as const,
};

// ============================================================
// 八字排盘 Hook
// ============================================================
export function useBaziMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BaziInput) => calculateBazi(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.setQueryData(queryKeys.bazi, res.data);
      }
    },
  });
}

export function useBaziResult() {
  return useQuery({
    queryKey: queryKeys.bazi,
    queryFn: () => null as BaziResult | null,
    enabled: false,
    initialData: null,
  });
}

// ============================================================
// 五行能量 Hook
// ============================================================
export function useEnergyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EnergyAnalysisInput) => analyzeEnergy(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.setQueryData(queryKeys.energy, res.data);
      }
    },
  });
}

// ============================================================
// 九宫飞星 Hook
// ============================================================
export function useNinePalaceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ year, month, day }: { year: number; month: number; day: number }) =>
      calculateNinePalaceApi(year, month, day),
    onSuccess: (res, vars) => {
      if (res.success) {
        queryClient.setQueryData(queryKeys.ninePalace(vars.year, vars.month, vars.day), res.data);
      }
    },
  });
}

// ============================================================
// AI 生成 Hook
// ============================================================
export function useAiMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AiGenerateInput) => generateAI(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.setQueryData(['ai-result'], res.data);
      }
    },
  });
}

// ============================================================
// CV 扫描 Hook
// ============================================================
export function useCVMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, any>) => analyzeCVScan(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.setQueryData(['cv-result'], res.data);
      }
    },
  });
}

// ============================================================
// 验证状态 Hook
// ============================================================
export function useValidationQuery() {
  return useQuery({
    queryKey: queryKeys.validation,
    queryFn: async () => {
      const res = await getValidationStatus();
      return res.success ? res.data : null;
    },
    refetchInterval: 30000,
  });
}
