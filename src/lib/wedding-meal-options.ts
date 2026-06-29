import { z } from 'zod';

export const MEAL_CHOICE_IDS = ['steak', 'coq_au_vin', 'other'] as const;

export type MealChoiceId = (typeof MEAL_CHOICE_IDS)[number];

export const mealChoiceIdSchema = z.enum(MEAL_CHOICE_IDS);

/** RSVP meal radios — value persisted as `invite.meal_choice`. */
export const MEAL_CHOICE_OPTIONS: readonly {
  value: MealChoiceId;
  label: string;
}[] = [
  {
    value: 'steak',
    label: 'Steak with crispy smashed potato & seasonal greens (gf)',
  },
  {
    value: 'coq_au_vin',
    label:
      'Coq Au Vin with Swiss brown mushrooms, French shallots, bacon & tarragon served with a side of assorted sauteed beans',
  },
  {
    value: 'other',
    label: 'Other ( e.g. Vegetarian / Vegan )',
  },
];

const labelById = Object.fromEntries(
  MEAL_CHOICE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<MealChoiceId, string>;

export function mealChoiceLabel(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = mealChoiceIdSchema.safeParse(value);
  return parsed.success ? labelById[parsed.data] : null;
}
