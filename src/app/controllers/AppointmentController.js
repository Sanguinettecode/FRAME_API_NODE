import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../Schemas/notifications';
import Queue from '../../lib/Queue';
import cancelationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointment = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past'],
      limit: 20,
      offset: (page - 1) * 20,
      include: {
        model: User,
        as: 'provider',
        attributes: ['id', 'name'],
        include: {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      },
    });

    return res.json(appointment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const { provider_id, date } = req.body;
    /*
     * Check if the provider_id is a provider
     */

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You only create a appointment to a provider' });
    }

    if (parseInt(provider_id, 10) === req.userId) {
      return res.status(401).json({
        error: 'The provider do not allow create appointment to yourself',
      });
    }

    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Pass date are not permited' });
    }
    /*
     * Check if the date is available
     */

    const dateAvailability = await Appointment.findOne({
      where: {
        provider_id,
        date: hourStart,
        canceled_at: null,
      },
    });

    if (dateAvailability) {
      return res.status(400).json({ error: 'This date is not available' });
    }

    const newAppointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    const user = await User.findByPk(req.userId);
    const dateFormated = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      user: provider_id,
      content: `Agendamento marcado por ${user.name} para ${dateFormated}`,
    });
    return res.json(newAppointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    // Verify if user is requester of the appointment
    if (appointment && appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'Only the requester is allow to delete appointment',
      });
    }

    // User only can cancel 2 h before of appointment
    const hourPermited = subHours(appointment.date, 2);
    // Appointment date = 23:00
    // hourPermited = 21:00
    // Now = 22:42
    if (isBefore(hourPermited, new Date())) {
      return res.status(401).json({
        error: 'The cancel of appointment does not permitted',
      });
    }
    appointment.canceled_at = new Date();
    await appointment.save();

    await Queue.add(cancelationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
