import { Request, Response, NextFunction } from 'express';

export function debug429Middleware(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  
  res.json = function(body: any) {
    if (res.statusCode === 429) {
      console.log('=== 429 ERROR TRIGGERED ===');
      console.log('Path:', req.path);
      console.log('Method:', req.method);
      console.log('User:', (req as any).user?.email || 'anonymous');
      console.log('Body:', body);
      console.log('Query:', req.query);
      console.log('Files:', (req as any).files?.length || 0);
      console.log('========================');
    }
    return originalJson(body);
  };
  
  next();
}