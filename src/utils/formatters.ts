import { CallStatus } from '@shared/types';

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(isoString: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

export function getStatusLabel(status: CallStatus): string {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'ended_early':
      return 'Ended Early';
    default:
      return status;
  }
}

export function getStatusBadgeClass(status: CallStatus): string {
  switch (status) {
    case 'in_progress':
      return 'status-badge in_progress';
    case 'completed':
      return 'status-badge completed';
    case 'ended_early':
      return 'status-badge ended_early';
    default:
      return 'status-badge';
  }
}
