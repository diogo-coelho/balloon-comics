import { ImageProcessFailedException } from '../error/image-process-failed.exception';

describe('ImageProcessFailedException', () => {
  it('deve criar a exceção com mensagem e statusCode 500', () => {
    const exception = new ImageProcessFailedException('Erro no processamento');

    expect(exception.name).toBe('ImageProcessFailedException');
    expect(exception.cause).toEqual(new Error('Erro no processamento'));
    expect(exception.getStatusCode()).toBe(500);
  });

  it('deve criar a exceção a partir de um Error via fromError', () => {
    const originalError = new Error('Falha no encoder');
    const exception = ImageProcessFailedException.fromError(originalError);

    expect(exception.name).toBe('ImageProcessFailedException');
    expect(exception.cause).toEqual(new Error('Falha no encoder'));
    expect(exception.getStatusCode()).toBe(500);
  });

  it('deve criar a exceção a partir de uma mensagem via fromMessage', () => {
    const exception = ImageProcessFailedException.fromMessage('Formato inválido');

    expect(exception.name).toBe('ImageProcessFailedException');
    expect(exception.cause).toEqual(new Error('Formato inválido'));
    expect(exception.getStatusCode()).toBe(500);
  });
});