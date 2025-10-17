import { supabase } from './supabase';

export interface Message {
  id: string;
  job_id: string;
  applicant_id: string;
  sender_type: 'employer' | 'applicant';
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export async function sendMessage(
  jobId: string,
  applicantId: string,
  senderType: 'employer' | 'applicant',
  senderId: string,
  content: string
): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      job_id: jobId,
      applicant_id: applicantId,
      sender_type: senderType,
      sender_id: senderId,
      content,
      read: false
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  return data;
}

export async function getMessages(
  jobId: string,
  applicantId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('job_id', jobId)
    .eq('applicant_id', applicantId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

export async function markMessageAsRead(messageId: string): Promise<boolean> {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);

  if (error) {
    console.error('Error marking message as read:', error);
    return false;
  }

  return true;
}

export async function markAllMessagesAsRead(
  jobId: string,
  applicantId: string,
  senderType: 'employer' | 'applicant'
): Promise<boolean> {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('job_id', jobId)
    .eq('applicant_id', applicantId)
    .neq('sender_type', senderType);

  if (error) {
    console.error('Error marking all messages as read:', error);
    return false;
  }

  return true;
}

export async function getUnreadMessageCount(
  applicantId: string,
  receiverType: 'employer' | 'applicant'
): Promise<number> {
  const senderType = receiverType === 'employer' ? 'applicant' : 'employer';

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('applicant_id', applicantId)
    .eq('sender_type', senderType)
    .eq('read', false);

  if (error) {
    console.error('Error fetching unread message count:', error);
    return 0;
  }

  return count || 0;
}
