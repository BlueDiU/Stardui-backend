const { response } = require('express');
const bcryptjs = require('bcryptjs');

const User = require('../models/user');
const { generateJWT } = require('../helpers/generateJWT');

const login = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    // verificate if email exist
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        msg: 'Email / password are incorred',
      });
    }

    // user is active
    if (!user.state) {
      return res.status(400).json({
        msg: 'Email / password are incorred - state: false',
      });
    }

    // verificate password
    const validPassword = bcryptjs.compareSync(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        msg: 'Email / password are incorred - password',
      });
    }

    // Generate Token
    const token = await generateJWT(user.id);

    res.json({
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: 'talk to admin',
    });
  }
};

module.exports = { login };
