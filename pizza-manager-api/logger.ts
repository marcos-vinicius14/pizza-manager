import pino from 'pino';

export default pino({
    transport: {
    target: 'pino-pretty',
    options: {
      colorize: true, 
      levelFirst: true,
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
    },
  },
});
