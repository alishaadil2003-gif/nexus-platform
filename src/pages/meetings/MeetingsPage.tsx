import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Meeting } from '../../types';
import { Calendar, Clock, Plus, Video, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { useNavigate, useLocation } from 'react-router-dom';

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', participantEmail: '', date: '', startTime: '', endTime: '', notes: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Auto-fill from profile page navigation
    if (location.state?.participantEmail) {
      setForm(f => ({ ...f, participantEmail: location.state.participantEmail }));
      setShowForm(true);
    }
    if (user) fetchMeetings();
  }, [user]);

  const fetchMeetings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q1 = query(collection(db, 'meetings'), where('organizerId', '==', user.id));
      const q2 = query(collection(db, 'meetings'), where('participantId', '==', user.id));
      const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const all = [...s1.docs, ...s2.docs].map(d => ({ id: d.id, ...d.data() } as Meeting));
      const unique = Array.from(new Map(all.map(m => [m.id, m])).values());
      unique.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      setMeetings(unique);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!user) return;
    setSubmitting(true);
    try {
      const startTime = new Date(`${form.date}T${form.startTime}`);
      const endTime = new Date(`${form.date}T${form.endTime}`);
      if (endTime <= startTime) { setFormError('End time must be after start time'); setSubmitting(false); return; }

      const usersSnap = await getDocs(query(collection(db, 'users'), where('email', '==', form.participantEmail)));
      if (usersSnap.empty) { setFormError('No user found with that email address'); setSubmitting(false); return; }
      const participantId = usersSnap.docs[0].id;
      if (participantId === user.id) { setFormError('You cannot schedule a meeting with yourself'); setSubmitting(false); return; }

      await addDoc(collection(db, 'meetings'), {
        title: form.title,
        organizerId: user.id,
        participantId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: form.notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      setForm({ title: '', participantEmail: '', date: '', startTime: '', endTime: '', notes: '' });
      setShowForm(false);
      fetchMeetings();
    } catch (e) { setFormError('Failed to schedule. Please try again.'); }
    setSubmitting(false);
  };

  const respondToMeeting = async (meetingId: string, status: 'accepted' | 'rejected') => {
    await updateDoc(doc(db, 'meetings', meetingId), { status });
    fetchMeetings();
  };

  const getStatusColor = (status: string) => {
    if (status === 'accepted') return 'bg-green-100 text-green-800';
    if (status === 'rejected') return 'bg-red-100 text-red-800';
    if (status === 'cancelled') return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Schedule and manage your meetings</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setShowForm(!showForm)}>Schedule Meeting</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><h2 className="text-lg font-medium text-gray-900">New Meeting</h2></CardHeader>
          <CardBody>
            {formError && (
              <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
                <AlertCircle size={16} />{formError}
              </div>
            )}
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                <input className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Investment Discussion" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participant Email</label>
                <input type="email" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={form.participantEmail} onChange={e => setForm({ ...form, participantEmail: e.target.value })} required placeholder="other@email.com" />
                {location.state?.participantName && (
                  <p className="text-xs text-green-600 mt-1">✓ Scheduling with {location.state.participantName}</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3}
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Agenda or notes..." />
              </div>
              <div className="flex gap-3">
                <Button type="submit" isLoading={submitting}>Schedule</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div></div>
      ) : meetings.length === 0 ? (
        <Card><CardBody>
          <div className="text-center py-12">
            <Calendar size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No meetings yet</p>
            <p className="text-sm text-gray-500 mt-1">Schedule your first meeting above or from a user's profile</p>
          </div>
        </CardBody></Card>
      ) : (
        <div className="space-y-4">
          {meetings.map(meeting => (
            <Card key={meeting.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Calendar size={14} />{new Date(meeting.startTime).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={14} />{new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {meeting.notes && <p className="text-sm text-gray-500 mt-2">{meeting.notes}</p>}
                    <p className="text-xs text-gray-400 mt-1">{meeting.organizerId === user?.id ? '📤 Organized by you' : '📥 Invited by someone'}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-wrap justify-end">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(meeting.status)}`}>{meeting.status}</span>
                    {meeting.status === 'accepted' && (
                      <Button size="sm" leftIcon={<Video size={14} />} onClick={() => navigate(`/call/${meeting.id}`)}>Join Call</Button>
                    )}
                    {meeting.participantId === user?.id && meeting.status === 'pending' && (
                      <>
                        <button onClick={() => respondToMeeting(meeting.id, 'accepted')} className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200" title="Accept"><Check size={16} /></button>
                        <button onClick={() => respondToMeeting(meeting.id, 'rejected')} className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200" title="Reject"><X size={16} /></button>
                      </>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
