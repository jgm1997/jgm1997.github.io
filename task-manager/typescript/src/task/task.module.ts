import { Module } from "@nestjs/common";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { TagService } from "src/tag/tag.service";

@Module({
    controllers: [TaskController],
    providers: [TaskService, TagService],
    exports: [TaskService],
})
export class TaskModule {}