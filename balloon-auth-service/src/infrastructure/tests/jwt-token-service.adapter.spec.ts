import { JwtTokenServiceAdapter } from '../security/jwt-token-service.adapter';

describe('JwtTokenServiceAdapter', () => {
  it('deve delegar geração e verificação de tokens com as opções corretas', async () => {
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('token'),
      verifyAsync: jest
        .fn()
        .mockResolvedValue({ sub: 'user-id', tokenType: 'refresh' }),
    };
    const config = {
      privateKey: 'private',
      publicKey: 'public',
      expiresIn: '15m',
      refreshTokenExpiresIn: '7d',
      signOptions: { audience: 'audience', issuer: 'issuer' },
      verifyOptions: {
        audience: 'audience',
        issuer: 'issuer',
        algorithms: ['RS256'],
      },
    };
    const adapter = new JwtTokenServiceAdapter(
      jwtService as never,
      config as never,
    );

    await adapter.generateAccessToken({
      userId: 'id',
      username: 'ana',
      email: 'ana@example.com',
    });
    await adapter.generateRefreshToken('id');
    await expect(adapter.verify('token')).resolves.toEqual({
      sub: 'user-id',
      tokenType: 'refresh',
    });

    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ tokenType: 'access' }),
      expect.objectContaining({ privateKey: 'private', algorithm: 'RS256' }),
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ tokenType: 'refresh' }),
      expect.objectContaining({ expiresIn: '7d' }),
    );
    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'token',
      expect.objectContaining({ publicKey: 'public' }),
    );
  });
});
