import React, { useState } from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { Message } from '../lib/types';
import MessageActions from './MessageActions';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  senderName: string;
  onCopy: (content: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  isLastMessage?: boolean;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  senderName,
  onCopy,
  onEdit,
  onDelete,
  isLastMessage = false
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleSaveEdit = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      onEdit(message.id, editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onCopy(message.content);
  };

  const handleEdit = () => {
    setEditedContent(message.content);
    setIsEditing(true);
  };

  const handleDelete = () => {
    onDelete(message.id);
  };

  const getStatusIcon = () => {
    if (!isOwnMessage || message.deleted) return null;

    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 opacity-70" />;
      case 'delivered':
        return <Check className="h-3 w-3 opacity-70" />;
      case 'viewed':
        return <CheckCheck className="h-3 w-3 opacity-70" />;
      default:
        return null;
    }
  };

  if (message.deleted) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[70%] rounded-lg p-4 ${
            isOwnMessage
              ? 'bg-gray-300 text-gray-600'
              : 'bg-gray-200 border border-gray-300 text-gray-600'
          }`}
        >
          <p className="text-sm italic">
            This message was deleted
            {message.deleted_at && (
              <span className="block text-xs mt-1">
                {new Date(message.deleted_at).toLocaleString()}
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`group max-w-[70%] rounded-lg p-4 ${
          isOwnMessage
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium">{senderName}</p>
          {!isEditing && (
            <MessageActions
              messageId={message.id}
              content={message.content}
              isOwnMessage={isOwnMessage}
              onCopy={handleCopy}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLastMessage={isLastMessage}
            />
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={`w-full min-h-[80px] px-3 py-2 rounded border ${
                isOwnMessage
                  ? 'bg-blue-500 text-white border-blue-400 placeholder-blue-200'
                  : 'bg-white text-gray-900 border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              autoFocus
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  isOwnMessage
                    ? 'bg-blue-500 hover:bg-blue-400 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editedContent.trim() || editedContent === message.content}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  isOwnMessage
                    ? 'bg-white text-blue-600 hover:bg-gray-100 disabled:bg-blue-400 disabled:text-blue-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500'
                } disabled:cursor-not-allowed`}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            {message.edited && (
              <p
                className={`text-xs mt-1 italic ${
                  isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                Edited
                {message.edited_at && ` • ${new Date(message.edited_at).toLocaleString()}`}
              </p>
            )}
            <div
              className={`flex items-center gap-1 mt-2 text-xs ${
                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              <span>{new Date(message.created_at).toLocaleString()}</span>
              {getStatusIcon()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
