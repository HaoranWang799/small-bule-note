import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '../store';
import { Avatar } from './Avatar';
import { Check, Search, UserPlus } from 'lucide-react';

export function ContactsScreen() {
  const navigate = useNavigate();
  const contacts = useAppStore((s) => s.contacts);
  const pendingRequests = useAppStore((s) => s.pendingRequests);
  const refreshContacts = useAppStore((s) => s.refreshContacts);
  const acceptContactRequest = useAppStore((s) => s.acceptContactRequest);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    void refreshContacts();
  }, [refreshContacts]);

  const handleAccept = async (userId: string) => {
    setProcessingId(userId);
    try {
      await acceptContactRequest(userId);
      setFeedback({ type: 'success', text: 'Request accepted' });
    } catch {
      setFeedback({ type: 'error', text: 'Failed to accept request' });
    } finally {
      setProcessingId(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filtered = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8] relative">
      <div className="bg-[#FFFFFF] px-4 pt-4 pb-3 shadow-sm z-10">
        <h1 className="text-[18px] font-semibold text-[#1F1F1F] mb-3 leading-none tracking-wide text-left">Contacts</h1>
        <div className="flex items-center bg-[#F8F8F8] rounded-xl px-3 h-10">
          <Search className="w-5 h-5 text-[#8A8A8A] mr-2" />
          <input
            placeholder="Search Contacts"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 bg-transparent text-[16px] text-[#1F1F1F] placeholder-[#8A8A8A] outline-none"
          />
        </div>
      </div>

      {feedback && (
        <p className={`px-4 py-3 text-[13px] font-medium bg-[#FFFFFF] ${feedback.type === 'success' ? 'text-[#07C160]' : 'text-[#FF3B30]'}`}>
          {feedback.text}
        </p>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {pendingRequests.length > 0 && (
          <div className="pb-4">
            <p className="text-[13px] font-medium text-[#8A8A8A] mb-3 uppercase tracking-wider px-1">Friend Requests ({pendingRequests.length})</p>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div key={request.requestId} className="bg-[#FFFFFF] rounded-2xl p-4 flex items-center shadow-sm">
                  <Avatar name={request.requester.username} />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-[16px] font-semibold text-[#1F1F1F] truncate">{request.requester.username}</p>
                    <p className="text-[14px] text-[#8A8A8A] truncate mt-0.5">Wants to connect</p>
                  </div>
                  <button
                    onClick={() => void handleAccept(request.requester.id)}
                    disabled={processingId === request.requester.id}
                    className="h-9 px-4 rounded-full bg-[#07C160] text-white text-[14px] font-medium disabled:opacity-50 flex items-center gap-1 shadow-sm transition-transform active:scale-95 ml-2"
                  >
                    <Check className="w-4 h-4" />
                    {processingId === request.requester.id ? '...' : 'Accept'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-1 py-1">
          <span className="text-[13px] font-medium text-[#8A8A8A] uppercase tracking-wider">All Contacts ({contacts.length})</span>
        </div>

        {filtered.map((contact) => (
          <button
            key={contact.id}
            onClick={() => navigate(`/chat/${contact.id}`)}
            className="flex items-center w-full px-4 py-4 bg-[#FFFFFF] rounded-2xl shadow-sm hover:shadow-md hover:bg-[#FAFAFA] active:bg-[#F0F0F0] transition-all text-left mb-2 group"
          >
            <Avatar name={contact.username} />
            <div className="ml-4 flex-1 min-w-0">
              <span className="text-[16px] font-semibold text-[#1F1F1F] group-hover:text-[#07C160] transition-colors">{contact.username}</span>
            </div>
          </button>
        ))}

        {filtered.length === 0 && contacts.length > 0 && (
          <div className="flex items-center justify-center py-20 text-[14px] text-[#8A8A8A]">
            No contacts found
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/add-friend')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#07C160] rounded-full shadow-[0_4px_14px_rgba(7,193,96,0.4)] flex items-center justify-center text-white active:scale-95 transition-transform z-20 hover:-translate-y-0.5"
      >
        <UserPlus className="w-6 h-6 ml-1" />
      </button>
    </div>
  );
}
