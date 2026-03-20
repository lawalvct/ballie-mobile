// ── Statutory / Tax Module Types ─────────────────────────────────────────────

// === Shared ===
export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// === Dashboard ===
export interface StatutoryDashboard {
  period: { month: string; start: string; end: string };
  vat: { output: number; input: number; net_payable: number; rate: number };
  paye: { total_tax: number };
  pension: { total: number; employee_rate: number; employer_rate: number };
  nsitf: { total: number; rate: number };
  compliance: { overdue_filings: number };
}

// === VAT Report ===
export interface VatTransaction {
  id: number;
  date: string;
  voucher_number: string;
  type: string | null;
  description: string | null;
  amount: number;
}

export interface VatReport {
  period: DateRange;
  summary: {
    vat_output: number;
    vat_input: number;
    net_payable: number;
    rate: number;
  };
  output_transactions: VatTransaction[];
  input_transactions: VatTransaction[];
}

// === PAYE Report ===
export interface PayeEmployee {
  employee_id: number;
  name: string;
  tin: string | null;
  department: string | null;
  gross_salary: number;
  consolidated_relief: number;
  taxable_income: number;
  monthly_tax: number;
}

export interface PayeReport {
  period: DateRange;
  summary: {
    total_gross: number;
    total_relief: number;
    total_taxable: number;
    total_tax: number;
    employee_count: number;
  };
  employees: PayeEmployee[];
  departments: { id: number; name: string }[];
}

// === Pension Report ===
export interface PensionPFA {
  pfa_provider: string;
  employee_count: number;
  employee_contribution: number;
  employer_contribution: number;
  total_contribution: number;
}

export interface PensionEmployee {
  employee_id: number;
  name: string;
  pfa_provider: string | null;
  pfa_name: string | null;
  rsa_pin: string | null;
  pension_pin: string | null;
  employee_contribution: number;
  employer_contribution: number;
  total: number;
}

export interface PensionReport {
  period: DateRange;
  summary: {
    total_employee_contribution: number;
    total_employer_contribution: number;
    total_contribution: number;
    employee_count: number;
    employee_rate: number;
    employer_rate: number;
  };
  by_pfa: PensionPFA[];
  employees: PensionEmployee[];
}

// === NSITF Report ===
export interface NsitfEmployee {
  employee_id: number;
  name: string;
  department: string | null;
  gross_salary: number;
  nsitf_contribution: number;
}

export interface NsitfReport {
  period: DateRange;
  summary: {
    total_nsitf: number;
    employee_count: number;
    rate: number;
  };
  employees: NsitfEmployee[];
}

// === Settings ===
export interface TaxRate {
  id: number;
  name: string;
  rate: number;
  type: "percentage" | "fixed";
  is_default: boolean;
}

export interface TaxSettings {
  vat_rate: number;
  vat_registration_number: string | null;
  tax_identification_number: string | null;
  tax_rates: TaxRate[];
  statutory_rates: {
    pension_employee: number;
    pension_employer: number;
    nsitf: number;
  };
}

export interface TaxSettingsUpdatePayload {
  vat_rate: number;
  vat_registration_number: string | null;
  tax_identification_number: string | null;
}

// === Filing History ===
export type FilingType = "vat" | "paye" | "pension" | "nsitf" | "wht" | "cit";
export type FilingStatus = "draft" | "filed" | "paid" | "overdue";

export interface TaxFiling {
  id: number;
  tenant_id: number;
  type: FilingType;
  reference_number: string | null;
  period_label: string;
  period_start: string;
  period_end: string;
  amount: number;
  status: FilingStatus;
  due_date: string | null;
  filed_date: string | null;
  paid_date: string | null;
  payment_reference: string | null;
  notes: string | null;
  filed_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface FilingListFilters {
  type?: FilingType;
  status?: FilingStatus;
  year?: number;
  per_page?: number;
  page?: number;
}

export interface FilingListResponse {
  filings: TaxFiling[];
  pagination: Pagination;
  summary: {
    paid: number;
    filed: number;
    draft: number;
    overdue: number;
  };
}

export interface CreateFilingPayload {
  type: FilingType;
  period_label: string;
  period_start: string;
  period_end: string;
  amount: number;
  status: FilingStatus;
  due_date?: string;
  reference_number?: string;
  notes?: string;
}

export interface UpdateFilingStatusPayload {
  status: FilingStatus;
  payment_reference?: string;
}

// === Report Filters ===
export interface ReportFilters {
  start_date?: string;
  end_date?: string;
}

export interface PayeReportFilters extends ReportFilters {
  department_id?: number;
}
