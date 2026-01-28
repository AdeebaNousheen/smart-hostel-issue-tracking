import { UserCircle2, Shield } from 'lucide-react';
import { UserRole } from '../types';

interface LandingProps {
  onSelectRole: (role: UserRole) => void;
}

export default function Landing({ onSelectRole }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Smart Hostel Issue Tracker
          </h1>
          <p className="text-xl text-gray-600">
            Streamline hostel issue management with real-time tracking
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <button
            onClick={() => onSelectRole('student')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-6 bg-blue-100 rounded-full group-hover:bg-blue-500 transition-colors duration-300">
                <UserCircle2 className="w-16 h-16 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Student Portal</h2>
              <p className="text-gray-600">
                Submit and track your hostel issues quickly and easily
              </p>
              <div className="pt-4">
                <span className="inline-block px-6 py-2 bg-blue-500 text-white rounded-full group-hover:bg-blue-600 transition-colors duration-300">
                  Continue as Student
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectRole('admin')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-6 bg-green-100 rounded-full group-hover:bg-green-500 transition-colors duration-300">
                <Shield className="w-16 h-16 text-green-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
              <p className="text-gray-600">
                Manage and resolve hostel issues efficiently
              </p>
              <div className="pt-4">
                <span className="inline-block px-6 py-2 bg-green-500 text-white rounded-full group-hover:bg-green-600 transition-colors duration-300">
                  Continue as Admin
                </span>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Built with React + TypeScript + Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
