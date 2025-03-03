import { createUploadthing } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  challengeAttachment: f({
    pdf: { maxFileSize: '4MB' },
    image: { maxFileSize: '4MB' },
    text: { maxFileSize: '4MB' },
    'application/zip': { maxFileSize: '4MB' },
    'application/x-zip-compressed': { maxFileSize: '4MB' },
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
      return { name: file.name, url: file.ufsUrl };
    }),
};
