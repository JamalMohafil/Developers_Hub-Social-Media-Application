import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises'; // ⬅️ استخدام promises هنا

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  async transform(image: Express.Multer.File): Promise<string> {
    if (!image || image === undefined) {
      return '';
    }

    const originalNameWithoutFormat = path.parse(image.originalname).name;
    const fileName = `${Date.now()}-${originalNameWithoutFormat}.webp`;
    const outputPath = path.join('uploads', fileName);

    try {
      await sharp(image.path)
        .resize(800)
        .webp({ effort: 3 })
        .toFile(outputPath);

      // انتظر الملف يتم تحريره ثم احذفه بشكل آمن
      setTimeout(async () => {
        try {
          await fs.unlink(image.path);
        } catch (err) {
          console.error('Failed to delete original image:', err);
        }
      }, 200); // تأخير صغير يساعد على تجنب EBUSY

      return fileName;
    } catch (error) {
      console.error('Sharp processing error:', error);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }
}
