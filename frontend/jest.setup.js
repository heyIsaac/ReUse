import '@testing-library/react-native';

// Configurar variáveis de ambiente para testes
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:5000/api';
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'test-google-client-id';

jest.mock('expo-router', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };
  return {
    useRouter: jest.fn(() => mockRouter),
    useLocalSearchParams: jest.fn(() => ({})),
    router: mockRouter,
  };
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock('react-native-fbsdk-next', () => ({
  LoginManager: {
    logInWithPermissions: jest.fn(),
    logOut: jest.fn(),
  },
  AccessToken: {
    getCurrentAccessToken: jest.fn(),
  },
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      signInWithOtp: jest.fn(),
      signInWithIdToken: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  })),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
  })
);
