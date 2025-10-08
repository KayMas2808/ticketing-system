import axiosInstance from '@/lib/axios';

export const fileService = {
  uploadFile: async (ticketId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(`/files/upload/${ticketId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadFile: async (attachmentId: number) => {
    const response = await axiosInstance.get(`/files/download/${attachmentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};