import { api } from '@/api';

export type DoctorsReportResponse = {
  date: string;
  appointmentCount: number;
  entrada: number;
  profissional: number;
  clinica: number;
};

export const getDoctorsReport = async (doctorId: string, month?: string): Promise<DoctorsReportResponse[]> => {
  const params: Record<string, string> = { doctorId };
  if (month) {
    params.month = month;
  }
  const response = await api.get<DoctorsReportResponse[]>('/reports/doctors', { params });
  return response.data;
};

export type MonthlyIncomeOutcomeResponse = {
  income: number;
  outcome: number;
};

export const getMonthlyIncomeOutcome = async (month?: string): Promise<MonthlyIncomeOutcomeResponse> => {
  const params: Record<string, string> = {};
  if (month) {
    params.month = month;
  }
  const response = await api.get<MonthlyIncomeOutcomeResponse>('/reports/monthly-income-outcome', { params });
  return response.data;
};

