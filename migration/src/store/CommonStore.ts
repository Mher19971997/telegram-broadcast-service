export abstract class CommonStore {
  name: string;

  abstract up(...rest: any[]): Promise<void>;
}
