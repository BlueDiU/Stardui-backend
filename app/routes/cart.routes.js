/* libs */
const { Router } = require('express');
const { check } = require('express-validator');

/* Controller */
const {
  addProductToCart,
  getCartOfSpecificUser,
  countProductsOfSpecificUser,
  isProductAddedToCart,
  deleteOneFromCart,
  updateQuantityByProduct,
} = require('../controllers/cart.controller');

/* Middlewares */
const {
  validateFields,
  validateJWT,
} = require('../middlewares');

/* Helpers */
const { doesProductExistInCart } = require('../helpers');

/* Creating a new instance of the Router class. */
const router = Router();

router.get(
  '/:userid',
  [
    check('userid', 'It is not valid id').isMongoId(),
    validateFields,
  ],
  getCartOfSpecificUser
);

router.get(
  '/count/:userid',
  [
    check('userid', 'It is not valid id').isMongoId(),
    validateFields,
  ],
  countProductsOfSpecificUser
);

router.get(
  '/verify/:productId/:userId',
  [
    check('productId', 'productId is not valid id').isMongoId(),
    check('userId', 'UserId is not valid id').isMongoId(),
    validateFields,
  ],
  isProductAddedToCart
);

router.delete(
  '/delete/:productId/:userId',
  [
    validateJWT,
    check('productId', 'productId is not valid id').isMongoId(),
    check('userId', 'UserId is not valid id').isMongoId(),
    check('productId').custom(doesProductExistInCart),
    validateFields,
  ],
  deleteOneFromCart
);

router.post(
  '/add',
  [
    validateJWT,
    check('userId', 'It is not a valid id').isMongoId(),
    check('productId', 'There are not products').not().isEmpty(),
    check('size', 'Size is required').not().isEmpty(),
    check(
      'quantity',
      'Quantity is undefined or not it is a number'
    ).isNumeric(),
    validateFields,
  ],
  addProductToCart
);

router.put('/quantity/:id', updateQuantityByProduct);

module.exports = router;
