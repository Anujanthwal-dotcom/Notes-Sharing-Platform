import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import NodeClam from 'clamscan'; // Using standard import based on your types
import { Readable } from 'stream';

@Injectable()
export class ScannerService implements OnModuleInit {
  private clamscan: NodeClam; // We can now use the actual type
  private readonly logger = new Logger(ScannerService.name);

  async onModuleInit() {
    await this.initializeScanner();
  }

  private async initializeScanner(retries = 5) {
    try {
      const scanner = new NodeClam();

      this.clamscan = await scanner.init({
        clamdscan: {
          host: process.env.CLAMSCAN_HOST || 'localhost',
          port: Number(process.env.CLAMSCAN_PORT) || 3310,
          timeout: 60000,
          active: true, // Crucial: forces it to use the TCP connection
        },
        preference: 'clamdscan', // Crucial: Prevents it from looking for a local installation
        debugMode: false,
      });

      this.logger.log('🛡️ Virus Scanner (ClamAV) Connected via TCP Socket');
    } catch (err) {
      if (retries > 0) {
        this.logger.warn(`⚠️ ClamAV not ready. Retrying in 10s...`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        await this.initializeScanner(retries - 1);
      }
      this.logger.error('❌ Failed to connect to ClamAV.', err);
    }
  }

  /**
   * Safely converts the Multer Buffer into a Readable stream and scans it
   */
  async scanBuffer(fileBuffer: Buffer, fileName: string): Promise<void> {
    if (!this.clamscan) {
      throw new InternalServerErrorException('Scanner service is offline');
    }

    this.logger.log(`Scanning file: ${fileName}...`);

    // The modern Node.js way to convert a Buffer to a Stream
    const stream = Readable.from(fileBuffer);

    try {
      // Pass the stream directly to the method defined in your d.ts file
      const result = await this.clamscan.scanStream(stream);

      if (result.isInfected) {
        this.logger.error(
          `🚨 MALWARE DETECTED in ${fileName}: ${result.viruses.join(', ')}`,
        );
        throw new BadRequestException(
          'File rejected: Security threat detected.',
        );
      }

      this.logger.log(`✅ File ${fileName} is clean.`);
    } catch (error) {
      // If the error is our BadRequestException, pass it through
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Otherwise, log the actual failure (e.g., TCP connection dropped)
      this.logger.error(`Scan failed to execute for ${fileName}`, error);
      throw new InternalServerErrorException('Security scan failed to process');
    }
  }
}
