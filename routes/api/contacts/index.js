const express = require('express');
const router = express.Router();

const ctrl = require('../../../controllers/contacts');
const guard = require('../../../helpers/guard');

const {
  validateNewContact,
  validateUpdatedContact,
  validateStatusFavoriteContact,
  validateObjectId,
} = require('./validation');

router.get('/', guard, ctrl.getAll);

router.get('/:contactId', guard, validateObjectId, ctrl.getById);

router.post('/', guard, validateNewContact, ctrl.create);

router.delete('/:contactId', guard, validateObjectId, ctrl.remove);

router.patch(
  '/:contactId/favorite',
  guard,
  validateObjectId,
  validateStatusFavoriteContact,
  ctrl.updateFavorite,
);

router.put(
  '/:contactId',
  guard,
  validateObjectId,
  validateUpdatedContact,
  ctrl.update,
);

module.exports = router;
