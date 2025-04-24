import { Request, Response } from "express";
import { permissionRepo } from "../../../config/repositories.js";
import { Not } from "typeorm";

export const getAllPermissions = async (req: Request, res: Response) => {
	const permissions = await permissionRepo.find({
        where: {
            action: Not("access admin dashboard")
        }
    });

	res.status(200).json(permissions);
};
