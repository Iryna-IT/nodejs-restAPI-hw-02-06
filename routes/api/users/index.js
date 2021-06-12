const express = require('express');
const router = express.Router();

const ctrl = require('../../../controllers/users.js');
const guard = require('../../../helpers/guard');

const {
  validateNewUser,
  validateStatusSubscriptionUser,
} = require('./validation');

router.post('/signup', validateNewUser, ctrl.signup);
router.post('/login', ctrl.login);
router.post('/logout', guard, ctrl.logout);

router.patch(
  '/',
  guard,
  validateStatusSubscriptionUser,
  ctrl.updateSubscription,
);

module.exports = router;
