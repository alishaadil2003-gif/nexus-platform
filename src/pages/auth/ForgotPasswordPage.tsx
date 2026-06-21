import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch { setError('Could not send reset email. Check the address and try again.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {sent ? (
            <div className="text-center">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <p className="text-gray-700 font-medium">Reset email sent!</p>
              <p className="text-sm text-gray-500 mt-2">Check your inbox and follow the link to reset your password.</p>
              <Link to="/login" className="mt-4 inline-block text-sm text-primary-600 font-medium hover:text-primary-500">Back to login</Link>
            </div>
          ) : (
            <>
              {error && <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-md flex items-center"><AlertCircle size={16} className="mr-2" />{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth startAdornment={<Mail size={18} />} />
                <Button type="submit" fullWidth isLoading={loading}>Send Reset Email</Button>
              </form>
              <div className="mt-4 text-center"><Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">Back to login</Link></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
