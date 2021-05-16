const Joi = require('joi');

const schemaNewContact = Joi.object({
  name: Joi.string()
    .regex(/^([a-zA-Z]{2,}\s[a-zA-Z]{1,}'?-?[a-zA-Z]{2,}\s?([a-zA-Z]{1,})?)$/)
    .required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
  phone: Joi.string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/)
    .required(),
  favorite: Joi.boolean().optional(),
});

// /^([A-Z]{1}[a-z]{1,23})$/

const schemaUpdatedContact = Joi.object({
  name: Joi.string()
    .regex(/^([a-zA-Z]{2,}\s[a-zA-Z]{1,}'?-?[a-zA-Z]{2,}\s?([a-zA-Z]{1,})?)$/)
    .required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .optional(),
  phone: Joi.string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/)
    .optional(),
  favorite: Joi.boolean().optional(),
});

const schemaStatusFavoiteContact = Joi.object({
  // favorite: Joi.boolean().required(),
  favorite: Joi.boolean(),
});

const validate = async (schema, body, next) => {
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    next({ status: 400, message: `Field: ${err.message.replace(/"/g, '')}` });
  }
};

module.exports.validateNewContact = (req, _res, next) => {
  return validate(schemaNewContact, req.body, next);
};

module.exports.validateUpdatedContact = (req, _res, next) => {
  return validate(schemaUpdatedContact, req.body, next);
};

module.exports.validateStatusFavoriteContact = (req, _res, next) => {
  return validate(schemaStatusFavoiteContact, req.body, next);
};
