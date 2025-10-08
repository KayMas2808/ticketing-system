import axiosInstance from '@/lib/axios';

export interface TicketData {
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface UpdateStatusData {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

export interface AssignTicketData {
  assigneeId: number;
}

export interface RateTicketData {
  rating: number;
  feedback?: string;
}

export interface CommentData {
  content: string;
}

export const ticketService = {
  getAllTickets: async () => {
    const response = await axiosInstance.get('/tickets');
    return response.data;
  },

  getTicketById: async (id: number) => {
    const response = await axiosInstance.get(`/tickets/${id}`);
    return response.data;
  },

  createTicket: async (data: TicketData) => {
    const response = await axiosInstance.post('/tickets', data);
    return response.data;
  },

  updateStatus: async (id: number, data: UpdateStatusData) => {
    const response = await axiosInstance.put(`/tickets/${id}/status`, data);
    return response.data;
  },

  assignTicket: async (id: number, data: AssignTicketData) => {
    const response = await axiosInstance.put(`/tickets/${id}/assign`, data);
    return response.data;
  },

  rateTicket: async (id: number, data: RateTicketData) => {
    const response = await axiosInstance.post(`/tickets/${id}/rate`, data);
    return response.data;
  },

  addComment: async (id: number, data: CommentData) => {
    const response = await axiosInstance.post(`/tickets/${id}/comments`, data);
    return response.data;
  },

  getComments: async (id: number) => {
    const response = await axiosInstance.get(`/tickets/${id}/comments`);
    return response.data;
  },

  searchTickets: async (query: string) => {
    const response = await axiosInstance.get(`/tickets/search?query=${query}`);
    return response.data;
  },

  filterByStatus: async (status: string) => {
    const response = await axiosInstance.get(`/tickets/filter/status?status=${status}`);
    return response.data;
  },

  filterByPriority: async (priority: string) => {
    const response = await axiosInstance.get(`/tickets/filter/priority?priority=${priority}`);
    return response.data;
  },
};