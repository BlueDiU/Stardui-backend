/* libs */
const { response } = require('express');
const bcryptjs = require('bcryptjs');

/* Helpers */
const { generateJWT } = require('../helpers/generateJWT');
const { googleVerify } = require('../helpers/google-verify');

/* Models */
const { User } = require('../models');

/* == Log In == */
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
    const token = await generateJWT(
      user.id,
      user.name,
      user.img,
      user.role,
      user.google
    );

    return res.json({
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

const googleSignIn = async (req, res = response) => {
  const { id_token } = req.body;

  try {
    const { name, img, email } = await googleVerify(id_token);

    let user = await User.findOne({ email });

    if (!user) {
      const data = {
        name,
        email,
        password: ':v',
        img,
        google: true,
      };

      user = new User(data);
      await user.save();
    }

    if (!user.state) {
      return res.status(401).json({
        msg: 'Talk to admin, user blocked',
      });
    }

    // Generate Token
    const token = await generateJWT(
      user.id,
      user.name,
      user.img,
      true
    );

    return res.json({
      user,
      token,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      msg: 'Google token is not valid',
    });
  }
};

/* == Renew current user token == */
const revalidateToken = async (req, res = response) => {
  try {
    const { user } = req;
    const { _id: uid, name, img, role, google } = user;

    // renew token
    const token = await generateJWT(
      uid,
      name,
      img,
      role,
      google
    );

    return res.json({ ok: true, uid, name, role, img, token });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      msg: 'The token is not valid',
    });
  }
};

module.exports = { login, googleSignIn, revalidateToken };
