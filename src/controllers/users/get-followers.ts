import { Request, Response } from 'express';

import { UserProps, User } from '@model';
import { validateUserId } from '@validation';
import { userMessage } from '@messages';

/* -------------------------------------------------------------------------- */

export const getFollowers = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user as UserProps;
  const { id, offset } = req.params;

  const { errors, isValid } = await validateUserId({ id });

  if (!isValid) {
    return res.status(400).send({ message: errors.id });
  }

  const limit = 3;

  const userFound = await User.findById(id)
    .select('followers')
    .populate({
      path: 'followers',
      select: 'fullName username avatar',
      options: { skip: Number(offset), limit },
    })
    .lean();

  if (!userFound) {
    return res.status(404).send({ error: userMessage.username.notFound });
  }

  const followers = userFound.followers?.map((follower) => {
    const isFollowing = user.following?.includes(follower._id.toString());

    return { user: { ...follower }, isFollowing };
  });

  if (followers?.length === limit) {
    return res.send({ users: followers, next: Number(offset) + limit });
  }

  return res.send({ users: followers });
};
