import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Clock3, Mail, ShieldCheck, Stethoscope } from 'lucide-react';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';
import { formatDateTime, statusTone } from '../../utils/adminWorkspace.js';

export default function DoctorVerification() {
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get('/admin/users')).data });
  const doctors = useQuery({ queryKey: ['admin-doctors-directory'], queryFn: async () => (await api.get('/doctors')).data });
  const verify = useMutation({
    mutationFn: (doctorId) => api.put('/admin/verify-doctor', { doctorId, verified: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-doctors-directory'] });
    }
  });
  const doctorAccounts = (users.data || []).filter((user) => user.role === 'DOCTOR');
  const verifiedDoctors = doctors.data || [];
  const verifiedEmails = new Set(verifiedDoctors.map((doctor) => doctor.email));
  const accountsWithoutProfile = doctorAccounts.filter((user) => !verifiedEmails.has(user.email));

  return (
    <div>
      <PageHeader title="Doctor Verification" eyebrow="Clinical access control">
        Review doctor accounts and verified directory profiles without asking admins to copy technical IDs.
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3">
          <div className="card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="section-title">Verified Doctor Directory</h2>
                <p className="mt-1 text-sm text-slate-500">Doctors visible to patients for appointment booking.</p>
              </div>
              <span className="rounded-md bg-clinic-50 p-2 text-clinic-700"><BadgeCheck size={18} /></span>
            </div>
          </div>
          {!verifiedDoctors.length && <EmptyState title="No verified doctors found" />}
          {verifiedDoctors.map((doctor) => (
            <article className="card" key={doctor.doctorId}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-950">{doctor.fullName}</p>
                  <p className="text-sm font-semibold text-clinic-700">{doctor.specialization}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Mail size={15} /> {doctor.email}</p>
                </div>
                <span className="w-fit rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">Verified</span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div><dt className="font-semibold text-slate-500">Qualification</dt><dd className="text-slate-900">{doctor.qualification || '-'}</dd></div>
                <div><dt className="font-semibold text-slate-500">Experience</dt><dd className="text-slate-900">{doctor.experience ?? '-'} years</dd></div>
                <div><dt className="font-semibold text-slate-500">Availability</dt><dd className="text-slate-900">{doctor.availability || '-'}</dd></div>
              </dl>
              <button className="btn-secondary mt-4" disabled={verify.isPending} onClick={() => verify.mutate(doctor.doctorId)}>
                <ShieldCheck size={18} /> Re-check verification
              </button>
            </article>
          ))}
        </section>

        <aside className="space-y-4">
          <section className="card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="section-title">Doctor Accounts</h2>
              <span className="pill"><Stethoscope size={15} /> {doctorAccounts.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {!doctorAccounts.length && <EmptyState title="No doctor accounts found" />}
              {doctorAccounts.map((user) => (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3" key={user.id}>
                  <p className="font-semibold text-slate-900">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone(user.enabled)}`}>{user.enabled ? 'Enabled' : 'Disabled'}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">{formatDateTime(user.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-amber-700" />
              <h2 className="section-title">Pending Review</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The current backend exposes verified doctor profiles through the directory. Accounts listed here without a directory profile need backend profile data before admins can approve them from this screen.
            </p>
            <div className="mt-4 space-y-2">
              {!accountsWithoutProfile.length && <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">No unmatched doctor accounts.</p>}
              {accountsWithoutProfile.map((user) => (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm" key={user.id}>
                  <p className="font-semibold text-amber-900">{user.email}</p>
                  <p className="mt-1 text-amber-800">Doctor profile not visible in verified directory.</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
