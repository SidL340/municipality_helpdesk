import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Building, User, Phone, Mail, Check, X, Copy, Trash2, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

const DEFAULT_REQUESTS = [
  {
    id: 1,
    municipality_name: 'वृन्दावन नगरपालिका',
    ward_number: 1,
    applicant_name: 'गौतम (वडा सचिव)',
    applicant_phone: '९८५५०१२३४५',
    applicant_email: 'brindaban01@gmail.com',
    applicant_role: 'वडा सचिव',
    status: 'approved',
    created_at: new Date().toISOString(),
  }
];

export default function WardRequests() {
  const [requests, setRequests] = useState(DEFAULT_REQUESTS);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [initialPassword, setInitialPassword] = useState('ward1234');
  const [approvedDetails, setApprovedDetails] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/ward-registrations');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setRequests(res.data);
      }
    } catch (err) {
      console.warn('Fetch requests fallback:', err);
    }
  };

  const openApproveModal = (req) => {
    setApproving(req);
    setGeneratedUsername(`ward${req.ward_number}_admin`);
    setInitialPassword('ward1234');
  };

  const handleApprove = async () => {
    try {
      const res = await api.post(`/admin/ward-registrations/${approving.id}/approve`, {
        generated_username: generatedUsername,
        initial_password: initialPassword,
      });

      toast.success('वडा दर्ता स्वीकृत भयो (Ward Registration Approved!)');
      setApprovedDetails({
        ward_number: approving.ward_number,
        municipality: approving.municipality_name,
        secretary: approving.applicant_name,
        phone: approving.applicant_phone,
        username: res.data.credentials?.username || generatedUsername,
        password: res.data.credentials?.initialPassword || initialPassword,
      });
      setApproving(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Approval failed');
    }
  };

  const handleDeleteRequest = async (r, deleteWardAccount = true) => {
    try {
      await api.delete(`/admin/ward-registrations/${r.id}?deleteWard=${deleteWardAccount}`);
      toast.success('अनुरोध सफलतापूर्वक मेटाइयो (Request deleted)');
      setDeleting(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400 font-bold animate-pulse">अनुरोधहरू लोड हुँदैछ...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          नयाँ वडा दर्ता अनुरोधहरू (Ward Onboarding Requests)
        </h1>
        <p className="text-gray-500 text-xs">
          Review incoming registration requests from new Ward Offices, approve credentials, or delete requests
        </p>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {requests.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-sm">
                    {r.ward_number}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      {r.municipality_name} — वडा नं. {r.ward_number}
                    </h3>
                    <p className="text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    r.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : r.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <div className="space-y-2 bg-gray-50 rounded-2xl p-4 text-xs text-gray-700">
                <p className="flex items-center gap-2">
                  <User size={14} className="text-purple-700" />
                  <span><strong>निवेदक:</strong> {r.applicant_name} ({r.applicant_role || 'सचिव'})</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-purple-700" />
                  <span><strong>सम्पर्क:</strong> {r.applicant_phone}</span>
                </p>
                {r.applicant_email && (
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-purple-700" />
                    <span><strong>ईमेल:</strong> {r.applicant_email}</span>
                  </p>
                )}
                {r.notes && (
                  <p className="text-gray-500 pt-1 border-t border-gray-200/60">
                    📝 <em>{r.notes}</em>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setDeleting(r)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition"
                title="Delete this onboarding request"
              >
                <Trash2 size={13} /> Delete
              </button>

              {r.status === 'pending' && (
                <button
                  onClick={() => openApproveModal(r)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  <Check size={14} /> Approve & Grant Login
                </button>
              )}

              {r.status === 'approved' && (
                <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl flex items-center gap-1">
                  <CheckCircle size={14} /> Approved & Active
                </span>
              )}
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="col-span-2 text-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-100">
            हाल कुनै नयाँ दर्ता अनुरोध छैन (No ward onboarding requests)
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {approving && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150 text-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h2 className="text-lg font-extrabold text-gray-900">
                Grant Login Credentials
              </h2>
              <button onClick={() => setApproving(null)}>
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Approving <strong>{approving.municipality_name} - Ward {approving.ward_number}</strong>. Set the initial login credentials:
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Generated Username</label>
                <input
                  type="text"
                  value={generatedUsername}
                  onChange={(e) => setGeneratedUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-purple-700 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Initial Password</label>
                <input
                  type="text"
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-purple-700 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setApproving(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow"
                >
                  Approve & Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-gray-800">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={28} />
            </div>
            <h3 className="font-extrabold text-gray-900 text-center text-base mb-1">
              अनुरोध मेटाउने निश्चित हुनुहुन्छ?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-4">
              Are you sure you want to delete registration request for <strong>{deleting.municipality_name} - Ward {deleting.ward_number}</strong>?
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold hover:bg-gray-50"
              >
                रद्द (Cancel)
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRequest(deleting, true)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow"
              >
                मेटाउनुहोस् (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Credentials Modal */}
      {approvedDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150 text-gray-800">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle size={28} />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">
                खाता स्वीकृत तथा सिर्जना भयो!
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {approvedDetails.municipality} - वडा नं. {approvedDetails.ward_number}
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-xs border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Username:</span>
                <div className="flex items-center gap-2">
                  <strong className="text-gray-900 font-mono text-sm">{approvedDetails.username}</strong>
                  <button
                    onClick={() => copyToClipboard(approvedDetails.username, 'Username')}
                    className="p-1 text-gray-500 hover:text-gray-800 rounded bg-white border"
                    title="Copy Username"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Password:</span>
                <div className="flex items-center gap-2">
                  <strong className="text-gray-900 font-mono text-sm">{approvedDetails.password}</strong>
                  <button
                    onClick={() => copyToClipboard(approvedDetails.password, 'Password')}
                    className="p-1 text-gray-500 hover:text-gray-800 rounded bg-white border"
                    title="Copy Password"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 text-gray-500">
                👤 सचिव: <strong>{approvedDetails.secretary}</strong> ({approvedDetails.phone})
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setApprovedDetails(null)}
                className="w-full py-3 bg-[#002b70] hover:bg-[#00173d] text-white font-extrabold rounded-xl text-xs shadow"
              >
                बुझियो (Done)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
