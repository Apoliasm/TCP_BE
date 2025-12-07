// listing-images/listing-images.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ListingImagesService } from './listing-image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateListingImageDto } from './dto/listing-image.dto';
import { ListingImageResponseDto } from './dto/listing-image.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import type { Express } from 'express';
@ApiTags('listing-images')
@Controller('listing-images')
export class ListingImagesController {
  constructor(private readonly listingImagesService: ListingImagesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + ext);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Listing 이미지 업로드',
    schema: {
      type: 'object',
      properties: {
        listingId: { type: 'number' },
        order: { type: 'number' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['order', 'file'],
    },
  })
  @ApiOkResponse({ type: ListingImageResponseDto })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateListingImageDto,
  ): Promise<ListingImageResponseDto> {
    const imageUrl = `/uploads/${file.filename}`; // 정적 서빙 기준 경로

    return this.listingImagesService.create(
      {
        order: body.order,
      },
      imageUrl,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'imageId로 단일 이미지 조회',
  })
  @ApiOkResponse({
    type: ListingImageResponseDto,
  })
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ListingImageResponseDto> {
    return this.listingImagesService.getById(id);
  }

  @Get('listing/:listingId')
  @ApiOkResponse({ type: [ListingImageResponseDto] })
  async findByListing(
    @Param('listingId', ParseIntPipe) listingId: number,
  ): Promise<ListingImageResponseDto[]> {
    return this.listingImagesService.findByListing(listingId);
  }
}
