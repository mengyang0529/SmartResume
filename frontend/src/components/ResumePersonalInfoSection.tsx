import { type ChangeEvent } from 'react'
import { FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser } from 'react-icons/fa'
import type { ResumeData } from '../types/resume'

interface ResumePersonalInfoSectionProps {
  resumeData: ResumeData
  onFieldChange: (updater: (prev: ResumeData) => ResumeData) => void
  onPhotoClick: () => void
  onPhotoUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onPhotoRemove: () => void
  photoInputRef: React.MutableRefObject<HTMLInputElement | null>
}

function NotionInput({ label, value, onChange, icon, clean }: { label?: string; value?: string; onChange: (v: string) => void; icon?: React.ReactNode; clean?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 group/input">
      {label && (
        <label className="text-xs font-medium text-warm-500 group-focus-within/input:text-[#0075de] transition-colors flex items-center gap-1.5">
          {label}
          {icon && <span className="text-warm-300">{icon}</span>}
        </label>
      )}
      {clean ? (
        <input
          className="w-full bg-transparent py-1.5 text-sm text-[rgba(0,0,0,0.95)] border-b border-[rgba(0,0,0,0.1)] focus:border-[#0075de] focus:outline-none transition-colors placeholder:text-warm-300"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label || ''}
        />
      ) : (
        <input
          className="input text-sm py-[7px]"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label || ''}
        />
      )}
    </div>
  )
}

export default function ResumePersonalInfoSection({ resumeData, onFieldChange, onPhotoClick, onPhotoUpload, onPhotoRemove, photoInputRef }: ResumePersonalInfoSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 mt-4">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
        <NotionInput label="First Name" value={resumeData.personal.firstName} onChange={(v) => { onFieldChange(prev => ({ ...prev, personal: { ...prev.personal, firstName: v } })) }} />
        <NotionInput label="Last Name" value={resumeData.personal.lastName} onChange={(v) => { onFieldChange(prev => ({ ...prev, personal: { ...prev.personal, lastName: v } })) }} />
        <NotionInput label="Position / Title" value={resumeData.personal.position} onChange={(v) => { onFieldChange(prev => ({ ...prev, personal: { ...prev.personal, position: v } })) }} />
        <NotionInput label="Phone" value={resumeData.personal.mobile} onChange={(v) => { onFieldChange(prev => ({ ...prev, personal: { ...prev.personal, mobile: v } })) }} icon={<FaPhone />} />
        <NotionInput label="Homepage" value={resumeData.personal.homepage ?? ''} onChange={(v) => { onFieldChange(prev => ({ ...prev, personal: { ...prev.personal, homepage: v } })) }} icon={<FaUser />} />
        <NotionInput label="Email" value={resumeData.personal.email} onChange={(v) => { onFieldChange(prev => ({ ...prev, personal: { ...prev.personal, email: v } })) }} icon={<FaEnvelope />} />
        <div className="sm:col-span-2">
          <NotionInput label="Address" value={resumeData.personal.address} onChange={(v) => { onFieldChange(prev => ({ ...prev, personal: { ...prev.personal, address: v } })) }} icon={<FaMapMarkerAlt />} />
        </div>
      </div>
      <div className="w-full sm:w-[130px] flex-shrink-0 flex flex-col items-center justify-start pt-1">
        <div
          className="w-[130px] h-[150px] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-warm-400 hover:bg-warm-50 transition-colors overflow-hidden relative group"
          onClick={onPhotoClick}
        >
          {resumeData.personal.photo?.url ? (
            <>
              <img src={resumeData.personal.photo.url} alt="Profile" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCamera className="text-white text-xl" />
              </div>
            </>
          ) : (
            <FaCamera className="text-gray-300 text-2xl" />
          )}
        </div>
        {resumeData.personal.photo?.url ? (
          <button onClick={onPhotoRemove} className="text-xs text-warm-500 mt-1.5 hover:text-red-500 transition-colors">
            Remove
          </button>
        ) : (
          <span className="text-[11px] text-gray-400 mt-1.5">Photo</span>
        )}
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoUpload} />
      </div>
    </div>
  )
}
