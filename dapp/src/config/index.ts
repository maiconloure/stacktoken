import { EnvironmentsEnum } from 'lib';

export * from './sharedConfig';

export const API_URL = 'https://devnet-template-api.multiversx.com';
export const contractAddress =
  'erd1qqqqqqqqqqqqqpgqyk55njxpyrzs3n2r7lxtg63lhgyrvj9yd8sscg4cp0';
export const environment = EnvironmentsEnum.devnet;
export const sampleAuthenticatedDomains = [API_URL];

