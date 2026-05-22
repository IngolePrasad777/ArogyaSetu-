import { useMutation } from '@tanstack/react-query';
import { FileDown, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';

export default function Prescription() {
  const [params] = useSearchParams();
  const { register, control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      consultationId: params.get('consultationId') || '',
      diagnosis: '',
      testsRecommended: '',
      precautions: '',
      followUpDate: '',
      medicines: [{ name: '', morning: false, afternoon: false, night: false, days: 3 }]
    }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'medicines' });
  const consultationId = watch('consultationId');
  const mutation = useMutation({
    mutationFn: (data) => {
      const medicines = data.medicines
        .filter((item) => item.name)
        .map((item) => `${item.name} | Morning: ${item.morning ? 'Yes' : 'No'} | Afternoon: ${item.afternoon ? 'Yes' : 'No'} | Night: ${item.night ? 'Yes' : 'No'} | Days: ${item.days}`)
        .join('\n');
      return api.post('/doctor/prescription', {
        consultationId: data.consultationId,
        medicines,
        dosageInstructions: `Diagnosis: ${data.diagnosis || '-'}\nTests: ${data.testsRecommended || '-'}\nPrecautions: ${data.precautions || '-'}`,
        followUpAdvice: data.followUpDate ? `Follow-up date: ${data.followUpDate}` : ''
      });
    }
  });

  useEffect(() => {
    if (params.get('consultationId')) setValue('consultationId', params.get('consultationId'));
  }, [params, setValue]);

  return (
    <div>
      <PageHeader title="Prescription" eyebrow="Save to EHR">
        Structure medicines, tests, precautions, follow-up, and verification so the prescription can be saved back to the patient record.
      </PageHeader>
      <form className="space-y-4" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <section className="card grid gap-4 lg:grid-cols-2">
          <input type="hidden" {...register('consultationId', { required: true })} />
          <div className="rounded-md border border-clinic-100 bg-clinic-50 p-4">
            <p className="text-sm font-semibold text-clinic-700">Consultation</p>
            <p className="mt-1 text-slate-700">{consultationId ? 'Linked from completed consultation.' : 'Complete a consultation first, then generate the prescription from that success screen.'}</p>
          </div>
          <label>
            <span className="text-sm font-semibold text-slate-600">Follow-up date</span>
            <input className="input mt-2" type="date" {...register('followUpDate')} />
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-600">Diagnosis</span>
            <textarea className="input mt-2 min-h-24" {...register('diagnosis')} />
          </label>
          <label>
            <span className="text-sm font-semibold text-slate-600">Tests Recommended</span>
            <textarea className="input mt-2 min-h-24" {...register('testsRecommended')} />
          </label>
          <label className="lg:col-span-2">
            <span className="text-sm font-semibold text-slate-600">Precautions</span>
            <textarea className="input mt-2 min-h-24" {...register('precautions')} />
          </label>
        </section>

        <section className="card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title">Medicines</h2>
            <button className="btn-secondary py-2" type="button" onClick={() => append({ name: '', morning: false, afternoon: false, night: false, days: 3 })}>Add medicine</button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3">Medicine</th>
                  <th className="py-2 px-3">Morning</th>
                  <th className="py-2 px-3">Afternoon</th>
                  <th className="py-2 px-3">Night</th>
                  <th className="py-2 px-3">Days</th>
                  <th className="py-2 pl-3"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr className="border-b border-slate-100" key={field.id}>
                    <td className="py-3 pr-3"><input className="input" placeholder="Medicine name" {...register(`medicines.${index}.name`)} /></td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" {...register(`medicines.${index}.morning`)} /></td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" {...register(`medicines.${index}.afternoon`)} /></td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" {...register(`medicines.${index}.night`)} /></td>
                    <td className="py-3 px-3"><input className="input" type="number" min="1" {...register(`medicines.${index}.days`)} /></td>
                    <td className="py-3 pl-3"><button className="btn-secondary py-2" type="button" onClick={() => remove(index)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-900">Doctor Signature</p>
            <p className="text-sm text-slate-500">Digitally signed by the logged-in doctor when saved.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" type="button"><FileDown size={18} /> Generate PDF</button>
            <button className="btn-primary" disabled={!consultationId || mutation.isPending}><Save size={18} /> Save to EHR</button>
          </div>
        </section>

        {mutation.isSuccess && (
          <div className="rounded-md bg-clinic-50 p-4 text-sm">
            <p className="font-semibold text-clinic-700">Prescription saved.</p>
            <p>Verification code: {mutation.data.data.verificationCode}</p>
            <a className="font-semibold text-clinic-700" href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/prescriptions/${mutation.data.data.prescriptionId}/download`}>Download prescription</a>
          </div>
        )}
      </form>
    </div>
  );
}
