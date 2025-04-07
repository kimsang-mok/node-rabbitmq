import { Request, Response } from "express";
import Controller from "../../configs/controller";
import homeService, { HomeService } from "./home.service";

export class HomeController extends Controller {
  constructor(private service: HomeService) {
    super();
  }
  sayHello = Controller.catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.sayHello();

    this.ok(res, result);
  });
}

export default new HomeController(homeService);
