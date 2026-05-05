import type { PersonalInfo } from '@app-types/resume';
import { FaPhone, FaEnvelope, FaUser, FaMapMarkerAlt, FaTrash, FaPlus } from 'react-icons/fa';
import clsx from 'clsx';

interface ResumePersonalInfoSectionProps {
  personal: PersonalInfo;
  onFieldChange: (updater: (prev: PersonalInfo) => PersonalInfo) => void;
  onPhotoClick: () => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoRemove: () => void;
  photoInputRef: React.RefObject<HTMLInputElement>;
}

function NotionInput({
  label,
  value,
  onChange,
  icon,
  clean,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  clean?: boolean;
}) {
  return (
    <div className={clsx('group/input flex flex-col gap-1.5', clean && 'opacity-60')}>
      <label className="text-[10px] font-bold text-warm-400 uppercase tracking-widest pl-0.5">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-warm-300 text-[10px] group-focus-within/input:text-[#0075de] transition-colors">
            {icon}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={clsx(
            'w-full bg-[#fcfcfb] border border-[rgba(0,0,0,0.08)] rounded-lg py-2 text-sm font-medium text-[rgba(0,0,0,0.85)] placeholder:text-warm-200 focus:outline-none focus:ring-2 focus:ring-[#0075de]/20 focus:border-[#0075de] transition-all',
            icon ? 'pl-9 pr-4' : 'px-3'
          )}
        />
      </div>
    </div>
  );
}

export default function ResumePersonalInfoSection({
  personal,
  onFieldChange,
  onPhotoClick,
  onPhotoUpload,
  onPhotoRemove,
  photoInputRef,
}: ResumePersonalInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* 1. Basic Fields */}
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <NotionInput
          label="First Name"
          value={personal.firstName}
          onChange={v => {
            onFieldChange(prev => ({ ...prev, firstName: v }));
          }}
        />
        <NotionInput
          label="Last Name"
          value={personal.lastName}
          onChange={v => {
            onFieldChange(prev => ({ ...prev, lastName: v }));
          }}
        />
        <NotionInput
          label="Position / Title"
          value={personal.position}
          onChange={v => {
            onFieldChange(prev => ({ ...prev, position: v }));
          }}
        />
        <NotionInput
          label="Phone"
          value={personal.mobile ?? ''}
          onChange={v => {
            onFieldChange(prev => ({ ...prev, mobile: v }));
          }}
          icon={<FaPhone />}
        />
        <NotionInput
          label="Homepage"
          value={personal.homepage ?? ''}
          onChange={v => {
            onFieldChange(prev => ({ ...prev, homepage: v }));
          }}
          icon={<FaUser />}
        />
        <NotionInput
          label="Email"
          value={personal.email}
          onChange={v => {
            onFieldChange(prev => ({ ...prev, email: v }));
          }}
          icon={<FaEnvelope />}
        />

        <div className="sm:col-span-2">
          <NotionInput
            label="Address"
            value={personal.address ?? ''}
            onChange={v => {
              onFieldChange(prev => ({ ...prev, address: v }));
            }}
            icon={<FaMapMarkerAlt />}
          />
        </div>
        <NotionInput
          label="Birth Date"
          value={personal.birth ?? ''}
          onChange={v => {
            onFieldChange(prev => ({ ...prev, birth: v }));
          }}
          icon={<FaUser />}
        />
        <NotionInput
          label="Furigana (given)"
          value={personal.furiganaFirstName ?? ''}
          onChange={v => {
            onFieldChange(prev => ({ ...prev, furiganaFirstName: v }));
          }}
          clean
        />
        <NotionInput
          label="Furigana (family)"
          value={personal.furiganaLastName ?? ''}
          onChange={v => {
            onFieldChange(prev => ({ ...prev, furiganaLastName: v }));
          }}
          clean
        />
      </div>

      {/* 2. Photo Upload */}
      <div className="flex flex-col items-center">
        <label className="text-[10px] font-bold text-warm-400 uppercase tracking-widest mb-3 self-start pl-1">
          Profile Photo
        </label>
        <div className="relative group/photo w-full max-w-[180px] aspect-square rounded-2xl border-2 border-dashed border-[rgba(0,0,0,0.1)] bg-[#fcfcfb] flex flex-col items-center justify-center gap-3 overflow-hidden hover:border-[#0075de] hover:bg-[#0075de]/[0.02] transition-all cursor-pointer">
          {personal.photo?.url ? (
            <div className="absolute inset-0 p-1">
              <img
                src={personal.photo.url}
                alt="Profile"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onPhotoClick();
                  }}
                  className="p-2 bg-white rounded-full text-[#0075de] shadow-xl hover:scale-110 transition-transform"
                >
                  <FaPlus />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onPhotoRemove();
                  }}
                  className="p-2 bg-[#dc3522] rounded-full text-white shadow-xl hover:scale-110 transition-transform"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ) : (
            <div onClick={onPhotoClick} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[rgba(0,0,0,0.03)] text-warm-300 flex items-center justify-center text-xl group-hover/photo:scale-110 transition-transform">
                <FaUser />
              </div>
              <p className="text-[10px] font-bold text-warm-400">Click to Upload</p>
            </div>
          )}
          <input
            type="file"
            ref={photoInputRef}
            className="hidden"
            accept="image/*"
            onChange={onPhotoUpload}
          />
        </div>
      </div>
    </div>
  );
}
