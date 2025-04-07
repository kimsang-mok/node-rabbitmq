import express from "express";
import homeRouter from "./src/modules/home/home.route";

const router = express.Router();

const routes = [
  {
    path: "/home",
    route: homeRouter,
  },
];

// iterate over the defaultRoutes array and apply each route to the router
routes.forEach((each) => {
  router.use(each.path, each.route);
});

export default router;
