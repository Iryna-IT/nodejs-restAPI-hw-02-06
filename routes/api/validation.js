const Joi = require("joi");

const schemaNewContact = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
  phone: Joi.string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/)
    .required(),
});

const schemaUpdatedContact = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .optional(),
  phone: Joi.string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/)
    .optional(),
  age: Joi.number().max(120).optional(),
});

const validate = async (schema, body, next) => {
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    next({ status: 400, message: `Field: ${err.message.replace(/"/g, "")}` });
  }
};

module.exports.validateNewContact = (req, _res, next) => {
  return validate(schemaNewContact, req.body, next);
};

module.exports.validateUpdatedContact = (req, _res, next) => {
  return validate(schemaUpdatedContact, req.body, next);
};
