export interface Field<TValue, TError> {
  getError: () => TError | undefined;
  getIsTouched: () => boolean;
  getValue: () => TValue;
  setError: (newError: TError | undefined) => void;
  setValue: (newValue: TValue) => void;
  touch: () => void;
  onChange: (cb: (newValue: TValue) => void) => () => void;
  onErrorChange: (cb: (newError: TError | undefined) => void) => () => void;
  onIsTouchedChange: (cb: (newIsTouched: boolean) => void) => () => void;
}

export function atomic<TValue, TError = string>(
  initialValue: TValue
): Field<TValue, TError> {
  const errorSubscribers: Array<(newError: TError | undefined) => void> = [];
  const isTouchedSubscribers: Array<(newIsTouched: boolean) => void> = [];
  const valueSubscribers: Array<(newValue: TValue) => void> = [];
  let error: TError | undefined = undefined;
  let isTouched = false;
  let value = initialValue;

  return {
    getValue: () => value,
    setValue: (newValue) => {
      value = newValue;
      valueSubscribers.forEach((cb) => {
        cb(value);
      });
    },
    onChange: (cb) => {
      valueSubscribers.push(cb);

      return () => {
        const index = valueSubscribers.indexOf(cb);

        if (index === -1) {
          return;
        }

        valueSubscribers.splice(index, 1);
      };
    },

    getIsTouched: () => isTouched,
    touch: () => {
      isTouched = true;
      isTouchedSubscribers.forEach((cb) => {
        cb(isTouched);
      });
    },
    onIsTouchedChange: (cb) => {
      isTouchedSubscribers.push(cb);

      return () => {
        const index = isTouchedSubscribers.indexOf(cb);

        if (index === -1) {
          return;
        }

        isTouchedSubscribers.splice(index, 1);
      };
    },

    getError: () => error,
    setError: (newError) => {
      error = newError;
      errorSubscribers.forEach((cb) => {
        cb(error);
      });
    },
    onErrorChange: (cb) => {
      errorSubscribers.push(cb);

      return () => {
        const index = errorSubscribers.indexOf(cb);

        if (index === -1) {
          return;
        }

        errorSubscribers.splice(index, 1);
      };
    },
  };
}

type FieldFactory<TValue, TError, TField extends Field<TValue, TError>> = (
  initialValue: TValue
) => TField;

interface FieldOptions<TValue, TError> {
  validate: (value: TValue) => TError | undefined;
}

export interface FieldSchema<TValue, TError> {
  factory: FieldFactory<TValue, TError, Field<TValue, TError>>;
  options: FieldOptions<TValue, TError>;
}

export function createField<
  TValue = unknown,
  TError = string,
  TField extends Field<TValue, TError> = Field<TValue, TError>
>(
  factory: FieldFactory<TValue, TError, TField>,
  { validate = () => undefined }: Partial<FieldOptions<TValue, TError>> = {}
): FieldSchema<TValue, TError> {
  return { factory, options: { validate } };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldsSchema = { [TKey in string]: FieldSchema<any, any> };

type FieldsSchemaValues<TFieldsSchema extends FieldsSchema> = {
  [TKey in keyof TFieldsSchema]: ReturnType<
    ReturnType<TFieldsSchema[TKey]['factory']>['getValue']
  >;
};

export interface FormSchema<TFieldsSchema extends FieldsSchema = FieldsSchema> {
  fieldsSchema: TFieldsSchema;
}

type NormalizeFields<TFieldsSchema extends FieldsSchema> = Pick<
  TFieldsSchema,
  {
    [TKey in keyof TFieldsSchema]: TFieldsSchema[TKey]['factory'] extends FieldFactory<
      unknown,
      unknown,
      Field<unknown, unknown>
    >
      ? never
      : TKey;
  }[keyof TFieldsSchema]
>;

export function describeForm<TFieldsSchema extends FieldsSchema>(
  fieldsSchema: TFieldsSchema
): FormSchema<NormalizeFields<TFieldsSchema>> {
  return { fieldsSchema };
}

export type FormValues<TFormSchema extends FormSchema> = FieldsSchemaValues<
  TFormSchema['fieldsSchema']
>;

type Fields<TFormSchema extends FormSchema> = {
  [TKey in keyof TFormSchema['fieldsSchema']]: ReturnType<
    TFormSchema['fieldsSchema'][TKey]['factory']
  >;
};

interface Form<TFormSchema extends FormSchema> {
  fields: Fields<TFormSchema>;
  getValues: () => FormValues<TFormSchema>;
  submit: (submitter: (values: FormValues<TFormSchema>) => void) => void;
}

export function createForm<TFormSchema extends FormSchema>(
  formSchema: TFormSchema,
  initialValues: FormValues<TFormSchema>
): Form<TFormSchema> {
  const fields = Object.fromEntries(
    Object.entries(formSchema.fieldsSchema).map(([fieldName, fieldSchema]) => [
      fieldName,
      fieldSchema.factory(initialValues[fieldName]),
    ])
  ) as Fields<TFormSchema>;

  function getValues() {
    return Object.fromEntries(
      Object.entries(fields).map(([fieldName, field]) => [
        fieldName,
        field.getValue(),
      ])
    ) as FormValues<TFormSchema>;
  }

  function validate() {
    Object.entries(formSchema.fieldsSchema).forEach(
      ([fieldName, fieldSchema]) => {
        const { getValue, setError } = fields[fieldName];

        setError(fieldSchema.options.validate(getValue()));
      }
    );
  }

  validate();
  Object.values(fields).forEach((field) => field.onChange(validate));

  return {
    fields,
    getValues,
    submit: (submitter) => {
      const allFields = Object.values(fields) as Array<Field<never, never>>;

      allFields.forEach((field) => {
        field.touch();
      });

      if (!allFields.every((field) => field.getError() === undefined)) {
        return;
      }

      submitter(getValues());
    },
  };
}
