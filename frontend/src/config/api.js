// Central API config
// Uses environment variable set in hosting platform (Vercel/Netlify)
// Example: VITE_API_BASE_URL=https://project-bca-production.up.railway.app

const PRODUCTION_API_URL = import.meta.env.VITE_API_BASE_URL;

if (!PRODUCTION_API_URL) {
	// eslint-disable-next-line no-console
	console.warn('VITE_API_BASE_URL is not set. Configure it on your hosting provider.');
}

const API_CONFIG = {
	BASE_URL: PRODUCTION_API_URL,
	ENDPOINTS: {
		TRENDING_POSTS: '/api/posts/trending/',
	},
};

export default API_CONFIG;

export function apiUrl(endpoint) {
	return `${API_CONFIG.BASE_URL}${endpoint}`;
}
