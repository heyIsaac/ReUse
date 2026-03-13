import * as Network from 'expo-network';

export function useNetworkCheck(showToast?: (msg: string, type: 'error' | 'warning' | 'success') => void) {
  const checkConnectionAsync = async () => {
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected || networkState.isInternetReachable === false) {
      if (showToast) {
        showToast('⚠️ Sem conexão com a internet.', 'warning');
      }
      return false;
    }
    return true;
  };

  return { checkConnectionAsync };
}
