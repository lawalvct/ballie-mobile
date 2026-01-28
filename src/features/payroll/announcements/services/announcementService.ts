import apiClient from "../../../../api/client";
import type {
  AnnouncementCreatePayload,
  AnnouncementDetailResponse,
  AnnouncementListParams,
  AnnouncementListResponse,
  AnnouncementPreviewResponse,
  AnnouncementRecord,
  AnnouncementUpdatePayload,
} from "../types";

class AnnouncementService {
  private baseUrl = "/payroll/announcements";

  private cleanParams(params: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
  }

  async list(
    params: AnnouncementListParams = {},
  ): Promise<AnnouncementListResponse> {
    const cleanParams = this.cleanParams(params);
    const response = await apiClient.get(this.baseUrl, { params: cleanParams });
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};

    const stats = data?.stats ?? payload?.stats ?? {};
    const recordsBlock =
      data?.records ?? payload?.records ?? data?.data ?? data;

    const records = Array.isArray(recordsBlock?.data)
      ? recordsBlock.data
      : Array.isArray(recordsBlock)
        ? recordsBlock
        : [];

    const paginationSource =
      recordsBlock?.current_page ||
      recordsBlock?.last_page ||
      recordsBlock?.total
        ? recordsBlock
        : data?.pagination ||
          data?.meta ||
          payload?.pagination ||
          payload?.meta ||
          payload?.data?.pagination ||
          payload?.data?.meta ||
          payload?.data ||
          {};

    const totalFromSource =
      paginationSource?.total ?? data?.total ?? payload?.total ?? 0;
    const perPageFromSource =
      paginationSource?.per_page ??
      (cleanParams.per_page as number | undefined);
    const currentPageFromSource =
      paginationSource?.current_page ??
      (cleanParams.page as number | undefined);

    const total =
      typeof totalFromSource === "number" ? totalFromSource : records.length;
    const per_page =
      typeof perPageFromSource === "number"
        ? perPageFromSource
        : records.length || 20;
    const current_page =
      typeof currentPageFromSource === "number" ? currentPageFromSource : 1;
    const last_page =
      typeof paginationSource?.last_page === "number"
        ? paginationSource.last_page
        : Math.max(1, Math.ceil(total / (per_page || 1)));

    const from =
      typeof paginationSource?.from === "number"
        ? paginationSource.from
        : total === 0
          ? 0
          : (current_page - 1) * per_page + 1;
    const to =
      typeof paginationSource?.to === "number"
        ? paginationSource.to
        : total === 0
          ? 0
          : Math.min(total, from + records.length - 1);

    return {
      stats,
      records: records as AnnouncementRecord[],
      pagination: {
        current_page,
        last_page,
        per_page,
        total,
        from,
        to,
      },
    };
  }

  async show(id: number): Promise<AnnouncementDetailResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    const payload = (response as any)?.data ?? response;
    const data = payload?.data ?? payload ?? {};
    return {
      announcement: data?.announcement ?? payload?.announcement ?? data,
      recipients: data?.recipients ?? payload?.recipients ?? [],
    };
  }

  async previewRecipients(payload: {
    recipient_type: string;
    department_ids?: number[];
    employee_ids?: number[];
  }): Promise<AnnouncementPreviewResponse> {
    const response = await apiClient.post(
      `${this.baseUrl}/preview-recipients`,
      payload,
    );
    const data = (response as any)?.data ?? response;
    const body = data?.data ?? data ?? {};
    return {
      count: body?.count ?? 0,
      employees: body?.employees ?? [],
    };
  }

  async create(payload: AnnouncementCreatePayload) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("message", payload.message);
    formData.append("priority", payload.priority);
    formData.append("delivery_method", payload.delivery_method);
    formData.append("recipient_type", payload.recipient_type);
    formData.append(
      "requires_acknowledgment",
      payload.requires_acknowledgment ? "1" : "0",
    );
    formData.append("send_now", payload.send_now ? "1" : "0");

    if (payload.scheduled_at) {
      formData.append("scheduled_at", payload.scheduled_at);
    }
    if (payload.expires_at) {
      formData.append("expires_at", payload.expires_at);
    }
    if (payload.department_ids?.length) {
      payload.department_ids.forEach((id) =>
        formData.append("department_ids[]", String(id)),
      );
    }
    if (payload.employee_ids?.length) {
      payload.employee_ids.forEach((id) =>
        formData.append("employee_ids[]", String(id)),
      );
    }
    if (payload.attachment) {
      formData.append("attachment", {
        uri: payload.attachment.uri,
        name: payload.attachment.name,
        type: payload.attachment.type || "application/octet-stream",
      } as any);
    }

    const response = await apiClient.post(this.baseUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return (response as any)?.data ?? response;
  }

  async update(id: number, payload: AnnouncementUpdatePayload) {
    const data = {
      ...payload,
      department_ids: payload.department_ids?.length
        ? payload.department_ids
        : undefined,
      employee_ids: payload.employee_ids?.length
        ? payload.employee_ids
        : undefined,
    };
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return (response as any)?.data ?? response;
  }

  async sendNow(id: number) {
    const response = await apiClient.post(`${this.baseUrl}/${id}/send`);
    return (response as any)?.data ?? response;
  }

  async delete(id: number) {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const announcementService = new AnnouncementService();
