import { ConfigContext, ExpoConfig } from 'expo/config';
import 'dotenv/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'EasyMedPro Mobile',
  slug: 'easymedpro-mobile',
  extra: {
    apiUrl: process.env.API_URL || 'http://localhost:3000',
  },
});
