import React from 'react';
import { render, screen } from '@testing-library/react';
import Page from '../Page';

test('renders page component', () => {
  render(<Page />);
  const linkElement = screen.getByText(/page content/i);
  expect(linkElement).toBeInTheDocument();
});