import { PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateTagDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    descriiption?: string;

    @IsOptional()
    @IsString()
    color?: string; // #RRGGBB
}

export class UpdateTagDto extends PartialType(CreateTagDto) { }