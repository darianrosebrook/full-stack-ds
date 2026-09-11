import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button, CodeBlock, Input, RadioGroup, Select } from '@full-stack-ds/react';
import { CodeViewer } from './CodeViewer';

const choices = [{ value: 'red', label: 'Red' }, { value: 'blue', label: 'Blue' }, { value: 'grey', label: 'Unavailable', disabled: true }];

describe('shared controls used by the showcase', () => {
  it('preserves intrinsic number and color semantics while delivering string values', () => {
    const onChange = vi.fn();
    render(<><Input type="number" ariaLabel="Count" defaultValue="2" onChange={onChange} /><Input type="color" ariaLabel="Ink" defaultValue="#112233" onChange={onChange} /></>);
    const number = screen.getByRole('spinbutton', { name: 'Count' });
    expect(number).not.toHaveAttribute('role');
    const color = screen.getByLabelText('Ink');
    expect(color).not.toHaveAttribute('role');
    fireEvent.change(number, { target: { value: '3' } });
    fireEvent.change(color, { target: { value: '#445566' } });
    expect(onChange.mock.calls).toEqual([['3'], ['#445566']]);
  });
  it('shows selected labels, closes a single selection and preserves controlled authority', () => {
    const change = vi.fn();
    const { rerender } = render(<Select options={choices} value="red" onChange={change} defaultOpen={false} triggerLabel="Color" />);
    const trigger = screen.getByRole('button', { name: 'Color' });
    expect(trigger).toHaveTextContent('Red');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'Blue' }));
    expect(change).toHaveBeenCalledWith('blue');
    expect(trigger).toHaveTextContent('Red');
    expect(screen.queryByRole('listbox')).toBeNull();
    rerender(<Select options={choices} value="blue" onChange={change} defaultOpen={false} triggerLabel="Color" />);
    expect(trigger).toHaveTextContent('Blue');
  });
  it('keeps independent radio groups and native form serialization', () => {
    function Groups() {
      const [value, setValue] = useState('red');
      return <form aria-label="Choices"><RadioGroup name="first" ariaLabel="First" options={choices} value={value} onChange={setValue} /><RadioGroup name="second" ariaLabel="Second" options={choices} defaultValue="red" /></form>;
    }
    render(<Groups />);
    fireEvent.click(screen.getAllByRole('radio', { name: 'Blue' })[0]);
    expect(screen.getAllByRole('radio', { name: 'Blue' })[0]).toBeChecked();
    expect(screen.getAllByRole('radio', { name: 'Red' })[1]).toBeChecked();
    expect([...new FormData(screen.getByRole('form') as HTMLFormElement)]).toEqual([['first', 'blue'], ['second', 'red']]);
    expect(screen.getAllByRole('radio', { name: 'Unavailable' })[0]).toBeDisabled();
  });
  it('uses consumer annotations instead of duplicating automatic source', () => {
    const click = vi.fn();
    const { container, rerender } = render(<CodeBlock code="canonical" language="plaintext"><Button onClick={click}>annotated</Button></CodeBlock>);
    expect(container.querySelector('pre')?.textContent).toBe('annotated');
    fireEvent.click(screen.getByRole('button', { name: 'annotated' }));
    expect(click).toHaveBeenCalledOnce();
    rerender(<CodeBlock code={'<tag>\n\tplain\n'} language="plaintext" />);
    expect(container.querySelector('pre')?.textContent).toBe('<tag>\n\tplain\n');
    expect(container.querySelector('tag')).toBeNull();
  });
  it('keeps the viewer on generated CodeBlock and copies canonical source', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const { container } = render(<CodeViewer code={'first\n  second'} filename="example.ts" />);
    expect(container.querySelector('pre')).toHaveAttribute('data-fsds-component', 'code-block');
    fireEvent.click(screen.getByRole('button', { name: 'Copy code to clipboard' }));
    expect(writeText).toHaveBeenCalledWith('first\n  second');
  });
});
