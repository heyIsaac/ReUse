import { getPublicUrl, uploadImages } from '@/src/services/supabaseStorage';
import { supabase } from '@/src/services/supabase';

jest.mock('@/src/services/supabase');

describe('Supabase Storage', () => {
  describe('getPublicUrl', () => {
    it('deve retornar URL completa se já for URL', () => {
      const url = 'https://example.com/image.jpg';
      expect(getPublicUrl(url)).toBe(url);
    });

    it('deve gerar URL pública para path relativo', () => {
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://supabase.co/storage/v1/object/public/listings/test.jpg' },
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        getPublicUrl: mockGetPublicUrl,
      });

      const result = getPublicUrl('test.jpg');

      expect(result).toBe('https://supabase.co/storage/v1/object/public/listings/test.jpg');
      expect(supabase.storage.from).toHaveBeenCalledWith('listings');
    });

    it('deve gerar URL com transformação de tamanho', () => {
      const mockUrl = 'https://supabase.co/storage/v1/render/image/public/listings/test.jpg?width=100&height=100&resize=cover';
      
      const result = getPublicUrl('test.jpg', 100, 100);

      expect(result).toContain('width=100');
      expect(result).toContain('height=100');
      expect(result).toContain('resize=cover');
    });

    it('deve retornar string vazia se path for vazio', () => {
      expect(getPublicUrl('')).toBe('');
    });
  });

  describe('uploadImages', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          blob: () => Promise.resolve(new Blob()),
        })
      ) as jest.Mock;
    });

    it('deve fazer upload de múltiplas imagens', async () => {
      const mockUpload = jest.fn().mockResolvedValue({ error: null });
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://supabase.co/storage/image.jpg' },
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const uris = ['file:///local/image1.jpg', 'file:///local/image2.jpg'];
      const result = await uploadImages(uris);

      expect(result).toHaveLength(2);
      expect(mockUpload).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('deve lançar erro se upload falhar', async () => {
      const mockUpload = jest.fn().mockResolvedValue({
        error: { message: 'Erro de upload' },
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
      });

      await expect(uploadImages(['file:///local/image.jpg'])).rejects.toThrow(
        'Upload falhou: Erro de upload'
      );
    });

    it('deve gerar nomes de arquivo únicos', async () => {
      const mockUpload = jest.fn().mockResolvedValue({ error: null });
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://supabase.co/storage/image.jpg' },
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      await uploadImages(['file:///local/image.jpg']);

      const uploadCall = mockUpload.mock.calls[0];
      const fileName = uploadCall[0];

      expect(fileName).toMatch(/^\d+_[a-z0-9]+\.jpg$/);
    });
  });
});
