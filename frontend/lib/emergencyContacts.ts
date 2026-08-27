export interface EmergencyContact {
  label: string;
  service: string; // what this number actually reaches — always shown, never just a bare number
  number: string; // display format
  tel: string; // digits-only value for the tel: link
  verified: boolean;
}

// Pakistan-focused phase. Numbers below were supplied and confirmed by the
// product owner on 2026-08-23 — do not change without the same level of
// confirmation. To expand to another country later, add a sibling config
// and swap which one ACTIVE_* points to; the Safety Mode screen only ever
// reads these two exports, never a hardcoded number.
export const ACTIVE_EMERGENCY_CONTACT: EmergencyContact = {
  label: 'Emergency services',
  service: 'Police Control Room — crimes in progress, law-and-order, urgent police assistance',
  number: '15',
  tel: '15',
  verified: true,
};

export const ACTIVE_CRISIS_HELPLINE: EmergencyContact = {
  label: 'Rozan Helpline',
  service: 'Confidential counseling & crisis intervention, 24/7',
  number: '0800-111-00',
  tel: '0800111100',
  verified: true,
};
