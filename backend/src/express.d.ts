import { JWTPayload } from "./utils/dataTypes.ts";

declare module "express-serve-static-core" {
	interface Request {
		user?: JWTPayload;
	}
}
