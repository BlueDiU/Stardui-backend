const { Router } = require('express');
const { check } = require('express-validator');
const {
  addProductToCart,
  getCartOfSpecificUser,
} = require('../controllers/cart');
const { validateFields } = require('../middlewares');

const router = Router();

router.get(
  '/:userid',
  [
    check('userid', 'It is not valid id').isMongoId(),
    validateFields,
  ],
  getCartOfSpecificUser
);

// TODO: VALIDATE TOKEN LATER

router.post(
  '/add',
  [
    check('userId', 'It is not a valid id').isMongoId(),
    check('productId', 'There are not products').not().isEmpty(),
    check(
      'quantity',
      'Quantity is undefined or not it is a number'
    ).isNumeric(),
    validateFields,
  ],
  addProductToCart
);

module.exports = router;