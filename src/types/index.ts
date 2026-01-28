export interface HostelIssue {
  id: string;
  student_name: string;
  description: string;
  status: 'pending' | 'resolved';
  created_at: string;
  updated_at: string;
}

export type UserRole = 'student' | 'admin' | null;

export interface IssueStats {
  total: number;
  pending: number;
  resolved: number;
}
