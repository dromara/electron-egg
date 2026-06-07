import { logger } from 'ee-core/log';

export function welcome(): void {
  logger.info('[child-process] [jobs/example/hello] welcome ! ');
}
