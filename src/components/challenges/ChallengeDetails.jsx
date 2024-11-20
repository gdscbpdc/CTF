'use client';

import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Button,
  Tabs,
  Tab,
  useDisclosure,
} from '@nextui-org/react';
import { Code, FileText, Download } from 'lucide-react';
import {
  getChallengeAttachments,
  downloadAttachment,
} from '@/lib/challenge-attachments';
import ChallengeSubmission from './ChallengeSubmission';

export default function ChallengeDetails({ challenge }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const attachments = getChallengeAttachments(challenge.id);

  return (
    <div className='grid md:grid-cols-2 gap-8'>
      <Card>
        <CardHeader className='flex justify-between'>
          <h2 className='text-2xl font-bold'>{challenge.title}</h2>
          <div className='flex gap-2'>
            <Chip color='primary' variant='flat'>
              {challenge.points} pts
            </Chip>
            <Chip color='secondary' variant='dot'>
              {challenge.category}
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <Tabs>
            <Tab
              key='description'
              title={
                <div className='flex items-center space-x-2'>
                  <FileText size={16} />
                  <span>Description</span>
                </div>
              }
            >
              {challenge.fullDescription}
            </Tab>
            <Tab
              key='attachments'
              title={
                <div className='flex items-center space-x-2'>
                  <Code size={16} />
                  <span>Attachments</span>
                </div>
              }
            >
              {attachments.length > 0 ? (
                <div className='space-y-2'>
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className='flex justify-between items-center p-2 bg-default-100 rounded'
                    >
                      <span>{attachment.name}</span>
                      <Button
                        size='sm'
                        variant='light'
                        startContent={<Download size={16} />}
                        onClick={() => downloadAttachment(attachment)}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-default-500'>
                  No attachments for this challenge
                </p>
              )}
            </Tab>
          </Tabs>
          <Button color='primary' className='mt-4' onPress={onOpen}>
            Submit Flag
          </Button>
        </CardBody>
      </Card>

      <ChallengeSubmission
        challenge={challenge}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </div>
  );
}
