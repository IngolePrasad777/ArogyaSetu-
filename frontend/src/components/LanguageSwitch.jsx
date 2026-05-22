import { useI18nStore } from '../store/i18nStore.js';

export default function LanguageSwitch() {
  const { locale, setLocale, t } = useI18nStore();
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
      {t('language')}
      <select className="rounded-md border border-slate-300 bg-white px-2 py-1" value={locale} onChange={(event) => setLocale(event.target.value)}>
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="mr">मराठी</option>
      </select>
    </label>
  );
}
