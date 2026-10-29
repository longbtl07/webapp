export interface RegisterRequestBody {
  eventSlug: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  employeeId: string;
  department: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  ticketCode?: string;
  ticketId?: string;
}

export interface CheckinRequestBody {
  code: string;
  staffPin: string;
  operatorName?: string;
}

export interface CheckinResponse {
  success: boolean;
  message: string;
  codeStatus: "VALID" | "ALREADY_CHECKED_IN" | "INVALID" | "UNAUTHORIZED";
  ticket?: {
    id: string;
    ticketCode: string;
    fullName: string;
    email: string;
    employeeId: string;
    department: string;
    status: string;
    checkedInAt: string | null;
    checkedInBy: string | null;
    eventTitle: string;
  };
}
