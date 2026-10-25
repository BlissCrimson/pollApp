import { Category } from '../interfaces/survey';

export const SURVEY_CATEGORIES: Category[] = [
  { value: 'team-activities', label: 'Team Activities' },
  { value: 'health-wellness', label: 'Health & Wellness' },
  { value: 'gaming-entertainment', label: 'Gaming & Entertainment' },
  { value: 'education-learning', label: 'Education & Learning' },
  { value: 'lifestyle-preferences', label: 'Lifestyle & Preferences' },
  { value: 'technology-innovation', label: 'Technology & Innovation' },
];

// Returns the display label; falls back to the stored value for unknown (older) categories
export function getCategoryLabel(value: string | null): string {
  if (!value) return '';
  return SURVEY_CATEGORIES.find((category) => category.value === value)?.label ?? value;
}
