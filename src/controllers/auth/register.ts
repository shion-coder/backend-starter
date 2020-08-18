import { Request, Response } from 'express';

import { User } from '@model';
import { RegisterProps } from '@types';
import { validateRegister } from '@validation';
import { sendEmail, templates } from '@email';

/* -------------------------------------------------------------------------- */

export const register = async (req: Request, res: Response): Promise<Response | void> => {
  /**
   * Validate input with default value is '' because validator only can validate string ( not undefined )
   */

  const {
    firstName = '',
    lastName = '',
    username = '',
    email = '',
    password = '',
    confirmPassword = '',
  }: RegisterProps = req.body;

  const { errors, isValid } = await validateRegister({
    firstName,
    lastName,
    username,
    email,
    password,
    confirmPassword,
  });

  if (!isValid) {
    return res.status(400).send({ errors });
  }

  /**
   * Create new user & return user info with token
   */

  const user = await User.create({ firstName, lastName, username, email, password });

  res.status(201).send({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      confirmed: user.confirmed,
    },
    token: user.generateAuthToken(),
  });

  sendEmail(user.email, templates.confirm(user.id));
};
