import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/button';
import { Text } from 'react-native';

describe('Button Component', () => {
  it('deve renderizar corretamente', () => {
    const { getByRole } = render(
      <Button>
        <Text>Clique aqui</Text>
      </Button>
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('deve chamar onPress quando clicado', () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(
      <Button onPress={onPressMock}>
        <Text>Clique aqui</Text>
      </Button>
    );

    fireEvent.press(getByRole('button'));

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('não deve chamar onPress quando desabilitado', () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(
      <Button disabled onPress={onPressMock}>
        <Text>Clique aqui</Text>
      </Button>
    );

    fireEvent.press(getByRole('button'));

    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('deve aplicar variant corretamente', () => {
    const { getByRole, rerender } = render(
      <Button variant="destructive">
        <Text>Deletar</Text>
      </Button>
    );

    const button = getByRole('button');
    expect(button.props.className).toContain('bg-destructive');

    rerender(
      <Button variant="outline">
        <Text>Cancelar</Text>
      </Button>
    );

    expect(button.props.className).toContain('bg-background');
  });

  it('deve aplicar size corretamente', () => {
    const { getByRole } = render(
      <Button size="sm">
        <Text>Pequeno</Text>
      </Button>
    );

    expect(getByRole('button').props.className).toContain('h-9');
  });

  it('deve aceitar className customizado', () => {
    const { getByRole } = render(
      <Button className="custom-class">
        <Text>Custom</Text>
      </Button>
    );

    expect(getByRole('button').props.className).toContain('custom-class');
  });

  it('deve mostrar opacidade quando desabilitado', () => {
    const { getByRole } = render(
      <Button disabled>
        <Text>Desabilitado</Text>
      </Button>
    );

    expect(getByRole('button').props.className).toContain('opacity-50');
  });
});
