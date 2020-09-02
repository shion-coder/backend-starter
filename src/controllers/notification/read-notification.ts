import { Request, Response } from 'express';

import { Notification, UserProps } from '@model';
import { followMess } from '@messages';

/* -------------------------------------------------------------------------- */

export const readNotification = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user as UserProps;

  /**
   * Read all notifications in unread state of receiver with user id
   */

  await Notification.updateMany({ receiver: user.id }, { read: true });

  return res.send({ message: followMess.read });
};
