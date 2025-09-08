import { supabase } from '../lib/supabase';

export interface PointsTransaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  category: string;
  relatedJobId?: string;
  createdAt: string;
}

export const pointsService = {
  async getPointsHistory(userId: string): Promise<PointsTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading points history:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        type: item.type as 'earned' | 'spent',
        amount: item.amount,
        description: item.description,
        category: item.category,
        relatedJobId: item.related_job_id,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error('Error loading points history:', error);
      return [];
    }
  },

  async addPointsTransaction(
    userId: string,
    type: 'earned' | 'spent',
    amount: number,
    description: string,
    category: string,
    relatedJobId?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('points_history')
        .insert({
          user_id: userId,
          type,
          amount,
          description,
          category,
          related_job_id: relatedJobId,
        });

      if (error) {
        console.error('Error adding points transaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding points transaction:', error);
      return false;
    }
  },

  async updateUserPoints(userId: string, newPoints: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user points:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating user points:', error);
      return false;
    }
  },

  async purchasePoints(userId: string, pointsAmount: number, cost: number): Promise<boolean> {
    try {
      // Get current points
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current points:', fetchError);
        return false;
      }

      const newPoints = profile.points + pointsAmount;

      // Update points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating points:', updateError);
        return false;
      }

      // Add transaction record
      await this.addPointsTransaction(
        userId,
        'earned',
        pointsAmount,
        `Purchased ${pointsAmount} points for $${cost}`,
        'purchase'
      );

      return true;
    } catch (error) {
      console.error('Error purchasing points:', error);
      return false;
    }
  },
};