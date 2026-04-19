import Joi from 'joi';

export const createServiceSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  motorcycle: Joi.string().required(),
  brand: Joi.string().optional(),
  model: Joi.string().optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  plate: Joi.string().optional(),
  serviceType: Joi.string().required(),
  description: Joi.string().optional(),
  estimatedCost: Joi.number().min(0).optional(),
  estimatedDate: Joi.date().iso().optional(),
  notes: Joi.string().optional(),
  internalNotes: Joi.string().optional()
});

export const updateServiceSchema = Joi.object({
  motorcycle: Joi.string().optional(),
  brand: Joi.string().allow('', null).optional(),
  model: Joi.string().allow('', null).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).allow(null).optional(),
  plate: Joi.string().allow('', null).optional(),
  serviceType: Joi.string().optional(),
  description: Joi.string().allow('', null).optional(),
  estimatedCost: Joi.number().min(0).allow(null).optional(),
  finalCost: Joi.number().min(0).allow(null).optional(),
  estimatedDate: Joi.date().iso().allow(null).optional(),
  deliveryDate: Joi.date().iso().allow(null).optional(),
  notes: Joi.string().allow('', null).optional(),
  internalNotes: Joi.string().allow('', null).optional()
});

export const updateServiceStatusSchema = Joi.object({
  status: Joi.string()
    .valid('RECEIVED', 'IN_DIAGNOSIS', 'IN_REPAIR', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED')
    .required(),
  notes: Joi.string().allow('', null).optional()
});
