import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Users, DollarSign, Calendar, MessageCircle } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const EntrepreneursPage: React.FC = () => {
  const navigate = useNavigate();
  const [entrepreneurs, setEntrepreneurs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchEntrepreneurs(); }, []);

  const fetchEntrepreneurs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'entrepreneur'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setEntrepreneurs(list);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = entrepreneurs.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.startupName?.toLowerCase().includes(search.toLowerCase()) ||
    e.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Entrepreneurs</h1>
        <p className="text-gray-600">Discover startups looking for investment</p>
      </div>
      <input type="text" placeholder="Search by name, startup, or industry..." value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div></div>
      ) : filtered.length === 0 ? (
        <Card><CardBody><div className="text-center py-12"><Building2 size={40} className="mx-auto text-gray-400 mb-3" /><p className="text-gray-600 font-medium">No entrepreneurs found</p></div></CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(entrepreneur => (
            <Card key={entrepreneur.id} className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold text-lg">{entrepreneur.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{entrepreneur.name}</h3>
                    {entrepreneur.startupName && <p className="text-sm text-primary-600 font-medium truncate">{entrepreneur.startupName}</p>}
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  {entrepreneur.industry && <div className="flex items-center gap-2 text-sm text-gray-600"><Building2 size={14} className="text-gray-400" /><span>{entrepreneur.industry}</span></div>}
                  {entrepreneur.location && <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin size={14} className="text-gray-400" /><span>{entrepreneur.location}</span></div>}
                  {entrepreneur.teamSize && <div className="flex items-center gap-2 text-sm text-gray-600"><Users size={14} className="text-gray-400" /><span>Team of {entrepreneur.teamSize}</span></div>}
                  {entrepreneur.fundingNeeded && <div className="flex items-center gap-2 text-sm text-gray-600"><DollarSign size={14} className="text-gray-400" /><span>Seeking {entrepreneur.fundingNeeded}</span></div>}
                </div>
                {entrepreneur.pitchSummary && <p className="mt-3 text-sm text-gray-500 line-clamp-2">{entrepreneur.pitchSummary}</p>}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" leftIcon={<Calendar size={14} />} onClick={() => navigate('/meetings', { state: { participantEmail: entrepreneur.email, participantName: entrepreneur.name } })} className="flex-1">Schedule Meeting</Button>
                  <Button size="sm" variant="outline" leftIcon={<MessageCircle size={14} />} onClick={() => navigate(`/chat/${entrepreneur.id}`)}>Message</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
