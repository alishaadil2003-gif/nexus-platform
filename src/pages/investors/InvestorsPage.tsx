import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { CircleDollarSign, TrendingUp, Calendar, MessageCircle } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const InvestorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [investors, setInvestors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchInvestors(); }, []);

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'investor'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setInvestors(list);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = investors.filter(inv =>
    inv.name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.investmentInterests?.some((i: string) => i.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Investors</h1>
        <p className="text-gray-600">Connect with investors looking for great startups</p>
      </div>
      <input type="text" placeholder="Search by name or investment interest..." value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div></div>
      ) : filtered.length === 0 ? (
        <Card><CardBody><div className="text-center py-12"><CircleDollarSign size={40} className="mx-auto text-gray-400 mb-3" /><p className="text-gray-600 font-medium">No investors found</p></div></CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(investor => (
            <Card key={investor.id} className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-bold text-lg">{investor.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{investor.name}</h3>
                    <p className="text-sm text-green-600 font-medium">Investor</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  {investor.investmentInterests && investor.investmentInterests.length > 0 && (
                    <div className="flex items-start gap-2 text-sm text-gray-600"><TrendingUp size={14} className="text-gray-400 mt-0.5" /><span className="line-clamp-1">{investor.investmentInterests.join(', ')}</span></div>
                  )}
                  {investor.minimumInvestment && (
                    <div className="flex items-center gap-2 text-sm text-gray-600"><CircleDollarSign size={14} className="text-gray-400" /><span>{investor.minimumInvestment} – {investor.maximumInvestment}</span></div>
                  )}
                </div>
                {investor.bio && <p className="mt-3 text-sm text-gray-500 line-clamp-2">{investor.bio}</p>}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" leftIcon={<Calendar size={14} />} onClick={() => navigate('/meetings', { state: { participantEmail: investor.email, participantName: investor.name } })} className="flex-1">Schedule Meeting</Button>
                  <Button size="sm" variant="outline" leftIcon={<MessageCircle size={14} />} onClick={() => navigate(`/chat/${investor.id}`)}>Message</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
