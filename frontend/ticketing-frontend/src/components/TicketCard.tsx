'use client';

import Link from 'next/link';

interface TicketCardProps {
  ticket: {
    id: number;
    subject: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
    creator: {
      name: string;
    };
    assignee?: {
      name: string;
    };
  };
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export default function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link href={`/tickets/${ticket.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{ticket.subject}</h3>
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded text-xs ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}>
              {ticket.priority}
            </span>
            <span className={`px-2 py-1 rounded text-xs ${statusColors[ticket.status as keyof typeof statusColors]}`}>
              {ticket.status}
            </span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Created by: {ticket.creator.name}</span>
          {ticket.assignee && <span>Assigned to: {ticket.assignee.name}</span>}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}