import { promisify } from 'node:util';
import { randomBytes } from 'node:crypto';

const urlSafeCharacters = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~'];
const numericCharacters = [...'0123456789'];
const distinguishableCharacters = [...'CDEHKMPRTUWXY012458'];
const asciiPrintableCharacters = [...'!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'];
const alphanumericCharacters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'];

const readUInt16LE = (uInt8Array: { [x: string]: number }, offset: number) => uInt8Array[offset] + (uInt8Array[offset + 1] << 8);

const generateForCustomCharacters = (length: number, characters: string | any[], randomBytes: (arg0: number) => any) => {
  const characterCount = characters.length;
  const maxValidSelector = Math.floor(0x1_00_00 / characterCount) * characterCount - 1;
  const entropyLength = 2 * Math.ceil(1.1 * length);
  let string = '';
  let stringLength = 0;

  while (stringLength < length) {
    const entropy = randomBytes(entropyLength);
    let entropyPosition = 0;

    while (entropyPosition < entropyLength && stringLength < length) {
      const entropyValue = readUInt16LE(entropy, entropyPosition);
      entropyPosition += 2;
      if (entropyValue > maxValidSelector) {
        continue;
      }

      string += characters[entropyValue % characterCount];
      stringLength++;
    }
  }

  return string;
};

const generateForCustomCharactersAsync = async (length: number, characters: string | any[], randomBytesAsync: (arg0: number) => any) => {
  const characterCount = characters.length;
  const maxValidSelector = Math.floor(0x1_00_00 / characterCount) * characterCount - 1;
  const entropyLength = 2 * Math.ceil(1.1 * length);
  let string = '';
  let stringLength = 0;

  while (stringLength < length) {
    const entropy = await randomBytesAsync(entropyLength);
    let entropyPosition = 0;

    while (entropyPosition < entropyLength && stringLength < length) {
      const entropyValue = readUInt16LE(entropy, entropyPosition);
      entropyPosition += 2;
      if (entropyValue > maxValidSelector) {
        continue;
      }

      string += characters[entropyValue % characterCount];
      stringLength++;
    }
  }

  return string;
};

const allowedTypes = new Set([undefined, 'hex', 'base64', 'url-safe', 'numeric', 'distinguishable', 'ascii-printable', 'alphanumeric']);

const createGenerator =
  (
    generateForCustomCharacters: {
      (length: any, characters: any, randomBytes: any): string;
      (length: any, characters: any, randomBytesAsync: any): Promise<string>;
      (arg0: any, arg1: string[], arg2: any): any;
    },
    specialRandomBytes: (arg0: number, arg1: string, arg2: any) => any,
    randomBytes: any,
  ) =>
  // eslint-disable-next-line sonarjs/cognitive-complexity
  ({ length, type, characters }: any) => {
    if (!(length >= 0 && Number.isFinite(length))) {
      throw new TypeError('Expected a `length` to be a non-negative finite number');
    }

    if (type !== undefined && characters !== undefined) {
      throw new TypeError('Expected either `type` or `characters`');
    }

    if (characters !== undefined && typeof characters !== 'string') {
      throw new TypeError('Expected `characters` to be string');
    }

    if (!allowedTypes.has(type)) {
      throw new TypeError(`Unknown type: ${type}`);
    }

    if (type === undefined && characters === undefined) {
      type = 'hex';
    }

    if (type === 'hex' || (type === undefined && characters === undefined)) {
      return specialRandomBytes(Math.ceil(length * 0.5), 'hex', length); // Needs 0.5 bytes of entropy per character
    }

    if (type === 'base64') {
      return specialRandomBytes(Math.ceil(length * 0.75), 'base64', length); // Needs 0.75 bytes of entropy per character
    }

    if (type === 'url-safe') {
      return generateForCustomCharacters(length, urlSafeCharacters, randomBytes);
    }

    if (type === 'numeric') {
      return generateForCustomCharacters(length, numericCharacters, randomBytes);
    }

    if (type === 'distinguishable') {
      return generateForCustomCharacters(length, distinguishableCharacters, randomBytes);
    }

    if (type === 'ascii-printable') {
      return generateForCustomCharacters(length, asciiPrintableCharacters, randomBytes);
    }

    if (type === 'alphanumeric') {
      return generateForCustomCharacters(length, alphanumericCharacters, randomBytes);
    }

    if (characters?.length === 0) {
      throw new TypeError('Expected `characters` string length to be greater than or equal to 1');
    }

    if (characters?.length > 0x1_00_00) {
      throw new TypeError('Expected `characters` string length to be less or equal to 65536');
    }

    return generateForCustomCharacters(length, characters, randomBytes);
  };

export function createStringGenerator(specialRandomBytes: any, randomBytes: any) {
  return createGenerator(generateForCustomCharacters as any, specialRandomBytes, randomBytes);
}

export function createAsyncStringGenerator(specialRandomBytesAsync: any, randomBytesAsync: any) {
  return createGenerator(generateForCustomCharactersAsync as any, specialRandomBytesAsync, randomBytesAsync);
}

const randomBytesAsync = promisify(randomBytes);

export default createStringGenerator(
  (byteLength: number, type: string, length: number) =>
    randomBytes(byteLength)
      .toString(type as any)
      .slice(0, length),
  (size: number) => new Uint8Array(randomBytes(size)),
);
export const cryptoRandomStringAsync = createAsyncStringGenerator(
  async (byteLength: number, type: string, length: number) => {
    const buffer = await randomBytesAsync(byteLength);
    return buffer.toString(type as any).slice(0, length);
  },
  async (size: number) => new Uint8Array(await randomBytesAsync(size)),
);
