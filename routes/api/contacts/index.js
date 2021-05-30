const express = require('express');
const router = express.Router();

const ctrl = require('../../../controllers/contacts');
const guard = require('../../../helpers/guard');

const {
  validateNewContact,
  validateUpdatedContact,
  validateStatusFavoriteContact,
} = require('./validation');

router.get('/', guard, ctrl.getAll);

router.get('/:contactId', guard, ctrl.getById);

router.post('/', guard, validateNewContact, ctrl.create);

router.delete('/:contactId', guard, ctrl.remove);

router.patch(
  '/:contactId/favorite',
  guard,
  validateStatusFavoriteContact,
  ctrl.updateFavorite,
);

router.put('/:contactId', guard, validateUpdatedContact, ctrl.update);

module.exports = router;
