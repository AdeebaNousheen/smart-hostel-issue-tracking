import { useState, useEffect } from 'react';
import { LogOut, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { HostelIssue } from '../types';

interface StudentDashboardProps {
  onLogout: () => void;
}

export default function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [studentName, setStudentName] = useState('');
  const [description, setDescription] = useState('');
  const [issues, setIssues] = useState<HostelIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchIssues();

    const subscription = supabase
      .channel('hostel_issues_changes')
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
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('hostel_issues').insert([
      {
        student_name: studentName,
        description: description,
        status: 'pending',
      },
    ]);

    if (error) {
      console.error('Error submitting issue:', error);
      alert('Failed to submit issue. Please try again.');
    } else {
      setStudentName('');
      setDescription('');
      alert('Issue submitted successfully!');
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
            <p className="text-sm text-gray-600">Submit and track hostel issues</p>
          <div className="flex gap-2">
  <button
    onClick={onLogout}
    className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
  >
    ← Home
  </button>

  <button
    onClick={onLogout}
    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
  >
    <LogOut className="w-5 h-5" />
    Logout
  </button>
</div>

      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              Submit New Issue
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  id="studentName"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the hostel issue in detail..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Submit Issue'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Issues</h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading issues...</div>
            ) : issues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No issues submitted yet</div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {issues.slice(0, 10).map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{issue.student_name}</h3>
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          issue.status === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {issue.status === 'resolved' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
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
                    <p className="text-gray-700 text-sm mb-2">{issue.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(issue.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
