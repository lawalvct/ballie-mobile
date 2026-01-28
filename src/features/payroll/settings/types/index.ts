export interface PayrollSettings {
  employee_number_format?: string;
}

export interface PayrollSettingsResponse {
  settings: PayrollSettings;
}

export interface PayrollSettingsPayload {
  employee_number_format: string;
}
