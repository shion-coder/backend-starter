import { Request, Response } from 'express';

import { UserProps, User } from '@model';
import { UpdateProfileProps } from '@types';
import { validateUpdateProfile } from '@validation';
import { sendEmail, templates } from '@email';

/* -------------------------------------------------------------------------- */

export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user as UserProps;

  /**
   * Validate input with default value is '' because validator only can validate string ( not undefined )
   */

  const {
    firstName = '',
    lastName = '',
    username = '',
    website = '',
    bio = '',
    email = '',
  }: UpdateProfileProps = req.body;

  const { errors, isValid } = await validateUpdateProfile({
    firstName,
    lastName,
    username,
    website,
    email,
    bio,
    user,
  });

  if (!isValid) {
    return res.status(400).send({ errors });
  }

  /**
   * Update user's profile
   */

  user.firstName = firstName;
  user.lastName = lastName;
  if (username !== user.username) {
    user.username = username;
  }
  user.website = website;
  user.bio = bio;
  if (email !== user.email) {
    user.email = email;
    user.confirmed = false;

    sendEmail(email, templates.confirm(user.id));
  }

  await user.save();

  /**
   * Send user info after update back to client
   */

  const userResult = await User.findById(user.id)
    .select('id firstName lastName fullName username email website bio avatar confirmed')
    .lean();

  return res.send({ user: { ...userResult } });
};
