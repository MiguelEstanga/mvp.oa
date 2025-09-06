import {   Injectable } from "@nestjs/common";

@Injectable()
export class TestService {
  constructor() {}

  getHello(): string {
    return "Hello World";
  }
}