'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
} from '@nextui-org/react';
import { useState } from 'react';

export default function ChallengeSubmission({
  challenge,
  isOpen,
  onOpenChange,
}) {
  const [flag, setFlag] = useState('');

  const handleSubmit = () => {
    // Implement flag submission logic
    console.log('Submitted flag:', flag);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Submit Flag for {challenge.title}</ModalHeader>
            <ModalBody>
              <Input
                label='Flag'
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder='Enter the flag'
              />
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={onClose}>
                Cancel
              </Button>
              <Button color='primary' onPress={handleSubmit}>
                Submit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
