module.exports = {
  dialect: 'postgres',
  host: '192.168.99.100',
  username: 'postgres',
  password: 'mypass',
  database: 'gobarber',
  port: '5434',
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: true,
  },
};
