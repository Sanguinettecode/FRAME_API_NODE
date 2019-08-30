import Notifications from '../Schemas/notifications';
import User from '../models/User';

class NotifyController {
  async index(req, res) {
    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!isProvider) {
      return res.status(401).json({
        error: 'Acess danied, only providers can view notifications ',
      });
    }

    const notifications = await Notifications.find({
      user: req.userId,
    })
      .sort({
        createdAt: 'desc',
      })
      .limit(20);
    return res.json(notifications);
  }

  async update(req, res) {
    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!isProvider) {
      return res.status(401).json({
        error: 'Acess danied, only providers can view notifications ',
      });
    }
    const notification = await Notifications.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
      },
      {
        new: true,
      }
    );
    return res.json(notification);
  }
}
export default new NotifyController();
