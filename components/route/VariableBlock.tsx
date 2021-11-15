import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import styled, { ThemeContext } from 'styled-components';
import Select from 'react-select';
import { registerVariable, RouteContext, setVariableValue } from '../../reducers/route/reducer';
import { RouteVariableType, VALID_VARIABLE_TYPES } from '../../reducers/route/types';
import { BorderlessCard, Card, variantIsBorderless } from '../Layout';
import { ErrorCard } from './ErrorCard';
import { Button } from '../Button';

interface VariableInputFieldProps {
  type: RouteVariableType;
  onChange: (value: string) => void;
  value?: string;
  options?: string;
  defaultValue?: string,
}

const VariableInputField: React.FC<VariableInputFieldProps> = ({ type, options, value, onChange }) => {
  switch (type) {
    case 'text':
      return (
        <Input
          value={value}
          onChange={event => onChange(event.target.value)}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={value}
          onChange={event => onChange(event.target.value)}
        />
      );

    case 'boolean':
      return (
        <BooleanToggleOptionRow>
          <BooleanToggleOption active={value === 'true'} onClick={() => onChange('true')}>
            Yes
          </BooleanToggleOption>
          <BooleanToggleOption active={value === 'false'} onClick={() => onChange('false')}>
            No
          </BooleanToggleOption>
        </BooleanToggleOptionRow>
      );

    case 'select': {
      if (!options) {
        return (
          <div>
            Unable to render select field: <code>options</code> is a required property.
          </div>
        );
      }
      let parsedOptions;

      try {
        parsedOptions = JSON.parse(options);
      } catch (error) {
        return (
          <div>
            Unable to render select field: could not parse options JSON (<code>{(error as { message: string }).message}</code>).
          </div>
        );
      }

      if (!Array.isArray(parsedOptions)) {
        return (
          <div>
            Unable to render select field: <code>options</code> must be a JSON array.
          </div>
        );
      }
      const optionItems = parsedOptions.map(item => ({ label: item, value: item }));

      return (
        <VariableSelectWrapper>
          <Select
            options={optionItems}
            value={optionItems.find(({ value: itemValue }) => itemValue === value) ?? null}
            onChange={option => onChange(option?.value ?? undefined)}
            classNamePrefix="variable-selector"
          />
        </VariableSelectWrapper>
      );
    }
    default:
      return (
        <div>
          Unable to render input field: unsupported type {type}.
        </div>
      );
  }
};

interface VariableBlockProps {
  name: string;
  type: RouteVariableType;
  title?: string;
  defaultValue?: string;
  theme?: string;
  options?: string;
}

export const VariableBlock: React.FC<VariableBlockProps> = ({ name, title, defaultValue, theme: variant = 'info', type = 'text', options, children }) => {
  const themeContext = useContext(ThemeContext);

  const hasRegistered = useRef(false);
  const state = RouteContext.useState();
  const dispatch = RouteContext.useDispatch();

  const sanitizedName = name?.startsWith('user-content-') ? name.replace('user-content-', '') : name;

  const CardComponent = variantIsBorderless(themeContext, variant) ? BorderlessCard : Card;

  const handleInputValueChange = useCallback(value => {
    dispatch(setVariableValue(sanitizedName, value));
  }, [dispatch, sanitizedName]);

  const currentValue = useMemo(() => state.variables[sanitizedName]?.value ?? undefined, [state.variables, sanitizedName]);

  useEffect(() => {
    if (!hasRegistered.current) {
      dispatch(registerVariable(sanitizedName, type, defaultValue));
      hasRegistered.current = true;
    }
  }, [dispatch, sanitizedName, type, defaultValue]);

  if (!type) {
    return (
      <ErrorCard>Variable directive must specify the <code>type</code> property.</ErrorCard>
    );
  }
  if (!sanitizedName) {
    return (
      <ErrorCard>Variable directive must specify the <code>name</code> property.</ErrorCard>
    );
  }

  if (!VALID_VARIABLE_TYPES.includes(type)) {
    return (
      <ErrorCard>{type} is not a valid variable type (must be one of {VALID_VARIABLE_TYPES.join(', ')}).</ErrorCard>
    );
  }

  return (
    <Container>
      <CardComponent variant={variant}>
        {title && <Title>{title}</Title>}

        <VariableInputField
          type={type}
          options={options}
          onChange={handleInputValueChange}
          value={currentValue}
        />

        {children}
      </CardComponent>
    </Container>
  );
};

const Title = styled.div`
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
`;

const Input = styled.input`
  border-radius: 0.25rem;
  height: 2rem;
  margin: 0 0 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.input.foreground};
  background-color: ${({ theme }) => theme.input.background};
  border: 1px solid ${({ theme }) => theme.input.border};
`;

const BooleanToggleOptionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
`;

const BooleanToggleOption = styled(Button)<{active: boolean}>`
  margin: 0;
  border-radius: 0.5rem 0 0 0.5rem;
  background-color: ${({ active, theme }) => active ? theme.primary : theme.input.background};
  color: ${({ active, theme }) => active ? '#fff' : theme.label};

  & + & {
    border-radius: 0 0.5rem 0.5rem 0;
    margin: 0;
  }

  &:not(:disabled):hover,
  &:not(:disabled):active {
    background-color: ${({ active, theme }) => active ? theme.primaryHover : theme.input.hover};
  }
`;

const VariableSelectWrapper = styled.div`
  & .variable-selector__control {
    background-color: ${({ theme }) => theme.input.background};
    color: ${({ theme }) => theme.input.foreground};
    border-color: ${({ theme }) => theme.input.border};
  }

  & .variable-selector__value-container div {
    color: ${({ theme }) => theme.input.foreground};
  }

  & .variable-selector__indicator-separator {
    background-color: ${({ theme }) => theme.input.border};
  }

  & .variable-selector__menu {
    background-color: ${({ theme }) => theme.input.background};
    z-index: 99;
  }

  & .variable-selector__option--is-focused {
    background-color: ${({ theme }) => theme.backgroundSelected};
  }
`;

const Container = styled.div`
  & ${BooleanToggleOptionRow}:last-child {
    margin-bottom: 1rem;
  }

  & ${VariableSelectWrapper}:last-child {
    margin-bottom: 1rem;
  }

  & input:last-child {
    margin-bottom: 1rem;
  }
`;
