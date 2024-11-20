'use client';

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { useState } from 'react';
import { CHALLENGE_CATEGORIES, CHALLENGE_DIFFICULTIES } from '@/lib/constants';

export default function ChallengeManager() {
  const [challenges, setChallenges] = useState([
    {
      id: '1',
      title: 'Basic Injection',
      category: 'Web',
      difficulty: 'Easy',
      points: 100,
      flag: 'GDGUAE{h4ck3r_1n_tr41n1ng}',
    },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    category: '',
    difficulty: '',
    points: 0,
    flag: '',
  });

  const handleCreateChallenge = () => {
    setChallenges([
      ...challenges,
      {
        ...newChallenge,
        id: Math.random().toString(36).substr(2, 9),
      },
    ]);
    setIsCreateModalOpen(false);
    setNewChallenge({
      title: '',
      category: '',
      difficulty: '',
      points: 0,
      flag: '',
    });
  };

  return (
    <>
      <Button
        color='primary'
        className='mb-4'
        onClick={() => setIsCreateModalOpen(true)}
      >
        Create Challenge
      </Button>

      <Table>
        <TableHeader>
          <TableColumn>Title</TableColumn>
          <TableColumn>Category</TableColumn>
          <TableColumn>Difficulty</TableColumn>
          <TableColumn>Points</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {challenges.map((challenge) => (
            <TableRow key={challenge.id}>
              <TableCell>{challenge.title}</TableCell>
              <TableCell>{challenge.category}</TableCell>
              <TableCell>{challenge.difficulty}</TableCell>
              <TableCell>{challenge.points}</TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button size='sm' color='secondary'>
                    Edit
                  </Button>
                  <Button size='sm' color='danger'>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={isCreateModalOpen}
        onOpenChange={() => setIsCreateModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Create New Challenge</ModalHeader>
          <ModalBody>
            <Input
              label='Title'
              value={newChallenge.title}
              onChange={(e) =>
                setNewChallenge({
                  ...newChallenge,
                  title: e.target.value,
                })
              }
            />
            <Select
              label='Category'
              value={newChallenge.category}
              onChange={(e) =>
                setNewChallenge({
                  ...newChallenge,
                  category: e.target.value,
                })
              }
            >
              {CHALLENGE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </Select>
            <Select
              label='Difficulty'
              value={newChallenge.difficulty}
              onChange={(e) =>
                setNewChallenge({
                  ...newChallenge,
                  difficulty: e.target.value,
                })
              }
            >
              {CHALLENGE_DIFFICULTIES.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </Select>
            <Input
              label='Points'
              type='number'
              value={newChallenge.points}
              onChange={(e) =>
                setNewChallenge({
                  ...newChallenge,
                  points: parseInt(e.target.value),
                })
              }
            />
            <Input
              label='Flag'
              value={newChallenge.flag}
              onChange={(e) =>
                setNewChallenge({
                  ...newChallenge,
                  flag: e.target.value,
                })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color='danger'
              variant='light'
              onPress={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color='primary' onPress={handleCreateChallenge}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
