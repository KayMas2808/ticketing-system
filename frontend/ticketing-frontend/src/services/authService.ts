import axiosInstance from '@/lib/axios';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'USER' | 'SUPPORT_AGENT' | 'ADMIN';
}

export const authService = {
  login: async (data: LoginData) => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },
};