import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";

const logger = (req: Request, res: Response, next: NextFunction) => {
  const log = `[${new Date().toISOString()}], [${req.method}], [${req.ip}] , [${
    req.path
  }] \n`;

  fs.appendFileSync(path.join(process.cwd(), "log.txt"), log, "utf8");

  next();
};

export default logger;
