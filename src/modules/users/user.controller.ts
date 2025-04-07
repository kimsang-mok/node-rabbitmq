import { Request, Response } from "express";
import Controller from "@src/configs/controller";
import userService, { UserService } from "./user.service";

export class UserController extends Controller {
  constructor(private service: UserService) {
    super();
  }

  createUser = Controller.catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.createUser(req.body);
    this.created(res, result);
  });
}

export default new UserController(userService);
