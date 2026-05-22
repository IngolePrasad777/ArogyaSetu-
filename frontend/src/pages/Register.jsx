import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuthStore } from '../store/authStore.js';
import LanguageSwitch from '../components/LanguageSwitch.jsx';

export default function Register() {
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm({ defaultValues: { role: 'PATIENT', consentAccepted: true } });
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const role = watch('role');

  const onSubmit = async (data) => {
    const response = await api.post('/auth/register', data);
    setSession(response.data);
    navigate(response.data.profile.role === 'DOCTOR' ? '/doctor' : '/patient');
  };

  return (
    <section className="min-h-screen bg-clinic-50 px-4 py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-xl rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-clinic-700">Register</h1><LanguageSwitch /></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input className="input" placeholder="Full name" {...register('name', { required: true })} />
          <input className="input" placeholder="Email" type="email" {...register('email', { required: true })} />
          <input className="input" placeholder="Phone" {...register('phone')} />
          <input className="input" placeholder="Password" type="password" {...register('password', { required: true, minLength: 8 })} />
          <select className="input" {...register('role')}>
            <option>PATIENT</option>
            <option>DOCTOR</option>
            <option>HEALTHCARE_ASSISTANT</option>
          </select>
          {role === 'DOCTOR' && <input className="input" placeholder="Specialization" {...register('specialization')} />}
          {role === 'DOCTOR' && <input className="input" placeholder="Qualification" {...register('qualification')} />}
          {role === 'DOCTOR' && <input className="input" placeholder="Experience" type="number" {...register('experience', { valueAsNumber: true })} />}
        </div>
        <label className="mt-4 flex gap-2 text-sm text-slate-600"><input type="checkbox" {...register('consentAccepted')} /> I consent to secure EHR and telehealth data processing.</label>
        <button className="btn-primary mt-6 w-full" disabled={isSubmitting}>Register</button>
        <Link className="mt-4 block text-center text-sm font-semibold text-clinic-700" to="/login">Already registered?</Link>
      </form>
    </section>
  );
}
