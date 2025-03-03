import { createUploadthing } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  challengeAttachment: f({
    pdf: { maxFileSize: '4MB', maxFileCount: 10 },
    image: { maxFileSize: '4MB', maxFileCount: 10 },
    text: { maxFileSize: '4MB', maxFileCount: 10 },
    'application/zip': { maxFileSize: '4MB', maxFileCount: 10 },
    'application/x-zip-compressed': { maxFileSize: '4MB', maxFileCount: 10 },
  })
    .middleware(async () => {
      try {
        return { userId: 'admin' };
      } catch (error) {
        console.error('Error in middleware:', error);
        throw new UploadThingError('Unauthorized');
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete:', file);
      return { name: file.name, url: file.ufsUrl };
    }),
};
