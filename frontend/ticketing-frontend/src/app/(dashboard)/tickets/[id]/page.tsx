'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ticketService } from '@/services/ticketService';
import { fileService } from '@/services/fileService';
import { adminService } from '@/services/adminService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchTicket = async () => {
    try {
      const data = await ticketService.getTicketById(Number(params.id));
      setTicket(data);
      setSelectedStatus(data.status);
    } catch (error) {
      toast.error('Failed to fetch ticket');
      router.push('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await ticketService.getComments(Number(params.id));
      setComments(data);
    } catch (error) {
      toast.error('Failed to fetch comments');
    }
  };

  const fetchAgents = async () => {
    if (user?.role === 'ADMIN' || user?.role === 'SUPPORT_AGENT') {
      try {
        const data = await adminService.getUsersByRole('SUPPORT_AGENT');
        setAgents(data);
      } catch (error) {
        console.error('Failed to fetch agents');
      }
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchComments();
    fetchAgents();
  }, [params.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await ticketService.addComment(Number(params.id), { content: newComment });
      setNewComment('');
      fetchComments();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await ticketService.updateStatus(Number(params.id), { status: selectedStatus as any });
      fetchTicket();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAssign = async () => {
    if (!selectedAgent) return;

    try {
      await ticketService.assignTicket(Number(params.id), { assigneeId: Number(selectedAgent) });
      fetchTicket();
      toast.success('Ticket assigned');
    } catch (error) {
      toast.error('Failed to assign ticket');
    }
  };

  const handleRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await ticketService.rateTicket(Number(params.id), { rating, feedback });
      fetchTicket();
      toast.success('Rating submitted');
      setRating(0);
      setFeedback('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit rating');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await fileService.uploadFile(Number(params.id), file);
      setFile(null);
      fetchTicket();
      toast.success('File uploaded');
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const handleFileDownload = async (attachmentId: number, fileName: string) => {
    try {
      const blob = await fileService.downloadFile(attachmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!ticket) {
    return <div className="text-center py-12">Ticket not found</div>;
  }

  const canUpdateStatus = user?.role === 'ADMIN' || user?.role === 'SUPPORT_AGENT' || ticket.creator.id === user?.id;
  const canAssign = user?.role === 'ADMIN' || user?.role === 'SUPPORT_AGENT';
  const canRate = ticket.creator.id === user?.id && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED');

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/tickets')}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Back to Tickets
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{ticket.subject}</h1>
            <p className="text-gray-600">Ticket #{ticket.id}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded text-sm ${
              ticket.priority === 'LOW' ? 'bg-green-100 text-green-800' :
              ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {ticket.priority}
            </span>
            <span className={`px-3 py-1 rounded text-sm ${
              ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
              ticket.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
              ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {ticket.status}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created by</p>
              <p className="font-medium">{ticket.creator.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned to</p>
              <p className="font-medium">{ticket.assignee?.name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created at</p>
              <p className="font-medium">{new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last updated</p>
              <p className="font-medium">{new Date(ticket.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {ticket.rating && (
          <div className="border-t pt-4 mt-4">
            <h2 className="font-semibold mb-2">Rating</h2>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">{'★'.repeat(ticket.rating)}{'☆'.repeat(5 - ticket.rating)}</span>
              <span className="text-gray-600">({ticket.rating}/5)</span>
            </div>
            {ticket.feedback && (
              <p className="text-gray-700 mt-2">{ticket.feedback}</p>
            )}
          </div>
        )}

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <h2 className="font-semibold mb-2">Attachments</h2>
            <div className="space-y-2">
              {ticket.attachments.map((attachment: any) => (
                <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{attachment.fileName}</p>
                    <p className="text-sm text-gray-600">
                      {(attachment.fileSize / 1024).toFixed(2)} KB • 
                      Uploaded by {attachment.uploadedBy.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleFileDownload(attachment.id, attachment.fileName)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {canUpdateStatus && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Update Status</h2>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {canAssign && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Assign Ticket</h2>
          <div className="flex gap-2">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
            >
              <option value="">Select Agent</option>
              {agents.map((agent: any) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.email})
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Assign
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Upload Attachment</h2>
        <form onSubmit={handleFileUpload} className="flex gap-2">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={!file}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Upload
          </button>
        </form>
      </div>

      {canRate && !ticket.rating && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Rate This Ticket</h2>
          <form onSubmit={handleRating}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Feedback (Optional)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit Rating
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full border rounded px-3 py-2 mb-2"
            rows={3}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Comment
          </button>
        </form>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet</p>
          ) : (
            comments.map((comment: any) => (
              <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">{comment.user.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}