import { translateModalCallback } from './translate-modal.js';

export const register = (app) => {
  app.view('translate_modal', translateModalCallback);
};
