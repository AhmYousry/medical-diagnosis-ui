export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'doctor' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  is_email_verified: boolean
  created_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_at: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface DoctorProfile {
  id: string
  user_id: string
  license_number: string
  specialization: string
  clinic_name?: string
  bio?: string
  verification_status: 'pending' | 'verified' | 'rejected'
  rejection_reason?: string
  created_at: string
}

export interface DoctorRegistrationRequest {
  license_number: string
  specialization: string
  clinic_name?: string
  bio?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface UploadedFile {
  id: string
  storage_key: string
  original_filename: string
  content_type: string
  size_bytes: number
  checksum_sha256?: string
  status: string
  created_at: string
  updated_at: string
}

export interface UploadResponse extends UploadedFile {}

export interface Prediction {
  id: string
  uploaded_file_id: string
  requested_by_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  model_name?: string
  model_version?: string
  predicted_label?: string
  confidence_score?: number
  result?: Record<string, unknown> | string | null
  error_message?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface PredictionListResponse {
  predictions: Prediction[]
  total: number
}

// Shape of the JSON payload returned by the AI model service
// (stored verbatim in Prediction.result)
export interface AIPredictionResult {
  "Predicted class"?: string
  confidence?: number
  model?: string
  model_version?: string
  device?: string
  tta?: boolean
  threshold?: number
  pathologies?: Record<string, number>          // label -> probability (0-1)
  top_findings?: { label: string; probability: number }[]
  inference_time_ms?: number
}

export interface AdminUserResponse extends User {
  doctor_profile_id?: string
  doctor_verification_status?: string
  doctor_specialization?: string
}

export interface AdminPredictionResponse extends Prediction {
  requested_by_email?: string
  requested_by_name?: string
}

export interface PredictionLog {
  id: string
  prediction_id: string
  actor_user_id?: string
  actor_name?: string
  event: string
  message?: string
  metadata?: string
  created_at: string
}

export interface Notification {
  id: string
  type: 'system' | 'prediction_completed' | 'prediction_failed' | string
  title: string
  message: string
  status: 'unread' | 'read' | 'archived'
  payload?: Record<string, unknown> | null
  read_at?: string | null
  created_at: string
}
