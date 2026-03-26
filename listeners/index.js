import * as commands from './commands/index.js';
import * as events from './events/index.js';
import * as views from './views/index.js';

export const registerListeners = (app) => {
  commands.register(app);
  events.register(app);
  views.register(app);
};
