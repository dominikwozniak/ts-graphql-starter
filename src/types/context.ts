import { Request, Response } from 'express';

interface Context {
  req: Request;
  res: Response;
  userId: string | null;
}

export default Context;
