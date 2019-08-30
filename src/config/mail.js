export default {
  host: 'smtp.mailtrap.io',
  port: 2525,
  secure: false,
  auth: {
    user: '2de676781e1eb0',
    pass: '049b9eb3e13a8e',
  },
  default: {
    from: 'Equipe GoBarber <noreply@gobarber.com>',
  },
};

/**
 * Serviços de email para se utilizar em produção
 * Amazon SES,
 * Mailgun,
 * Sparkpost,
 * Mandril(mailchimp),
 *
 * Serviço de email para desenvolvimento  (ambiente DEV)
 * Mailtrap
 */
