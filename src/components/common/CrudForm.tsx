import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeenIcon } from '@/components';

interface CrudFormProps {
  fields: Array<{ key: string; label: string; type: string; required?: boolean }>;
  values: Record<string, any>;
  errors: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function CrudForm({ fields, values, errors, onChange }: CrudFormProps) {
  return (
    <>
      {fields.map(({ key, label, type, required }) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={key}
            type={type}
            value={values[key] || ''}
            onChange={e => onChange(key, e.target.value)}
            placeholder={`Nhập ${label.toLowerCase()}`}
            className={errors[key] ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors[key] && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <KeenIcon icon="warning" className="w-3 h-3" />
              Trường này là bắt buộc
            </p>
          )}
        </div>
      ))}
    </>
  );
} 