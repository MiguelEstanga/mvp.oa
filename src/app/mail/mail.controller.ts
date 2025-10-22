import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendEmailDto } from './dto/SendEmailDto';
 
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

   
   
}