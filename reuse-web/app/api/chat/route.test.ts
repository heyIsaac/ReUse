import { expect, test, vi } from 'vitest';
import { POST } from './route';

// Mock auth module
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}));

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    listing: {
      findMany: vi.fn(),
    },
    favorite: {
      findMany: vi.fn(),
    }
  }
}));

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

test('Missing message returns 400', async () => {
  const req = new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  const res = await POST(req);
  expect(res.status).toBe(400);
});

test('consultar_meus_anuncios requires login', async () => {
  const req = new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: 'meus anúncios' }),
  });
  
  (requireAuth as any).mockResolvedValueOnce(null);

  const res = await POST(req);
  const data = await res.json();
  
  expect(data.response).toContain('precisa estar logado');
});

test('consultar_meus_anuncios success', async () => {
  const req = new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: 'meus produtos' }),
  });
  
  (requireAuth as any).mockResolvedValueOnce({ id: 'user123' });
  (prisma.listing.findMany as any).mockResolvedValueOnce([
    { id: 1, title: 'Bicicleta', price: 200 }
  ]);

  const res = await POST(req);
  const data = await res.json();
  
  expect(data.response).toContain('Você possui 1 anúncio(s)');
  expect(data.response).toContain('Bicicleta');
});

test('ajuda_geral fallback works', async () => {
  const req = new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: 'Como funciona?' }),
  });
  
  const res = await POST(req);
  const data = await res.json();
  
  expect(data.response).toContain('Bem-vindo à ajuda do ReUse');
});
