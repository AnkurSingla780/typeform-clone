import {
  FormSummary,
  FormDetail,
  FormCreateInput,
  FormUpdateInput,
  Question,
  QuestionCreateInput,
  QuestionUpdateInput,
  ResponseDetail,
  ResponseSubmit,
  FormStatistics,
} from './types';

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000/api';
const API_BASE = 'https://typeform-clone-rpgx.onrender.com/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An error occurred';
    let errorData = null;
    try {
      errorData = await response.json();
      if (typeof errorData?.detail === 'string') {
        errorDetail = errorData.detail;
      } else if (Array.isArray(errorData?.detail)) {
        errorDetail = errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      }
    } catch {
      errorDetail = response.statusText || `Request failed with status ${response.status}`;
    }
    throw new ApiError(errorDetail, response.status, errorData);
  }

  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return {} as T;
}

export const api = {
  // Forms
  getForms: () => request<FormSummary[]>('/forms'),
  createForm: (data: FormCreateInput) =>
    request<FormDetail>('/forms', { method: 'POST', body: JSON.stringify(data) }),
  getForm: (id: number) => request<FormDetail>(`/forms/${id}`),
  updateForm: (id: number, data: FormUpdateInput) =>
    request<FormDetail>(`/forms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteForm: (id: number) => request<{ message: string; id: number }>(`/forms/${id}`, { method: 'DELETE' }),
  duplicateForm: (id: number) =>
    request<FormDetail>(`/forms/${id}/duplicate`, { method: 'POST' }),
  publishForm: (id: number) =>
    request<FormDetail>(`/forms/${id}/publish`, { method: 'POST' }),
  unpublishForm: (id: number) =>
    request<FormDetail>(`/forms/${id}/unpublish`, { method: 'POST' }),

  // Questions
  createQuestion: (formId: number, data: QuestionCreateInput) =>
    request<Question>(`/forms/${formId}/questions`, { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (questionId: number, data: QuestionUpdateInput) =>
    request<Question>(`/questions/${questionId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (questionId: number) =>
    request<{ message: string; id: number }>(`/questions/${questionId}`, { method: 'DELETE' }),
  reorderQuestions: (formId: number, questionIds: number[]) =>
    request<Question[]>(`/forms/${formId}/questions/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ question_ids: questionIds }),
    }),

  // Responses & Statistics
  getFormResponses: (formId: number) =>
    request<ResponseDetail[]>(`/forms/${formId}/responses`),
  getResponseDetail: (responseId: number) =>
    request<ResponseDetail>(`/responses/${responseId}`),
  getFormStatistics: (formId: number) =>
    request<FormStatistics>(`/forms/${formId}/statistics`),

  // Public Endpoints
  getPublicForm: (slug: string) =>
    request<FormDetail>(`/public/forms/${slug}`),
  submitPublicResponse: (slug: string, data: ResponseSubmit) =>
    request<ResponseDetail>(`/public/forms/${slug}/responses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
