'use client';

interface UploadProgressProps {
  filename: string;
  progress: number;
  onCancel?: () => void;
}

export function UploadProgress({ filename, progress, onCancel }: UploadProgressProps) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600">📄</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--brand-navy)] truncate">{filename}</p>
          <p className="text-xs text-[var(--muted)]">{progress}%</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-[var(--muted)] hover:text-red-500 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="w-full h-2 bg-[var(--surface)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[var(--brand)] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
