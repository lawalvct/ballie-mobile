export type AnnouncementPriority = "low" | "normal" | "high" | "urgent";

export type AnnouncementDeliveryMethod = "email" | "sms" | "both";

export type AnnouncementRecipientType = "all" | "department" | "selected";

export type AnnouncementStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed";

export interface AnnouncementStats {
  total?: number;
  sent?: number;
  scheduled?: number;
  draft?: number;
}

export interface AnnouncementRecord {
  id: number;
  title?: string;
  message?: string;
  priority?: AnnouncementPriority;
  delivery_method?: AnnouncementDeliveryMethod;
  recipient_type?: AnnouncementRecipientType;
  department_ids?: number[] | null;
  employee_ids?: number[] | null;
  status?: AnnouncementStatus;
  scheduled_at?: string | null;
  sent_at?: string | null;
  total_recipients?: number;
  email_sent_count?: number;
  sms_sent_count?: number;
  failed_count?: number;
  requires_acknowledgment?: boolean;
  expires_at?: string | null;
  attachment_url?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnnouncementRecipient {
  employee_id?: number;
  employee_name?: string;
  employee_email?: string;
  department_name?: string;
  email_sent?: boolean;
  email_sent_at?: string | null;
  sms_sent?: boolean;
  sms_sent_at?: string | null;
  acknowledged?: boolean;
  read?: boolean;
  read_at?: string | null;
}

export interface AnnouncementListParams {
  status?: AnnouncementStatus;
  priority?: AnnouncementPriority;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface AnnouncementListResponse {
  stats: AnnouncementStats;
  records: AnnouncementRecord[];
  pagination: PaginationInfo;
}

export interface AnnouncementDetailResponse {
  announcement: AnnouncementRecord;
  recipients: AnnouncementRecipient[];
}

export interface AnnouncementPreviewEmployee {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
}

export interface AnnouncementPreviewResponse {
  count: number;
  employees: AnnouncementPreviewEmployee[];
}

export interface AnnouncementAttachment {
  uri: string;
  name: string;
  type?: string;
}

export interface AnnouncementCreatePayload {
  title: string;
  message: string;
  priority: AnnouncementPriority;
  delivery_method: AnnouncementDeliveryMethod;
  recipient_type: AnnouncementRecipientType;
  department_ids?: number[];
  employee_ids?: number[];
  requires_acknowledgment?: boolean;
  scheduled_at?: string;
  expires_at?: string;
  send_now?: boolean;
  attachment?: AnnouncementAttachment;
}

export interface AnnouncementUpdatePayload {
  title?: string;
  message?: string;
  priority?: AnnouncementPriority;
  delivery_method?: AnnouncementDeliveryMethod;
  recipient_type?: AnnouncementRecipientType;
  department_ids?: number[];
  employee_ids?: number[];
  requires_acknowledgment?: boolean;
  scheduled_at?: string | null;
  expires_at?: string | null;
}
