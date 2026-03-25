import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ListingOwner {
  id: string;
  name: string | null;
  profilePictureUrl: string | null;
}

export interface Listing {
  id: number;
  title: string;
  category: string;
  condition: string;
  description: string;
  images: string[];
  createdAt: string;
  owner: ListingOwner;
}

export interface CreateListingData {
  title: string;
  category: string;
  condition: string;
  description: string;
  images: string[]; // Cloudinary secure_url strings
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Fetches the public feed (most recent desapegos first). */
export function useGetListings(page = 1) {
  return useQuery<Listing[]>({
    queryKey: ['listings', page],
    queryFn: async () => {
      const { data } = await api.get<Listing[]>('/listings', {
        params: { page, pageSize: 20 },
      });
      return data;
    },
    staleTime: 30_000, // consider data fresh for 30 s
  });
}

/** Publishes a new desapego. Expects pre-uploaded Cloudinary URLs in `images`. */
export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateListingData) => {
      const response = await api.post('/listings', data);
      return response.data;
    },
    onSuccess: () => {
      // Refresh the feed after a successful publish
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

