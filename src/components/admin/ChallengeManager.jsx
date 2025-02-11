'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Textarea,
} from '@nextui-org/react';
import { Search, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { db } from '@/services/firebase.config';
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  where,
} from 'firebase/firestore';

const CATEGORIES = [
  'Web',
  'Crypto',
  'Forensics',
  'Reversing',
  'Misc',
  'Prompt Engineering',
];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function ChallengeManager() {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    difficulty: '',
    points: '',
    shortDescription: '',
    description: '',
    flag: '',
    attachments: '',
    hints: '',
  });

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [searchQuery, challenges]);

  const loadChallenges = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, 'challenges'), orderBy('title'));
      const snapshot = await getDocs(q);

      const challengesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChallenges(challengesData);
      setFilteredChallenges(challengesData);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterChallenges = () => {
    const filtered = challenges.filter(
      (challenge) =>
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChallenges(filtered);
  };

  const handleAdd = () => {
    setSelectedChallenge(null);
    setEditMode(false);
    setFormData({
      title: '',
      category: '',
      difficulty: '',
      points: '',
      shortDescription: '',
      description: '',
      flag: '',
      attachments: '',
      hints: '',
    });
    onOpen();
  };

  const handleEdit = (challenge) => {
    setSelectedChallenge(challenge);
    setEditMode(true);
    setFormData({
      title: challenge.title,
      category: challenge.category,
      difficulty: challenge.difficulty,
      points: challenge.points.toString(),
      shortDescription: challenge.shortDescription,
      description: challenge.description,
      flag: challenge.flag,
      attachments: challenge.attachments
        ? challenge.attachments.join('\n')
        : '',
      hints: challenge.hints ? challenge.hints.join('\n') : '',
    });
    onOpen();
  };

  const handleView = (challenge) => {
    setSelectedChallenge(challenge);
    setEditMode(false);
    setFormData({
      title: challenge.title,
      category: challenge.category,
      difficulty: challenge.difficulty,
      points: challenge.points.toString(),
      shortDescription: challenge.shortDescription,
      description: challenge.description,
      flag: challenge.flag,
      attachments: challenge.attachments
        ? challenge.attachments.join('\n')
        : '',
      hints: challenge.hints ? challenge.hints.join('\n') : '',
    });
    onOpen();
  };

  const handleDelete = async (challengeId) => {
    if (confirm('Are you sure you want to delete this challenge?')) {
      try {
        await deleteDoc(doc(db, 'challenges', challengeId));
        await loadChallenges();
      } catch (error) {
        console.error('Error deleting challenge:', error);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const challengeData = {
        title: formData.title,
        category: formData.category,
        difficulty: formData.difficulty,
        points: parseInt(formData.points),
        shortDescription: formData.shortDescription,
        description: formData.description,
        flag: formData.flag,
        attachments: formData.attachments.split('\n').filter(Boolean),
        hints: formData.hints.split('\n').filter(Boolean),
      };

      if (editMode && selectedChallenge) {
        await updateDoc(
          doc(db, 'challenges', selectedChallenge.id),
          challengeData
        );
      } else {
        await addDoc(collection(db, 'challenges'), challengeData);
      }

      onClose();
      await loadChallenges();
    } catch (error) {
      console.error('Error saving challenge:', error);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <Input
          isClearable
          className='w-full sm:max-w-[44%]'
          placeholder='Search challenges...'
          startContent={<Search className='w-4 h-4 text-default-400' />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          color='primary'
          startContent={<Plus className='w-4 h-4' />}
          onPress={handleAdd}
        >
          Add Challenge
        </Button>
      </div>

      <Table aria-label='Challenges table'>
        <TableHeader>
          <TableColumn>TITLE</TableColumn>
          <TableColumn>CATEGORY</TableColumn>
          <TableColumn>DIFFICULTY</TableColumn>
          <TableColumn>POINTS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={filteredChallenges}
          isLoading={isLoading}
          loadingContent={<div>Loading challenges...</div>}
        >
          {(challenge) => (
            <TableRow key={challenge.id}>
              <TableCell>{challenge.title}</TableCell>
              <TableCell>
                <Chip variant='flat'>{challenge.category}</Chip>
              </TableCell>
              <TableCell>
                <Chip
                  color={
                    challenge.difficulty === 'Easy'
                      ? 'success'
                      : challenge.difficulty === 'Medium'
                      ? 'warning'
                      : 'danger'
                  }
                  variant='flat'
                >
                  {challenge.difficulty}
                </Chip>
              </TableCell>
              <TableCell>{challenge.points}</TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button
                    isIconOnly
                    variant='light'
                    onPress={() => handleView(challenge)}
                  >
                    <Eye className='w-4 h-4' />
                  </Button>
                  <Button
                    isIconOnly
                    variant='light'
                    onPress={() => handleEdit(challenge)}
                  >
                    <Pencil className='w-4 h-4' />
                  </Button>
                  <Button
                    isIconOnly
                    variant='light'
                    color='danger'
                    onPress={() => handleDelete(challenge.id)}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        size='3xl'
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior='inside'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editMode
                  ? 'Edit Challenge'
                  : selectedChallenge
                  ? 'View Challenge'
                  : 'Add Challenge'}
              </ModalHeader>
              <ModalBody>
                <div className='grid grid-cols-2 gap-4'>
                  <Input
                    label='Title'
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    isReadOnly={!editMode && selectedChallenge}
                  />
                  <Input
                    label='Points'
                    type='number'
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({ ...formData, points: e.target.value })
                    }
                    isReadOnly={!editMode && selectedChallenge}
                  />
                  <Select
                    label='Category'
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    isDisabled={!editMode && selectedChallenge}
                  >
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label='Difficulty'
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    isDisabled={!editMode && selectedChallenge}
                  >
                    {DIFFICULTIES.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <Input
                  label='Short Description'
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  isReadOnly={!editMode && selectedChallenge}
                />
                <Textarea
                  label='Description'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  isReadOnly={!editMode && selectedChallenge}
                />
                <Input
                  label='Flag'
                  value={formData.flag}
                  onChange={(e) =>
                    setFormData({ ...formData, flag: e.target.value })
                  }
                  isReadOnly={!editMode && selectedChallenge}
                />
                <Textarea
                  label='Attachments (one per line)'
                  value={formData.attachments}
                  onChange={(e) =>
                    setFormData({ ...formData, attachments: e.target.value })
                  }
                  isReadOnly={!editMode && selectedChallenge}
                />
                <Textarea
                  label='Hints (one per line)'
                  value={formData.hints}
                  onChange={(e) =>
                    setFormData({ ...formData, hints: e.target.value })
                  }
                  isReadOnly={!editMode && selectedChallenge}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Close
                </Button>
                {(editMode || !selectedChallenge) && (
                  <Button color='primary' onPress={handleSubmit}>
                    {editMode ? 'Update' : 'Create'} Challenge
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
