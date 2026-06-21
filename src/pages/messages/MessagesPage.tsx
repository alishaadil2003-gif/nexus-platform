import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';

export const MessagesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Your conversations</p>
      </div>
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <MessageCircle size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No messages yet</p>
            <p className="text-sm text-gray-500 mt-1">Start a conversation from a user's profile</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
