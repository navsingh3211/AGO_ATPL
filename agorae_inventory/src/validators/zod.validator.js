import zod from 'zod';

export const createLocationVal = zod.object({
  locationName: zod.string().refine((val) => val.trim().length > 0, {
    message: 'Location name is required and cannot be empty.'
  }),
  locationCapacity: zod.number().nullable().optional()
});

export const editLocationVal = zod.object({
  locationId: zod.string().refine((val) => val.trim().length > 0, {
    message: 'Location id is required and cannot be empty.'
  }),
  locationName: zod.string().refine((val) => val.trim().length > 0, {
    message: 'Location name is required and cannot be empty.'
  }),
  locationCapacity: zod.number().nullable().optional()
});
