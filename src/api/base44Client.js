import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication disabled for testing
export const base44 = createClient({
  appId: "68b1b9862c37f285431f9966", 
  requiresAuth: false // Temporarily disable authentication for Gemini testing
});
