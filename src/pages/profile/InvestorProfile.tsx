import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { CircleDollarSign, TrendingUp, Edit2, Save, X } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const InvestorProfile: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  const isOwner = user?.id === id;

  useEffect(() => { if (id) fetchProfile(id); }, [id]);

  const fetchProfile = async (uid: string) => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as User;
        setProfile(data);
        setForm(data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', id), form as Record<string, unknown>);
      setProfile({ ...profile, ...form } as User);
      setEditing(false);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div></div>;
  if (!profile) return <div className="text-center py-12 text-gray-500">Profile not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{isOwner ? 'My Profile' : profile.name}</h1>
        {isOwner && !editing && <Button leftIcon={<Edit2 size={16} />} onClick={() => setEditing(true)}>Edit Profile</Button>}
        {isOwner && editing && (
          <div className="flex gap-2">
            <Button leftIcon={<Save size={16} />} isLoading={saving} onClick={handleSave}>Save</Button>
            <Button variant="outline" leftIcon={<X size={16} />} onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        )}
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700 font-bold text-3xl">{profile.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              {editing ? (
                <input className="border border-gray-300 rounded px-2 py-1 text-lg font-bold w-full" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              ) : <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>}
              <p className="text-gray-500 text-sm">{profile.email}</p>
              <span className="mt-1 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Investor</span>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {editing ? (
              <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm" rows={3} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell entrepreneurs about yourself..." />
            ) : <p className="text-gray-600 text-sm">{profile.bio || 'No bio added yet'}</p>}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h3 className="font-medium text-gray-900">Investment Details</h3></CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"><CircleDollarSign size={16} />Minimum Investment</label>
              {editing ? <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={form.minimumInvestment || ''} onChange={e => setForm({ ...form, minimumInvestment: e.target.value })} placeholder="e.g. $50,000" />
              : <p className="text-gray-600 text-sm">{profile.minimumInvestment || 'Not specified'}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"><CircleDollarSign size={16} />Maximum Investment</label>
              {editing ? <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={form.maximumInvestment || ''} onChange={e => setForm({ ...form, maximumInvestment: e.target.value })} placeholder="e.g. $500,000" />
              : <p className="text-gray-600 text-sm">{profile.maximumInvestment || 'Not specified'}</p>}
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"><TrendingUp size={16} />Investment Interests</label>
            {editing ? (
              <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                value={form.investmentInterests?.join(', ') || ''}
                onChange={e => setForm({ ...form, investmentInterests: e.target.value.split(',').map((s: string) => s.trim()) })}
                placeholder="e.g. FinTech, HealthTech, AI" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.investmentInterests?.length ? profile.investmentInterests.map((interest: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{interest}</span>
                )) : <p className="text-gray-500 text-sm">None specified</p>}
              </div>
            )}
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"><TrendingUp size={16} />Investment Stage</label>
            {editing ? (
              <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                value={form.investmentStage?.join(', ') || ''}
                onChange={e => setForm({ ...form, investmentStage: e.target.value.split(',').map((s: string) => s.trim()) })}
                placeholder="e.g. Seed, Series A, Series B" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.investmentStage?.length ? profile.investmentStage.map((stage: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{stage}</span>
                )) : <p className="text-gray-500 text-sm">None specified</p>}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
