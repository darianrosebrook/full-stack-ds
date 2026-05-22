/**
 * Centralized logging utility with configurable verbosity levels.
 *
 * Provides level-based logging that can be silenced or configured for different
 * environments. Supports timing operations and structured logging.
 *
 * @example
 * ```typescript
 * import { Logger } from '@/utils/helpers/logger';
 *
 * // Set log level (default: 'warn')
 * Logger.setLevel('debug');
 *
 * // Log messages
 * Logger.debug('Detailed debug info');
 * Logger.info('General information');
 * Logger.warn('Warning message');
 * Logger.error('Error occurred');
 *
 * // Timing operations
 * Logger.timeStart('expensive-operation');
 * // ... do work ...
 * Logger.timeEnd('expensive-operation'); // Logs: expensive-operation: 123ms
 * ```
 */
export class Logger {
  /** Current logging level. Messages below this level are suppressed. */
  static level: 'debug' | 'info' | 'warn' | 'error' | 'silent' = 'warn';

  /**
   * Start a timer for performance measurement.
   * @param label - Timer identifier
   */
  static timeStart(label: string) {
    if (['debug', 'info', 'warn', 'error'].includes(Logger.level))
      console.time(label);
  }

  /**
   * End a timer and log the elapsed time.
   * @param label - Timer identifier (must match timeStart call)
   */
  static timeEnd(label: string) {
    if (['debug', 'info', 'warn', 'error'].includes(Logger.level))
      console.timeEnd(label);
  }

  /**
   * Log debug message (highest verbosity).
   * @param args - Values to log
   */
  static debug(...args: unknown[]) {
    if (['debug'].includes(Logger.level)) console.debug('[DEBUG]', ...args);
  }

  /**
   * Log info message.
   * @param args - Values to log
   */
  static info(...args: unknown[]) {
    if (['debug', 'info'].includes(Logger.level))
      console.info('[INFO]', ...args);
  }

  /**
   * Log warning message.
   * @param args - Values to log
   */
  static warn(...args: unknown[]) {
    if (['debug', 'info', 'warn'].includes(Logger.level))
      console.warn('[WARN]', ...args);
  }

  /**
   * Log error message.
   * @param args - Values to log
   */
  static error(...args: unknown[]) {
    if (['debug', 'info', 'warn', 'error'].includes(Logger.level))
      console.error('[ERROR]', ...args);
  }

  /**
   * Set the logging verbosity level.
   *
   * @param level - New logging level
   * - 'debug': All messages including debug
   * - 'info': Info, warn, and error messages
   * - 'warn': Warning and error messages (default)
   * - 'error': Only error messages
   * - 'silent': No messages
   */
  static setLevel(level: typeof Logger.level) {
    Logger.level = level;
  }
}
