import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(StorageService.name);
  private readonly bucketName = process.env.BUCKET;

  constructor() {
    this.s3Client = new S3Client({
      // Use localhost because NestJS is running on your host machine
      endpoint: 'http://localhost:9000',
      region: 'us-east-1', // Required by SDK, but ignored by MinIO
      credentials: {
        accessKeyId: 'admin', // From your docker-compose
        secretAccessKey: 'password123',
      },
      forcePathStyle: true, // Crucial for MinIO compatibility
    });
  }

  /**
   * Uploads a file buffer to MinIO
   * Returns the 'key' (path) to be stored in Postgres
   */
  async upload(file: Express.Multer.File, userId: number): Promise<string> {
    const fileKey = `${userId}/${Date.now()}-${file.originalname}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);
      this.logger.log(`Uploaded: ${fileKey}`);
      return fileKey;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error('MinIO Upload Error', error.stack);
      throw new InternalServerErrorException(
        'Failed to upload file to storage',
      );
    }
  }

  /**
   * Retrieves a file from MinIO as a readable stream
   */
  async getFileStream(fileKey: string): Promise<Readable> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const response = await this.s3Client.send(command);

      // The Body is returned as a stream in the AWS SDK v3
      return response.Body as Readable;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Error fetching file: ${fileKey}`, error.stack);
      throw new InternalServerErrorException(
        'Could not retrieve file from storage',
      );
    }
  }

  async emptyBucket(): Promise<void> {
    try {
      let isTruncated: boolean | undefined = true;
      let continuationToken: string | undefined = undefined;

      // Loop to handle buckets with more than 1000 items
      while (isTruncated) {
        const listCommand = new ListObjectsV2Command({
          Bucket: this.bucketName,
          ContinuationToken: continuationToken,
        });

        const listResponse: ListObjectsV2CommandOutput =
          await this.s3Client.send(listCommand);

        // If the bucket is empty, we can exit early
        if (!listResponse.Contents || listResponse.Contents.length === 0) {
          this.logger.log(`Bucket '${this.bucketName}' is already empty.`);
          return;
        }

        // Map the listed objects into the structure required for deletion
        const objectsToDelete = listResponse.Contents.map((item) => ({
          Key: item.Key,
        }));

        const deleteCommand = new DeleteObjectsCommand({
          Bucket: this.bucketName,
          Delete: {
            Objects: objectsToDelete,
            // Quiet mode false returns the list of deleted objects
            Quiet: true,
          },
        });

        await this.s3Client.send(deleteCommand);
        this.logger.log(
          `Deleted a batch of ${objectsToDelete.length} objects.`,
        );

        // Update loop variables for the next batch (if any)
        isTruncated = listResponse.IsTruncated;
        continuationToken = listResponse.NextContinuationToken;
      }

      this.logger.log(`Bucket '${this.bucketName}' successfully emptied.`);
    } catch (error) {
      this.logger.error(
        `Error emptying bucket '${this.bucketName}'`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw new InternalServerErrorException(
        'Could not empty the storage bucket',
      );
    }
  }
}
