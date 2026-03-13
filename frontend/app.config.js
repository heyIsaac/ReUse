export default ({ config }) => {
  return {
    ...config,
    plugins: [
      ...config.plugins,
      [
        "react-native-fbsdk-next",
        {
          appID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
          clientToken: process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN,
          displayName: "ReUse",
          scheme: "fb" + process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
          advertiserIDCollectionEnabled: false,
          autoLogAppEventsEnabled: false,
          isAutoInitEnabled: true
        }
      ]
    ],
    edgeToEdge: true,
  };
};
