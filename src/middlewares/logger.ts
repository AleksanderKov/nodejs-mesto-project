import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const requestLogStream = fs.createWriteStream(
  path.join(logDir, 'request.log'),
  { flags: 'a' },
);

const errorLogStream = fs.createWriteStream(
  path.join(logDir, 'error.log'),
  { flags: 'a' },
);

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    const logEntry = JSON.stringify({
      time: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      query: req.query,
      body: req.body,
    });

    try {
      requestLogStream.write(`${logEntry}\n`);
    } catch (writeErr) {
      console.error('Ошибка при логировании запроса:', writeErr);
    }
  });

  next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const logEntry = JSON.stringify({
    time: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  try {
    errorLogStream.write(`${logEntry}\n`);
  } catch (writeErr) {
    console.error('Ошибка при логировании ошибки:', writeErr);
  }

  next(err);
};
