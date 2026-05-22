import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuthStore } from '../store/authStore.js';
import LanguageSwitch from '../components/LanguageSwitch.jsx';
import { useState } from 'react';

export default function Login() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { email: 'patient@arogyasetu.local', password: 'Password123!' } });
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);

  const onSubmit = async (data) => {
    const response = await api.post('/auth/login', data);
    setSession(response.data);
    const role = response.data.profile.role.toLowerCase();
    navigate(`/${role === 'patient' ? 'patient' : role === 'doctor' ? 'doctor' : 'admin'}`);
  };

  const requestOtp = async (email) => {
    await api.post('/auth/request-otp', { email });
    setOtpSent(true);
  };

  const verifyOtp = async (data) => {
    const response = await api.post('/auth/verify-otp', { email: data.email, otp: data.otp });
    setSession(response.data);
    navigate(`/${response.data.profile.role.toLowerCase()}`);
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-clinic-50 px-4 py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-clinic-700">ArogyaSetu+</h1><LanguageSwitch /></div>
        <p className="mt-2 text-slate-600">Telehealth and EHR access for rural care teams.</p>
        <label className="mt-6 block text-sm font-semibold">Email</label>
        <input className="input mt-2" type="email" {...register('email', { required: true })} />
        <label className="mt-4 block text-sm font-semibold">Password</label>
        <input className="input mt-2" type="password" {...register('password', { required: true })} />
        {otpSent && <input className="input mt-4" placeholder="Enter OTP" {...register('otp')} />}
        <button className="btn-primary mt-6 w-full" disabled={isSubmitting}>Login</button>
        <button type="button" className="btn-secondary mt-3 w-full" onClick={handleSubmit((data) => requestOtp(data.email))}>
          {otpSent ? 'OTP requested' : 'Request OTP'}
        </button>
        {otpSent && <button type="button" className="btn-secondary mt-3 w-full" onClick={handleSubmit(verifyOtp)}>Verify OTP</button>}
        <Link className="mt-4 block text-center text-sm font-semibold text-clinic-700" to="/register">Create a new account</Link>
      </form>
    </section>
  );
}
