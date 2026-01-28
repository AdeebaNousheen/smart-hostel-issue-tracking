import { useState, useEffect } from 'react';
import { LogOut, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { HostelIssue, IssueStats } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

type FilterStatus = 'all' | 'pending' | 'resolved';

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [issues, setIssues] = useState<HostelIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<HostelIssue[]>([]);
  const [stats, setStats] = useState<IssueStats>({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchIssues();

    const subscription = supabase
      .channel('admin_issues_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hostel_issues',
        },
        () => {
          fetchIssues();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    applyFilter();
  }, [issues, filter]);

  const fetchIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hostel_issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching issues:', error);
    } else {
      setIssues(data || []);
      calculateStats(data || []);
    }
    setLoading(false);
  };

  const calculateStats = (issuesData: HostelIssue[]) => {
    const total = issuesData.length;
    const pending = issuesData.filter((issue) => issue.status === 'pending').length;
    const resolved = issuesData.filter((issue) => issue.status === 'resolved').length;
    setStats({ total, pending, resolved });
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredIssues(issues);
    } else {
      setFilteredIssues(issues.filter((issue) => issue.status === filter));
    }
  };

  const handleResolve = async (issueId: string) => {
    setResolvingIds((prev) => new Set(prev).add(issueId));

    const { error } = await supabase
      .from('hostel_issues')
      .update({ status: 'resolved', updated_at: new Date().toISOString() })
      .eq('id', issueId);

    if (error) {
      console.error('Error resolving issue:', error);
      alert('Failed to resolve issue. Please try again.');
    }

    setResolvingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(issueId);
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-sm text-gray-600">Manage and resolve hostel issues</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Issues</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Issues</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Resolved Issues</p>
                <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">All Issues</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterStatus)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="all">All Issues</option>
                <option value="pending">Pending Only</option>
                <option value="resolved">Resolved Only</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading issues...</div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {filter === 'all' ? 'No issues found' : `No ${filter} issues found`}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {issue.student_name}
                        </h3>
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            issue.status === 'resolved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {issue.status === 'resolved' ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Resolved
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Pending
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{issue.description}</p>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(issue.created_at).toLocaleString()}
                      </p>
                    </div>
                    {issue.status === 'pending' && (
                      <button
                        onClick={() => handleResolve(issue.id)}
                        disabled={resolvingIds.has(issue.id)}
                        className="ml-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {resolvingIds.has(issue.id) ? 'Resolving...' : 'Mark Resolved'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
