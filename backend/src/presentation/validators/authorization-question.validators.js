import Joi from 'joi';

export const createAuthQuestionSchema = Joi.object({
  question: Joi.string().required().min(5).max(500)
});

export const respondAuthQuestionSchema = Joi.object({
  response: Joi.string().valid('AUTHORIZED', 'REJECTED', 'WHATSAPP_CONTACT').required(),
  customerMessage: Joi.string().allow('').max(500).optional()
});

export const replyAuthQuestionSchema = Joi.object({
  message: Joi.string().required().min(1).max(500)
});
