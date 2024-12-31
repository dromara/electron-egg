import { logger } from 'ee-core/log';

function welcome(): void {
  logger.info('[child-process] [jobs/example/hello] welcome ! ');
}

export { welcome };