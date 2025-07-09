import { V1_InitialScripts } from './V1_InitialScripts.service';

export const Migration = Symbol('Migration');
export const stores: any[] = [
  { provide: Migration, useClass: V1_InitialScripts, multi: true },
];
