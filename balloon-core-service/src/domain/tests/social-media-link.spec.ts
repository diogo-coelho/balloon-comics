import { SocialMediaLink } from '../social-media-link/entities/social-media-link';
import { SocialMediaTypeEnum } from '../social-media-link/enums/social-media-type.enum';

describe('SocialMediaLink', () => {
  it('deve criar link com dados iniciais e datas do momento atual', () => {
    const now = new Date('2026-09-17T10:00:00.000Z');
    const link = new SocialMediaLink(
      'link-id',
      'reader-id',
      SocialMediaTypeEnum.INSTAGRAM,
      'https://instagram.com/ana',
      now,
      now,
    );

    expect(link.id).toBe('link-id');
    expect(link.readerId).toBe('reader-id');
    expect(link.name).toBe(SocialMediaTypeEnum.INSTAGRAM);
    expect(link.url).toBe('https://instagram.com/ana');
  });

  it('deve atualizar a URL do link e a data de atualização', () => {
    const initialDate = new Date('2026-09-17T08:00:00.000Z');
    const link = new SocialMediaLink(
      'link-id',
      'reader-id',
      SocialMediaTypeEnum.INSTAGRAM,
      'https://old.example.com',
      initialDate,
      initialDate,
    );

    link.updateUrl('https://new.example.com');

    expect(link.url).toBe('https://new.example.com');
    expect(link.updatedAt.getTime()).toBeGreaterThan(initialDate.getTime());
  });
});
