import app from './app.js';

// Vercel's Node runtime can invoke the exported function directly.
// Express apps are callable as functions, so forward the request.
export default function handler(req, res) {
	return app(req, res);
}
