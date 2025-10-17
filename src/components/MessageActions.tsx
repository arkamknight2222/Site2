import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Copy, Edit2, Trash2 } from 'lucide-react';

interface MessageActionsProps {
  messageId: string;
  content: string;
  isOwnMessage: boolean;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MessageActions({
  messageId,
  content,
  isOwnMessage,
  onCopy,
  onEdit,
  onDelete
}: MessageActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleCopy = () => {
    onCopy();
    setShowMenu(false);
  };

  const handleEdit = () => {
    onEdit();
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete();
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10"
        aria-label="Message actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
          <button
            onClick={handleCopy}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </button>

          {isOwnMessage && (
            <>
              <button
                onClick={handleEdit}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
