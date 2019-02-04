import { IConfigurationScript } from "./configuration-script";

export interface IConfiguration {
  stack_id: string;
  site_id: string;
  scripts: IConfigurationScript[];
}
