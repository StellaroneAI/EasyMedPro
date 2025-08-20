// MCP Client Types and Schemas
export interface MCPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  latency_ms: number;
}

export interface MCPRequest {
  tool: string;
  parameters: Record<string, any>;
  user_id?: string;
  session_id?: string;
}

// MCP Auth/Comm Server Types
export interface SendOTPRequest {
  phone_number: string;
  message_template?: string;
  user_name?: string;
}

export interface SendOTPResponse {
  otp_id: string;
  delivery_status: 'sent' | 'failed' | 'pending';
  expires_at: string;
}

export interface SendReminderRequest {
  recipient: string;
  type: 'sms' | 'email' | 'push';
  message: string;
  scheduled_for?: string;
}

export interface SendReminderResponse {
  reminder_id: string;
  status: 'scheduled' | 'sent' | 'failed';
  delivery_time: string;
}

// MCP Appointments Server Types
export interface SearchSlotsRequest {
  provider_id?: string;
  specialty?: string;
  date_range: {
    start: string;
    end: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius_km: number;
  };
}

export interface AppointmentSlot {
  slot_id: string;
  provider_id: string;
  provider_name: string;
  specialty: string;
  datetime: string;
  duration_minutes: number;
  price: number;
  location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  availability: 'available' | 'limited' | 'waitlist';
}

export interface BookAppointmentRequest {
  slot_id: string;
  patient_id: string;
  notes?: string;
  payment_method?: 'online' | 'cash' | 'insurance';
}

export interface BookAppointmentResponse {
  appointment_id: string;
  confirmation_code: string;
  meeting_link?: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface CancelAppointmentRequest {
  appointment_id: string;
  reason?: string;
}

export interface CreateMeetingLinkRequest {
  appointment_id: string;
  duration_minutes?: number;
}

export interface CreateMeetingLinkResponse {
  meeting_link: string;
  meeting_id: string;
  expires_at: string;
}

// MCP Symptoms/Triage Server Types
export interface TriageRequest {
  symptoms: string[];
  patient_info: {
    age: number;
    gender: 'male' | 'female' | 'other';
    medical_history?: string[];
    current_medications?: string[];
  };
  severity_level?: 'low' | 'medium' | 'high' | 'emergency';
}

export interface TriageResponse {
  triage_id: string;
  risk_level: 'low' | 'medium' | 'high' | 'emergency';
  confidence_score: number;
  recommendations: {
    action: string;
    urgency: 'immediate' | 'within_24h' | 'within_week' | 'routine';
    description: string;
  }[];
  follow_up_questions?: string[];
  disclaimers: string[];
}

export interface FollowupQuestionsRequest {
  triage_id: string;
  answers: Record<string, string>;
}

// MCP EHR-RCM Server Types
export interface ClaimStatusRequest {
  claim_id?: string;
  patient_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ClaimStatus {
  claim_id: string;
  patient_id: string;
  status: 'submitted' | 'processing' | 'approved' | 'denied' | 'paid';
  amount: number;
  submission_date: string;
  last_updated: string;
  denial_reasons?: string[];
}

export interface DenialReasonsRequest {
  claim_id: string;
}

export interface DenialReasonsResponse {
  claim_id: string;
  primary_reason: string;
  secondary_reasons: string[];
  recommended_actions: string[];
  appeal_deadline?: string;
}

// Error types
export class MCPError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

export class MCPTimeoutError extends MCPError {
  constructor(tool: string, timeout_ms: number) {
    super('MCP_TIMEOUT', `MCP call to ${tool} timed out after ${timeout_ms}ms`);
  }
}

export class MCPConnectionError extends MCPError {
  constructor(message: string) {
    super('MCP_CONNECTION_ERROR', message);
  }
}
