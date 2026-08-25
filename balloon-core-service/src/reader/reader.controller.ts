import { Body, Controller, UseGuards, Request, Patch } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { EventPattern } from "@nestjs/microservices";
import { UserQueueDto } from "./dtos/request/user-queue.dto";
import { ReaderService } from "./reader.service";
import { CreateReaderDto } from "./dtos/request/create-reader.dto";
import { RequestReaderDto } from "./dtos/request/request-reader.dto";

@Controller('readers')
export class ReaderController {

  constructor(private readonly readerService: ReaderService) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch('create')
  async createReader(
    @Request() req: any,
    @Body() requestReaderDto: RequestReaderDto): Promise<any> {

    const { sub, email, username } = req.user;
    
    const createReaderDto: CreateReaderDto = {
      userId: sub,
      email,
      username,
      ...requestReaderDto,
    };

    return this.readerService.createReader(createReaderDto);
  }  
  
}