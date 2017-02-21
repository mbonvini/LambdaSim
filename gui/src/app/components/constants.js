import React from 'react';
import TextField from 'material-ui/TextField';

export const renderTextField = ({ input, label, hintText, meta: { touched, error }, ...custom }) => (
  <TextField hintText={hintText}
    floatingLabelText={label}
    errorText={touched && error}
    {...input}
    {...custom}
  />
);