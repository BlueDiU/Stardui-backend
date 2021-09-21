const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const { generateJWT } = require('../helpers/generateJWT');

const User = require('../models/user');

const getUsers = async (req = request, res = response) => {
  const { limit = 5, from = 0 } = req.query;
  const query = { state: true };

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).skip(Number(from)).limit(Number(limit)),
  ]);

  res.json({
    total,
    users,
  });
};

const postUsers = async (req = request, res = response) => {
  const { name, email, password, role } = req.body;
  const user = new User({ name, email, password, role });

  // encrypt the password
  const salt = bcryptjs.genSaltSync();
  user.password = bcryptjs.hashSync(password, salt);

  // save data in mongodb
  await user.save();

  // Generate Token
  const token = await generateJWT(user.id, user.name, user.img);

  res.json({ user, token });
};

const putUsers = async (req = request, res = response) => {
  const { id } = req.params;
  /* [destructuring] data that i do not delete, only (rest) */
  const { _id, password, google, email, ...rest } = req.body;

  if (password) {
    // encrypt the password
    const salt = bcryptjs.genSaltSync();
    rest.password = bcryptjs.hashSync(password, salt);
  }

  const user = await User.findByIdAndUpdate(id, rest, {
    new: true,
  });

  res.json(user);
};

const patchUsers = (req, res) => {
  res.json({
    msg: 'PATCH',
  });
};

const deleteUser = async (req = request, res = response) => {
  const { id } = req.params;

  // const user = await User.findByIdAndDelete(id);
  // delete document from mongodb
  const user = await User.findByIdAndUpdate(
    id,
    {
      state: false,
    },
    { new: true }
  );

  res.json(user);
};

module.exports = {
  getUsers,
  putUsers,
  postUsers,
  patchUsers,
  deleteUser,
};
