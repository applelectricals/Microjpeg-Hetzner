import { Request, Response, NextFunction } from 'express';
import { tierLimitService } from '../services/TierLimitService';

declare global {
  namespace Express {
    interface Request {
      tierLimits?: any;
      userTier?: string;
    }
  }
}

export async function attachTierLimits(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let tierName = 'free';
    
    if (req.user && (req.user as any).tier) {
      tierName = (req.user as any).tier;
    }

    const limits = await tierLimitService.getTierLimits(tierName);
    
    req.tierLimits = limits;
    req.userTier = tierName;

    next();
  } catch (error) {
    console.error('Error attaching tier limits:', error);
    next();
  }
}

export function requireTier(minTier: string) {
  const tierLevels: Record<string, number> = {
    'free': 0,
    'starter': 1,
    'pro': 2,
    'business': 3
  };

  return (req: Request, res: Response, next: NextFunction) => {
    const userLevel = tierLevels[req.userTier || 'free'];
    const requiredLevel = tierLevels[minTier];

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Insufficient tier',
        message: `This feature requires ${minTier} tier or higher`,
        currentTier: req.userTier
      });
    }

    next();
  };
}