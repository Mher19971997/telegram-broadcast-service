import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';
import ajvMergePatch from 'ajv-merge-patch';
import ajvErrors from 'ajv-errors';
import { MemoryStoredFile } from 'nestjs-form-data';
import {phone} from 'phone';

const ajvLib = ajvErrors(
  ajvKeywords(
    addFormats(
      new Ajv({
        allErrors: true,
        validateSchema: true,
        removeAdditional: true,
        ownProperties: true,
        logger: console,
        useDefaults: true,
        strict: true,
        strictNumbers: true,
        strictTypes: true,
        strictSchema: true,
        strictRequired: false,
        coerceTypes: true,
        code: { optimize: true },
      }),
    ),
  ),
);

ajvMergePatch(ajvLib);

ajvLib.addKeyword({
  keyword: ['mimeType'],
  schema: true,
  errors: 'full',
  validate: (
    schema: any,
    data: MemoryStoredFile,
    // parentSchema?: AnySchemaObject,
    // dataCxt?: DataValidationCxt,
  ) => schema.includes(data.mimetype),
});

ajvLib.addKeyword({
  keyword: ['alpha'],
  schema: true,
  errors: 'full',
  validate: (
    _schema: any,
    data: string,
    // parentSchema?: AnySchemaObject,
    // dataCxt?: DataValidationCxt,
  ) => /^[a-zA-Z]+$/.test(data),
});

ajvLib.addKeyword({
  keyword: ['phoneNumber'],
  schema: true,
  errors: 'full',
  validate: (
      schema: any,
      data: string
  ) => {
    const { isValid } = phone(data);
    return isValid;
  },
});

const getSchema = (name: string) => {
  return ajvLib.getSchema(name);
};

const validateSchema = async (name: string, payload: any) => {
  try {
    return { data: await ajvLib.getSchema(name)(payload) };
  } catch (error) {
    return { error };
  }
};

const hasSchema = (name: string) => {
  return !!getSchema(name);
};

export { ajvLib, getSchema, hasSchema, validateSchema };
