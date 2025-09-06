export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Para respuestas con error
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string | object;
}

// Para respuestas con paginación
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  total: number;
  page?: number;
  limit?: number;
}