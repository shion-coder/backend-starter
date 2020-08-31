import { Request, Response } from 'express';

import { UserProps, User } from '@model';
import { userMessage } from '@messages';

/* -------------------------------------------------------------------------- */

export const getUser = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user as UserProps;
  const { username } = req.params;

  const limit = 9;

  const userFound = await User.findOne({ username })
    .select('id fullName username email website bio avatar posts postCount followers followerCount followingCount')
    .populate({ path: 'posts', select: '-__v', options: { sort: { date: -1 }, limit } })
    .lean();

  if (!userFound) {
    return res.status(404).send({ error: userMessage.username.notFound });
  }

  /**
   * Check current user is following this user or not
   */

  const isFollowing = userFound.followers?.map((follower) => follower._id.toString()).includes(user.id);

  return res.send({
    user: { ...userFound },
    isFollowing,
  });
};
