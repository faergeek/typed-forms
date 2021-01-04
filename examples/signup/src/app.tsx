import * as React from 'react';

import { SignupForm, SignupFormValues } from './form';

export function App() {
  const [submitValuesLog, setSubmitValuesLog] = React.useState<
    SignupFormValues[]
  >([]);

  return (
    <div>
      <SignupForm
        initialValues={{
          agree: false,
          birthDate: null,
          email: '',
          name: '',
          password: '',
          passwordConfirm: '',
        }}
        onSubmit={(values) => {
          setSubmitValuesLog((prevState) => [...prevState, values]);
        }}
      />

      <p>Submitted values:</p>

      <ul>
        {submitValuesLog.map((values, index) => (
          <li key={index}>
            <pre>{JSON.stringify(values)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
