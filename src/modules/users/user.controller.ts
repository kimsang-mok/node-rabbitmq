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

  createUserWith5sDelay = Controller.catchAsync(
    async (req: Request, res: Response) => {
      const result = await this.service.createUserWith5sDelay(req.body);
      this.created(res, result);
    }
  );

  createUserWithDynamicDelay = Controller.catchAsync(
    async (req: Request, res: Response) => {
      const result = await this.service.createUserWithDynamicDelay(
        req.body,
        req.body.delayMs
      );
      this.created(res, result);
    }
  );
}

export default new UserController(userService);
