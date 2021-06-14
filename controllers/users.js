const jwt = require('jsonwebtoken');

// Для облачного харнилища
const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');

require('dotenv').config();
const Users = require('../model/users');
const { HttpCode } = require('../helpers/constants');

// Для локального хранилища
// const UploadAvatar = require('../services/upload-avatars-local');

const UploadAvatar = require('../services/upload-avatars-cloud');

const EmailService = require('../services/email');
const {
  CreateSenderNodemailer,
  CreateSenderSendgrid,
} = require('../services/sender-email');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
// Для локального хранилища
// const AVATARS_OF_USERS = process.env.AVATARS_OF_USERS;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const signup = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email);
    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: 'error',
        code: HttpCode.CONFLICT,
        message: 'Email in use',
      });
    }
    const newUser = await Users.create(req.body);
    const { id, email, subscription, avatar, verifyToken } = newUser;
    try {
      const emailService = new EmailService(
        process.env.NODE_ENV,
        new CreateSenderSendgrid(),
      );
      await emailService.sendVerifyPasswordEmail(verifyToken, email);
    } catch (e) {
      console.log(e.message);
    }
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: {
        id,
        email,
        subscription,
        avatar,
      },
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findByEmail(email);
    const isValidPassword = await user?.validPassword(password);

    if (!user || !isValidPassword || !user.verify) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: 'error',
        code: HttpCode.UNAUTHORIZED,
        message: 'Email or password is wrong',
        // message: 'Invalid crendentials',
      });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '2h' });
    await Users.updateToken(user.id, token);
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  await Users.updateToken(req.user.id, null);
  return res.status(HttpCode.NO_CONTENT).json({});
};

const updateSubscription = async (req, res, next) => {
  try {
    const usertoken = req.headers.authorization;
    const token = usertoken.split(' ');
    const decoded = jwt.verify(token[1], JWT_SECRET_KEY);
    const userId = decoded.id;

    const user = await Users.updateStatusUser(userId, req.body);
    if (user) {
      return res
        .status(HttpCode.OK)
        .json({ status: 'success', code: HttpCode.OK, data: { user } });
    }
    return res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: 'Not Found',
    });
  } catch (error) {
    next(error);
  }
};

const avatars = async (req, res, next) => {
  try {
    const id = req.user.id;

    // // Использование локального хранилища
    // const uploads = new UploadAvatar(AVATARS_OF_USERS);
    // const avatarUrl = await uploads.saveAvatarToStatic({
    //   idUser: id,
    //   pathFile: req.file.path,
    //   nameFile: req.file.filename,
    //   oldFile: req.user.avatar,
    // });

    const uploadCloud = promisify(cloudinary.uploader.upload);
    const uploads = new UploadAvatar(uploadCloud);
    const { userIdImg, avatarUrl } = await uploads.saveAvatarToCloud(
      req.file.path,
      req.user.userIdImg,
    );
    await Users.updateAvatar(id, avatarUrl, userIdImg);

    // // Использование локального хранилища
    // await Users.updateAvatar(id, avatarUrl);
    // // Для составления avatarUrl
    // console.log(req.hostname);

    return res.json({
      status: 'success',
      code: HttpCode.OK,
      data: { avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const user = await Users.getUserByVerifyToken(req.params.token);
    if (user) {
      await Users.updateVerifyToken(user.id, true, null);
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        message: 'Verification successful!',
      });
    }
    return res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: 'User not found with verification token',
    });
  } catch (error) {
    next(error);
  }
};
const repeatSendEmailVerify = async (req, res, next) => {
  const user = await Users.findByEmail(req.body.email);
  if (user) {
    const { email, verifyToken, verify } = user;
    console.log(
      '🚀 ~ file: users.js ~ line 186 ~ repeatSendEmailVerify ~ user',
      user,
    );
    if (!verify) {
      try {
        const emailService = new EmailService(
          process.env.NODE_ENV,
          // new CreateSenderNodemailer(),
          new CreateSenderSendgrid(),
        );
        await emailService.sendVerifyPasswordEmail(verifyToken, email);
        return res.status(HttpCode.OK).json({
          status: 'success',
          code: HttpCode.OK,
          message: 'Verification email sent',
        });
      } catch (e) {
        console.log(e.message);
        return next(e);
      }
    }
    return res.status(HttpCode.CONFLICT).json({
      status: 'error',
      code: HttpCode.CONFLICT,
      message: 'Verification has already been passed',
    });
  }
  return res.status(HttpCode.NOT_FOUND).json({
    status: 'error',
    code: HttpCode.NOT_FOUND,
    message: 'User not found',
  });
};

module.exports = {
  signup,
  login,
  logout,
  updateSubscription,
  avatars,
  verify,
  repeatSendEmailVerify,
};
