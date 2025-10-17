import { Message } from './types';

const STORAGE_KEY = 'rushWorking_messages';

function getAllMessages(): Message[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAllMessages(messages: Message[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function sendMessage(
  jobId: string,
  applicantId: string,
  senderType: 'employer' | 'applicant',
  senderId: string,
  content: string
): Message | null {
  const newMessage: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    job_id: jobId,
    applicant_id: applicantId,
    sender_type: senderType,
    sender_id: senderId,
    content,
    read: false,
    created_at: new Date().toISOString(),
    status: 'delivered',
    edited: false,
    deleted: false
  };

  const allMessages = getAllMessages();
  allMessages.push(newMessage);
  saveAllMessages(allMessages);

  return newMessage;
}

export function getMessages(
  jobId: string,
  applicantId: string
): Message[] {
  const allMessages = getAllMessages();
  return allMessages
    .filter(msg => msg.job_id === jobId && msg.applicant_id === applicantId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function markMessageAsRead(messageId: string): boolean {
  const allMessages = getAllMessages();
  const messageIndex = allMessages.findIndex(msg => msg.id === messageId);

  if (messageIndex !== -1) {
    allMessages[messageIndex].read = true;
    saveAllMessages(allMessages);
    return true;
  }

  return false;
}

export function markAllMessagesAsRead(
  jobId: string,
  applicantId: string,
  senderType: 'employer' | 'applicant'
): boolean {
  const allMessages = getAllMessages();
  const otherSenderType = senderType === 'employer' ? 'applicant' : 'employer';

  let updated = false;
  const updatedMessages = allMessages.map(msg => {
    if (msg.job_id === jobId && msg.applicant_id === applicantId && msg.sender_type === otherSenderType && !msg.read) {
      updated = true;
      return { ...msg, read: true };
    }
    return msg;
  });

  if (updated) {
    saveAllMessages(updatedMessages);
  }

  return true;
}

export function getUnreadMessageCount(
  applicantId: string,
  receiverType: 'employer' | 'applicant'
): number {
  const senderType = receiverType === 'employer' ? 'applicant' : 'employer';
  const allMessages = getAllMessages();

  return allMessages.filter(
    msg => msg.applicant_id === applicantId && msg.sender_type === senderType && !msg.read
  ).length;
}

export function updateMessage(
  messageId: string,
  newContent: string
): boolean {
  const allMessages = getAllMessages();
  const messageIndex = allMessages.findIndex(msg => msg.id === messageId);

  if (messageIndex !== -1) {
    const message = allMessages[messageIndex];
    allMessages[messageIndex] = {
      ...message,
      original_content: message.original_content || message.content,
      content: newContent,
      edited: true,
      edited_at: new Date().toISOString()
    };
    saveAllMessages(allMessages);
    return true;
  }

  return false;
}

export function deleteMessage(
  messageId: string,
  deletedBy: string
): boolean {
  const allMessages = getAllMessages();
  const messageIndex = allMessages.findIndex(msg => msg.id === messageId);

  if (messageIndex !== -1) {
    allMessages[messageIndex] = {
      ...allMessages[messageIndex],
      deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: deletedBy
    };
    saveAllMessages(allMessages);
    return true;
  }

  return false;
}

export function updateMessageStatus(
  messageId: string,
  status: 'sending' | 'delivered' | 'viewed'
): boolean {
  const allMessages = getAllMessages();
  const messageIndex = allMessages.findIndex(msg => msg.id === messageId);

  if (messageIndex !== -1) {
    allMessages[messageIndex].status = status;
    saveAllMessages(allMessages);
    return true;
  }

  return false;
}

export function markMessagesAsViewed(
  jobId: string,
  applicantId: string,
  viewerType: 'employer' | 'applicant'
): boolean {
  const allMessages = getAllMessages();
  const otherSenderType = viewerType === 'employer' ? 'applicant' : 'employer';

  let updated = false;
  const updatedMessages = allMessages.map(msg => {
    if (
      msg.job_id === jobId &&
      msg.applicant_id === applicantId &&
      msg.sender_type === otherSenderType &&
      msg.status !== 'viewed'
    ) {
      updated = true;
      return { ...msg, status: 'viewed' as const, read: true };
    }
    return msg;
  });

  if (updated) {
    saveAllMessages(updatedMessages);
  }

  return true;
}
