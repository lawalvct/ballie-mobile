import apiClient from "../../../../api/client";
import type {
  AttendanceDailyParams,
  AttendanceDailyResponse,
  AttendanceEmployeeMonthlyResponse,
  AttendanceMonthlyReportResponse,
  AttendanceQrCodeResponse,
} from "../types";

class AttendanceService {
  private baseUrl = "/payroll/attendance";

  private cleanParams(params: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
  }

  async listDaily(
    params: AttendanceDailyParams = {},
  ): Promise<AttendanceDailyResponse> {
    const cleanParams = this.cleanParams(params);
    const response = await apiClient.get(this.baseUrl, { params: cleanParams });
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};

    const records = Array.isArray(data?.records)
      ? data.records
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(payload?.records)
          ? payload.records
          : [];

    return {
      date: data?.date || cleanParams.date || new Date().toISOString(),
      stats: data?.stats || payload?.stats || {},
      records,
    };
  }

  async getQrCode(
    type: "clock_in" | "clock_out",
    date?: string,
  ): Promise<AttendanceQrCodeResponse> {
    const response = await apiClient.get(`${this.baseUrl}/qr-code`, {
      params: this.cleanParams({ type, date }),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async clockIn(data: { employee_id: number; notes?: string }) {
    const response = await apiClient.post(`${this.baseUrl}/clock-in`, data);
    return (response as any)?.data ?? response;
  }

  async clockOut(data: { employee_id: number; notes?: string }) {
    const response = await apiClient.post(`${this.baseUrl}/clock-out`, data);
    return (response as any)?.data ?? response;
  }

  async markAbsent(data: {
    employee_id: number;
    date: string;
    reason?: string;
  }) {
    const response = await apiClient.post(`${this.baseUrl}/mark-absent`, data);
    return (response as any)?.data ?? response;
  }

  async markLeave(data: {
    employee_id: number;
    date: string;
    leave_type: string;
    reason?: string;
  }) {
    const response = await apiClient.post(`${this.baseUrl}/mark-leave`, data);
    return (response as any)?.data ?? response;
  }

  async manualEntry(data: {
    employee_id: number;
    date: string;
    clock_in_time: string;
    clock_out_time: string;
    break_minutes?: number;
    notes?: string;
  }) {
    const response = await apiClient.post(`${this.baseUrl}/manual-entry`, data);
    return (response as any)?.data ?? response;
  }

  async updateRecord(
    id: number,
    data: {
      clock_in?: string;
      clock_out?: string;
      status?: string;
      absence_reason?: string | null;
      admin_notes?: string | null;
    },
  ) {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return (response as any)?.data ?? response;
  }

  async markHalfDay(id: number) {
    const response = await apiClient.post(`${this.baseUrl}/${id}/half-day`);
    return (response as any)?.data ?? response;
  }

  async approve(id: number) {
    const response = await apiClient.post(`${this.baseUrl}/${id}/approve`);
    return (response as any)?.data ?? response;
  }

  async bulkApprove(attendanceIds: number[]) {
    const response = await apiClient.post(`${this.baseUrl}/bulk-approve`, {
      attendance_ids: attendanceIds,
    });
    return (response as any)?.data ?? response;
  }

  async monthlyReport(
    year: number,
    month: number,
  ): Promise<AttendanceMonthlyReportResponse> {
    const response = await apiClient.get(`${this.baseUrl}/monthly-report`, {
      params: this.cleanParams({ year, month }),
    });
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }

  async employeeMonthly(
    employeeId: number,
    year: number,
    month: number,
  ): Promise<AttendanceEmployeeMonthlyResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/employee/${employeeId}`,
      {
        params: this.cleanParams({ year, month }),
      },
    );
    const payload = (response as any)?.data ?? response;
    return payload?.data ?? payload;
  }
}

export const attendanceService = new AttendanceService();
