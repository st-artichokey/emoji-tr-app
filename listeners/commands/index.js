import { translateCommandCallback } from './translate-command.js';

export const register = (app) => {
  app.command('/translate', translateCommandCallback);
};
