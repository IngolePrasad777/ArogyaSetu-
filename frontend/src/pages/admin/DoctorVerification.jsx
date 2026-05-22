import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../services/api.js';

export default function DoctorVerification() {
  const qc = useQueryClient();
  const [doctorId, setDoctorId] = useState('');
  const users = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get('/admin/users')).data });
  const verify = useMutation({ mutationFn: (doctorId) => api.put('/admin/verify-doctor', { doctorId, verified: true }), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }) });
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold">Doctor Verification</h2>
      <p className="text-sm text-slate-500">Enter a doctor UUID from the seed data or registration workflow to approve access.</p>
      <div className="card flex gap-2">
        <input className="input" placeholder="Doctor UUID" value={doctorId} onChange={(event) => setDoctorId(event.target.value)} />
        <button className="btn-primary" onClick={() => verify.mutate(doctorId)}>Verify</button>
      </div>
      <pre className="overflow-auto rounded-md bg-slate-100 p-4 text-sm">{JSON.stringify(users.data?.filter((u) => u.role === 'DOCTOR'), null, 2)}</pre>
    </div>
  );
}
