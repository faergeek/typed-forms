import {
  atomic,
  createField,
  createForm,
  describeForm,
  Field,
  FormValues,
} from '@typed-forms/core';
import * as React from 'react';

function useFieldError<TError>({
  getError,
  onErrorChange,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
Field<any, TError>) {
  const [error, setError] = React.useState(getError);
  React.useEffect(() => onErrorChange(setError), [onErrorChange]);
  return error;
}

function useFieldIsTouched({
  getIsTouched,
  onIsTouchedChange,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
Field<any, any>) {
  const [isTouched, setIsTouched] = React.useState(getIsTouched);
  React.useEffect(() => onIsTouchedChange(setIsTouched), [onIsTouchedChange]);
  return isTouched;
}

function useFieldValue<TValue>({ getValue, onChange }: Field<TValue, string>) {
  const [value, setValue] = React.useState(getValue);
  React.useEffect(() => onChange(setValue), [onChange]);
  return value;
}

function TextInput({
  field,
  id,
  label,
  type,
}: {
  field: Field<string, string>;
  id: string;
  label: string;
  type?: 'email' | 'password';
}) {
  const error = useFieldError(field);
  const isTouched = useFieldIsTouched(field);
  const value = useFieldValue(field);

  return (
    <p>
      <label htmlFor={id}>{label}</label>
      <br />
      <input
        id={id}
        type={type}
        value={value}
        onBlur={() => {
          field.touch();
        }}
        onChange={(event) => {
          field.setValue(event.target.value);
        }}
      />
      {isTouched && error && (
        <>
          <br />
          <small style={{ color: 'red' }}>{error}</small>
        </>
      )}
    </p>
  );
}

function DateInput({
  field,
  id,
  label,
}: {
  field: Field<Date | null, string>;
  id: string;
  label: string;
}) {
  const error = useFieldError(field);
  const isTouched = useFieldIsTouched(field);
  const value = useFieldValue(field);

  return (
    <p>
      <label htmlFor={id}>{label}</label>
      <br />
      <input
        id={id}
        type="date"
        value={value == null ? '' : value.toISOString().split('T')[0]}
        onBlur={() => {
          field.touch();
        }}
        onChange={(event) => {
          field.setValue(event.target.valueAsDate);
        }}
      />
      {isTouched && error && (
        <>
          <br />
          <small style={{ color: 'red' }}>{error}</small>
        </>
      )}
    </p>
  );
}

function Checkbox({
  field,
  id,
  label,
}: {
  field: Field<boolean, string>;
  id: string;
  label: string;
}) {
  const error = useFieldError(field);
  const isTouched = useFieldIsTouched(field);
  const value = useFieldValue(field);

  return (
    <p>
      <label htmlFor={id}>
        <input
          checked={value}
          id={id}
          type="checkbox"
          onBlur={() => {
            field.touch();
          }}
          onChange={(event) => {
            field.setValue(event.target.checked);
          }}
        />{' '}
        {label}
      </label>
      {isTouched && error && (
        <>
          <br />
          <small style={{ color: 'red' }}>{error}</small>
        </>
      )}
    </p>
  );
}

const signupForm = describeForm({
  agree: createField<boolean>(atomic, {
    validate: (value) => (value ? undefined : 'You must accept terms'),
  }),
  birthDate: createField<Date | null>(atomic, {
    validate: (value) => (value ? undefined : 'Birth date is required'),
  }),
  email: createField<string>(atomic, {
    validate: (value) => (value ? undefined : 'Email is required'),
  }),
  name: createField<string>(atomic),
  password: createField<string>(atomic, {
    validate: (value) => (value ? undefined : 'Password is required'),
  }),
  passwordConfirm: createField<string>(atomic, {
    validate: (value) =>
      value ? undefined : 'Password confirmation is required',
  }),
});

export type SignupFormValues = FormValues<typeof signupForm>;

interface Props {
  initialValues: SignupFormValues;
  onSubmit: (values: SignupFormValues) => void;
}

export function SignupForm({ initialValues, onSubmit }: Props) {
  const [{ fields, submit }] = React.useState(() =>
    createForm(signupForm, initialValues)
  );

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit(onSubmit);
      }}
    >
      <TextInput field={fields.name} id="name" label="Name" />
      <DateInput field={fields.birthDate} id="birthDate" label="Birth Date" />
      <TextInput field={fields.email} id="email" label="Email" type="email" />

      <TextInput
        field={fields.password}
        id="password"
        label="Password"
        type="password"
      />

      <TextInput
        field={fields.passwordConfirm}
        id="passwordConfirm"
        label="Confirm password"
        type="password"
      />

      <Checkbox
        field={fields.agree}
        id="agree"
        label="I agree to the terms of service"
      />

      <button>Sign up</button>
    </form>
  );
}
