import axiosInstance from '@/lib/axios';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'SUPPORT_AGENT' | 'ADMIN';
}

export const adminService = {
  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  createUser: async (data: CreateUserData) => {
    const response = await axiosInstance.post('/admin/users', data);
    return response.data;
  },

  updateUserRole: async (id: number, role: string) => {
    const response = await axiosInstance.put(`/admin/users/${id}/role?role=${role}`);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  },

  getUsersByRole: async (role: string) => {
    const response = await axiosInstance.get(`/admin/users/role/${role}`);
    return response.data;
  },
};