import Joi from 'joi';

export const createAppointmentSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  scheduledDate: Joi.date().iso().required(),
  motorcycle: Joi.string().required(),
  serviceType: Joi.string().required(),
  description: Joi.string().optional(),
  notes: Joi.string().optional()
});

export const updateAppointmentSchema = Joi.object({
  scheduledDate: Joi.date().iso().optional(),
  motorcycle: Joi.string().optional(),
  serviceType: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  notes: Joi.string().allow('').optional()
});

export const cancelAppointmentSchema = Joi.object({
  reason: Joi.string().required()
});
