import logger from '@alohateam/logger';
import { CONSOLE_LOGGING_LEVELS } from '@config/env';

const instance = logger({ loggingLevels: CONSOLE_LOGGING_LEVELS });

export default instance;