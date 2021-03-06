const Joi = require('joi');
const { Mongoose } = require('mongoose');
const { HttpCode } = require('../../../helpers/constants');

const schemaNewUser = Joi.object({
  password: Joi.string().required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
  subscription: Joi.string().optional(),
});

const validate = async (schema, body, next) => {
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    next({
      status: HttpCode.BAD_REQUEST,
      message: 'Error from Joi or another validation library',
    });
  }
};

const schemaStatusSubscriptionUser = Joi.object({
  subscription: Joi.string(),
});

module.exports.validateNewUser = (req, _res, next) => {
  return validate(schemaNewUser, req.body, next);
};

module.exports.validateStatusSubscriptionUser = (req, _res, next) => {
  return validate(schemaStatusSubscriptionUser, req.body, next);
};
