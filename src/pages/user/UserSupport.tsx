import React, { useState } from 'react';
import { Plus, MessageSquare } from 'lucide-react';

interface SupportTicket {
  id: number;
  subject: string;
  status: 'open' | 'resolved';
  created: string;
  replies: number;
}

const UserSupport: React.FC = () => {
  const [newTicket, setNewTicket] = useState({ subject: '', description: '' });

  const supportTickets: SupportTicket[] = [
    { id: 1, subject: 'Question about API endpoints', status: 'open', created: '2025-12-03', replies: 2 },
    { id: 2, subject: 'Request revision for homepage design', status: 'resolved', created: '2025-11-28', replies: 5 },
    { id: 3, subject: 'Payment confirmation needed', status: 'open', created: '2025-12-01', replies: 1 }
  ];

  const handleSubmit = (): void => {
    console.log('Submitting ticket:', newTicket);
    // Add your submit logic here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Support Center</h1>
          <p className="text-gray-400 mt-1">Get help with your projects</p>
        </div>
        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
          <Plus size={20} />
          New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {supportTickets.map(ticket => (
          <div key={ticket.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-indigo-500/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{ticket.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    ticket.status === 'open' 
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                      : 'bg-green-500/20 text-green-400 border-green-500/30'
                  }`}>
                    {ticket.status === 'open' ? 'Open' : 'Resolved'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Ticket #{ticket.id.toString().padStart(6, '0')}</p>
              </div>
              <button className="text-indigo-400 hover:text-indigo-300 font-medium text-sm">
                View Conversation →
              </button>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Created: {ticket.created}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MessageSquare size={14} />
                {ticket.replies} replies
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-white mb-4">Create New Support Ticket</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
            <input
              type="text"
              placeholder="Brief description of your issue"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              rows={5}
              placeholder="Provide details about your request or issue..."
              value={newTicket.description}
              onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>
          <button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            Submit Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSupport;