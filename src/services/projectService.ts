import supabase from "../lib/supabaseClient";

// Type definitions based on the enhanced schema
export type OrderStatus = 'planning' | 'active' | 'review' | 'completed' | 'cancelled' | 'held';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string; // UUID
  user_id: string;
  name: string;
  client: string;
  type: string;
  budget: number | null; // This might be used as 'amount' in UI if cost is not available
  deadline: string | null;
  priority: Priority | null;
  status: OrderStatus | null;
  description: string | null;
  technologies: string[] | null;
  created_at: string;
  updated_at: string;
  // Enhanced fields
  progress?: number;
  deliverables?: string[]; // JSONB array
  payment_status?: 'unpaid' | 'partial' | 'paid' | 'refunded';
  metadata?: Record<string, any>;
}

// Map database status to UI status if they differ slightly, 
// but here we align them or handle mapping in the component.
// The UI uses: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled'
// DB uses: 'planning' | 'active' | 'blocked' | 'ready' (from original) + 'review', 'completed', 'cancelled' (from new schema proposal)

const getUserProjects = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error(error.message);
  }

  return data as Project[];
};

export default {
  getUserProjects,
};
