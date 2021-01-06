import { atomic, createField, createForm, describeForm } from '.';

test('form creation', () => {
  const form = describeForm({ name: createField<string>(atomic) });
  const { fields, getValues } = createForm(form, { name: '' });

  expect(fields.name.getValue()).toBe('');
  expect(fields.name.getIsTouched()).toBe(false);
  expect(getValues()).toStrictEqual({ name: '' });
});

test('changing field value', () => {
  const form = describeForm({ name: createField<string>(atomic) });
  const { fields, getValues } = createForm(form, { name: '' });

  fields.name.setValue('John Doe');

  expect(fields.name.getValue()).toBe('John Doe');
  expect(fields.name.getIsTouched()).toBe(false);
  expect(getValues()).toStrictEqual({ name: 'John Doe' });
});

test('subscribing to field value changes', () => {
  const form = describeForm({ name: createField<string>(atomic) });
  const { fields, getValues } = createForm(form, { name: '' });

  const onChange = jest.fn(() => {
    expect(fields.name.getValue()).toBe('John Doe');
    expect(fields.name.getIsTouched()).toBe(false);
    expect(getValues()).toStrictEqual({ name: 'John Doe' });
  });

  fields.name.onChange(onChange);
  fields.name.setValue('John Doe');

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith('John Doe');
});

test('unsubscribing from field value changes', () => {
  const form = describeForm({ name: createField<string>(atomic) });
  const { fields, getValues } = createForm(form, { name: '' });

  const onChange = jest.fn();
  const onChange2 = jest.fn(() => {
    expect(fields.name.getValue()).toBe('John Doe');
    expect(fields.name.getIsTouched()).toBe(false);
    expect(getValues()).toStrictEqual({ name: 'John Doe' });
  });

  const dispose = fields.name.onChange(onChange);
  fields.name.onChange(onChange2);
  dispose();
  dispose();
  fields.name.setValue('John Doe');

  expect(onChange).not.toHaveBeenCalled();
  expect(onChange2).toHaveBeenCalledTimes(1);
  expect(onChange2).toHaveBeenCalledWith('John Doe');
});

test('field-level validation on initialization', () => {
  const validate = jest.fn(() => 'Field error');
  const form = describeForm({
    name: createField<string>(atomic, { validate }),
  });
  const { fields } = createForm(form, { name: '' });

  expect(validate).toHaveBeenCalledTimes(1);
  expect(validate).toHaveBeenCalledWith('');
  expect(fields.name.getError()).toBe('Field error');
});

test('field-level validation on field value change', () => {
  const validate = jest.fn(() => 'Field error');
  const form = describeForm({
    name: createField<string>(atomic, { validate }),
  });
  const { fields } = createForm(form, { name: '' });

  fields.name.setValue('John');

  expect(validate).toHaveBeenCalledTimes(2);
  expect(validate).toHaveBeenCalledWith('');
  expect(validate).toHaveBeenCalledWith('John');
  expect(fields.name.getError()).toBe('Field error');
});

test('subscribing to error changes', () => {
  const form = describeForm({
    name: createField<string>(atomic, {
      validate: (value) =>
        value === '' ? 'This field is required' : undefined,
    }),
  });
  const { fields } = createForm(form, { name: '' });
  const onErrorChange = jest.fn(() => {
    expect(fields.name.getError()).toBeUndefined();
  });
  fields.name.onErrorChange(onErrorChange);

  fields.name.setValue('John');

  expect(onErrorChange).toHaveBeenCalledTimes(1);
  expect(onErrorChange).toHaveBeenCalledWith(undefined);
});

test('unsubscribing from error changes', () => {
  const form = describeForm({
    name: createField<string>(atomic, {
      validate: (value) =>
        value === '' ? 'This field is required' : undefined,
    }),
  });
  const { fields } = createForm(form, { name: '' });
  const onErrorChange = jest.fn();
  const onErrorChange2 = jest.fn();
  const dispose = fields.name.onErrorChange(onErrorChange);
  fields.name.onErrorChange(onErrorChange2);

  dispose();
  dispose();
  fields.name.setValue('John');

  expect(onErrorChange).not.toHaveBeenCalled();
  expect(onErrorChange2).toHaveBeenCalledTimes(1);
  expect(onErrorChange2).toHaveBeenCalledWith(undefined);
});

test('touching field', () => {
  const form = describeForm({ name: createField<string>(atomic) });
  const { fields } = createForm(form, { name: '' });

  fields.name.touch();

  expect(fields.name.getIsTouched()).toBe(true);
});

test('subscribing to touched flag changes', () => {
  const form = describeForm({ name: createField<string>(atomic) });
  const { fields } = createForm(form, { name: '' });

  const onIsTouchedChange = jest.fn(() => {
    expect(fields.name.getIsTouched()).toBe(true);
  });

  fields.name.onIsTouchedChange(onIsTouchedChange);
  fields.name.touch();

  expect(onIsTouchedChange).toHaveBeenCalledTimes(1);
  expect(onIsTouchedChange).toHaveBeenCalledWith(true);
});

test('unsubscribing from field touched flag changes', () => {
  const form = describeForm({ name: createField<string>(atomic) });
  const { fields } = createForm(form, { name: '' });

  const onIsTouchedChange = jest.fn();
  const onIsTouchedChange2 = jest.fn(() => {
    expect(fields.name.getIsTouched()).toBe(true);
  });

  const dispose = fields.name.onIsTouchedChange(onIsTouchedChange);
  fields.name.onIsTouchedChange(onIsTouchedChange2);
  dispose();
  dispose();
  fields.name.touch();

  expect(onIsTouchedChange).not.toHaveBeenCalled();
  expect(onIsTouchedChange2).toHaveBeenCalledTimes(1);
  expect(onIsTouchedChange2).toHaveBeenCalledWith(true);
});

test('form submitting', () => {
  const form = describeForm({ name: createField<string>(atomic) });
  const { fields, submit } = createForm(form, { name: '' });
  const submitter = jest.fn();

  submit(submitter);

  expect(fields.name.getIsTouched()).toBe(true);
  expect(submitter).toHaveBeenCalledTimes(1);
  expect(submitter).toHaveBeenCalledWith({ name: '' });
});

test('form submitting with validation errors', () => {
  const form = describeForm({
    name: createField<string>(atomic, {
      validate: () => 'an error',
    }),
  });
  const { fields, submit } = createForm(form, { name: '' });
  const submitter = jest.fn();

  submit(submitter);

  expect(fields.name.getIsTouched()).toBe(true);
  expect(submitter).not.toHaveBeenCalled();
});
