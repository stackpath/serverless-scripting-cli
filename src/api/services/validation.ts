import * as fs from 'fs';

import { IConfiguration, IConfigurationScript } from '../interfaces';
import { STACKPATH_CONFIGFILE_PATH } from '../constants';

/*
 * Namespace performing all validation tasks.
 */
export namespace Validation {

    /**
     * Validates the configuration file and throws errors if contains invalid values.
     */
    export function validateConfiguration(configuration: IConfiguration): void {

        if (!configuration.hasOwnProperty('stack_id')) {
            throw new Error(`Missing required property 'stack_id' in your ${STACKPATH_CONFIGFILE_PATH} file.`);
        }

        if (!configuration.hasOwnProperty('site_id')) {
            throw new Error(`Missing required property 'site_id' in your ${STACKPATH_CONFIGFILE_PATH} file.`);
        }

        if (!configuration.hasOwnProperty('scripts')) {
            throw new Error(`Missing required property 'scripts' in your ${STACKPATH_CONFIGFILE_PATH} file.`);
        }

        if (typeof configuration.scripts !== 'object') {
            throw new Error(`Property 'scripts' should be an array.`);
        }

        configuration.scripts.forEach((script: IConfigurationScript) => {
            if (!script.hasOwnProperty('name') || script.name === '') {
                throw new Error('At least one script is missing a valid name.');
            }

            if (!script.hasOwnProperty('paths')) {
                throw new Error(`The script with name '${script.name}' does not have a paths property.`);
            }

            if (script.paths.length === 0) {
                throw new Error(`The paths property of the script with name '${script.name}' should contain at least one path.`);
            }

            if (!script.hasOwnProperty('file') || script.file === '') {
                throw new Error(`The script with name '${script.name}' does not contain a reference to its file.`);
            }

            if (!fs.existsSync(`${process.cwd()}/${script.file}`)) {
                throw new Error(`The file (${script.file}) of the script with name '${script.name}' could not be found.`);
            }
        });
    }
}
