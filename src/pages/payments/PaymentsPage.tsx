import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Transaction } from '../../types';
import { DollarSign, ArrowDownCircle, ArrowUpCircle, ArrowRightCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'deposit', amount: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user) fetchTransactions(); }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', user.id));
      const snap = await getDocs(q);
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(txs);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.id,
        type: form.type,
        amount: parseFloat(form.amount),
        currency: 'USD',
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
      setForm({ type: 'deposit', amount: '' });
      setShowForm(false);
      fetchTransactions();
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const balance = totalDeposits - totalWithdrawals;

  const getIcon = (type: string) => {
    if (type === 'deposit') return <ArrowDownCircle size={18} className="text-green-600" />;
    if (type === 'withdraw') return <ArrowUpCircle size={18} className="text-red-600" />;
    return <ArrowRightCircle size={18} className="text-blue-600" />;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle size={16} className="text-green-600" />;
    if (status === 'failed') return <XCircle size={16} className="text-red-600" />;
    return <Clock size={16} className="text-yellow-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Manage your transactions</p>
        </div>
        <Button leftIcon={<DollarSign size={18} />} onClick={() => setShowForm(!showForm)}>New Transaction</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border border-green-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4"><ArrowDownCircle size={20} className="text-green-700" /></div>
              <div><p className="text-sm font-medium text-green-700">Total Deposits</p><h3 className="text-xl font-bold text-green-900">${totalDeposits.toFixed(2)}</h3></div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-red-50 border border-red-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full mr-4"><ArrowUpCircle size={20} className="text-red-700" /></div>
              <div><p className="text-sm font-medium text-red-700">Total Withdrawals</p><h3 className="text-xl font-bold text-red-900">${totalWithdrawals.toFixed(2)}</h3></div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4"><DollarSign size={20} className="text-primary-700" /></div>
              <div><p className="text-sm font-medium text-primary-700">Balance</p><h3 className="text-xl font-bold text-primary-900">${balance.toFixed(2)}</h3></div>
            </div>
          </CardBody>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader><h2 className="text-lg font-medium text-gray-900">New Transaction</h2></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="deposit">Deposit</option>
                  <option value="withdraw">Withdraw</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                <input type="number" min="1" step="0.01" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" isLoading={submitting}>Submit</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader><h2 className="text-lg font-medium text-gray-900">Transaction History</h2></CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div></div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8"><DollarSign size={36} className="mx-auto text-gray-400 mb-2" /><p className="text-gray-500">No transactions yet</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {getIcon(tx.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{tx.type}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">{getStatusIcon(tx.status)}<span className="text-xs text-gray-500 capitalize">{tx.status}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
