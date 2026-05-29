// Vercel Serverless entry — Vercel invokes this default export per request.
// All it does is delegate to our Express app (dev: source, prod: compiled output).

export default async function handler(req, res) {
  try {
    res.setHeader('Content-Type', 'application/json');

    const { default: app } =
      process.env.NODE_ENV === 'production'
        ? await import('../dist-server/server/index.js')
        : await import('../server/index.js');

    return app(req, res);
  } catch (error) {
    console.error('Vercel handler error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      });
    }
  }
}
