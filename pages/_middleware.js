import jwt from 'jsonwebtoken';
import { NextResponse } from "next/server";

const HOST = 'http://localhost:3000';

export async function middleware(req, event) {
  if (!req.url.includes('api')) {
    try {
      await jwt.verify(req.cookies?.token || '', process.env.JWT_SALT);

      if (req.url.includes(`${HOST}/login`)) {
        return NextResponse.redirect(`${HOST}/`);
      }
    } catch (e) {
      if (!req.url.includes(`${HOST}/login`)) {
        return NextResponse.redirect(`${HOST}/login`);
      }
    }
  }

  return NextResponse.next();
}