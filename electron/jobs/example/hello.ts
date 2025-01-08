import { logger } from 'ee-core/log';

/**
 * Welcome function
 */
function welcome(): void {
  logger.info('[child-process] [jobs/example/hello] welcome !');
}

export { welcome };