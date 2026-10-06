import express from 'express';
import { createServer as createViteServer } from 'vite';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Helper to run python script via stdin/stdout
  const runPythonEngine = (flag: '--predict' | '--train', payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const py = spawn('python3', [path.join(__dirname, 'ai_engine.py'), flag]);
      let stdout = '';
      let stderr = '';

      py.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      py.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      py.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        }
        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse Python JSON output: ${stdout} (${e})`));
        }
      });

      py.stdin.write(JSON.stringify(payload));
      py.stdin.end();
    });
  };

  // API Route: Predict computer move and compute game round
  app.post('/api/predict', async (req, res) => {
    try {
      const { history = [], modelType = 'markov' } = req.body;
      const result = await runPythonEngine('--predict', { history, modelType });
      res.json({ ok: true, data: result });
    } catch (err: any) {
      console.error('Error in /api/predict:', err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // API Route: Train model on custom persona and rounds
  app.post('/api/train', async (req, res) => {
    try {
      const { persona = 'wsls_human', rounds = 50 } = req.body;
      const result = await runPythonEngine('--train', { persona, rounds });
      res.json({ ok: true, data: result });
    } catch (err: any) {
      console.error('Error in /api/train:', err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // API Route: Fetch Python source codes for inspection
  app.get('/api/python-code', (req, res) => {
    try {
      const enginePath = path.join(__dirname, 'ai_engine.py');
      const gamePath = path.join(__dirname, 'rps_game.py');

      const engineCode = fs.existsSync(enginePath) ? fs.readFileSync(enginePath, 'utf-8') : '';
      const gameCode = fs.existsSync(gamePath) ? fs.readFileSync(gamePath, 'utf-8') : '';

      res.json({
        ok: true,
        files: [
          { name: 'ai_engine.py', description: 'Core Python Markov & WSLS Machine Learning Engine', code: engineCode },
          { name: 'rps_game.py', description: 'Standalone Terminal Rock, Paper, Scissors Game (CLI)', code: gameCode }
        ]
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ ok: true, engine: 'python3', time: new Date().toISOString() });
  });

  // Vite middleware in dev, static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (Python AI Engine integrated)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
