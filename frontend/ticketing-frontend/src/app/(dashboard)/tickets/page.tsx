'use client';

import { useState, useEffect } from 'react';
import { ticketService } from '@/services/ticketService';
import TicketCard from '@/components/TicketCard';
import CreateTicketModal from '@/components/CreateTicketModal';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllTickets();
      setTickets(data);
    } catch (error: any) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const data = await ticketService.searchTickets(searchQuery);
        setTickets(data);
      } catch (error) {
        toast.error('Search failed');
      }
    } else {
      fetchTickets();
    }
  };

  const handleStatusFilter = async (status: string) => {
    setStatusFilter(status);
    if (status) {
      try {
        const data = await ticketService.filterByStatus(status);
        setTickets(data);
      } catch (error) {
        toast.error('Filter failed');
      }
    } else {
      fetchTickets();
    }
  };

  const handlePriorityFilter = async (priority: string) => {
    setPriorityFilter(priority);
    if (priority) {
      try {
        const data = await ticketService.filterByPriority(priority);
        setTickets(data);
      } catch (error) {
        toast.error('Filter failed');
      }
    } else {
      fetchTickets();
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Ticket
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full border rounded px-3 py-2 text-gray-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => handlePriorityFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No tickets found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket: any) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTickets}
      />
    </div>
  );
}