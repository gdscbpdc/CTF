'use client';

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
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { ref, deleteObject } from 'firebase/storage';
import { Search, Plus, Pencil, Trash2, Eye, Upload } from 'lucide-react';

import { db, storage } from '@/services/firebase.config';
import { useUploadThing } from '@/lib/hooks/useUploadThing';
import { CHALLENGE_CATEGORIES, CHALLENGE_DIFFICULTIES } from '@/lib/constants';

const emptyChallenge = {
  title: '',
  shortDescription: '',
  description: '',
  category: '',
  difficulty: '',
  points: '',
  flag: '',
  prerequisites: [],
  hints: [],
  links: '',
  attachments: [],
};

export default function ChallengeManager() {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState(emptyChallenge);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const { startUpload } = useUploadThing('challengeAttachment');

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
      setError('Failed to load challenges');
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
    setFormData(emptyChallenge);
    setFiles([]);
    onOpen();
  };

  const handleEdit = (challenge) => {
    setSelectedChallenge(challenge);
    setEditMode(true);
    setFormData(challenge);
    setFiles([]);
    onOpen();
  };

  const handleView = (challenge) => {
    setSelectedChallenge(challenge);
    setEditMode(false);
    setFormData({
      title: challenge.title || '',
      shortDescription: challenge.shortDescription || '',
      description: challenge.description || '',
      category: challenge.category || '',
      difficulty: challenge.difficulty || '',
      points: challenge.points ? challenge.points.toString() : '',
      flag: challenge.flag || '',
      prerequisites: challenge.prerequisites || [],
      hints: challenge.hints || [],
      links: challenge.links || '',
      attachments: challenge.attachments || [],
    });
    onOpen();
  };

  const handleDelete = async (challengeId) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    try {
      setIsLoading(true);
      const challenge = challenges.find((c) => c.id === challengeId);

      if (challenge.attachments?.length) {
        for (const attachment of challenge.attachments) {
          const storageRef = ref(
            storage,
            `challenges/${challenge.title}/${attachment.name}`
          );
          try {
            await deleteObject(storageRef);
          } catch (error) {
            console.error('Error deleting file:', error);
          }
        }
      }

      await deleteDoc(doc(db, 'challenges', challengeId));
      await loadChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      setError('Failed to delete challenge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const localFiles = e.target.files;
    if (!localFiles || localFiles.length === 0) return;

    const newFiles = Array.from(localFiles).filter((file) => {
      return !files.some((selected) => selected.name === file.name);
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const uploadFiles = async () => {
    if (!files.length) return [];

    try {
      const uploadedFiles = await startUpload(files);
      if (!uploadedFiles) {
        throw new Error('Failed to upload files');
      }
      return uploadedFiles.map((file) => ({
        name: file.name,
        url: file.ufsUrl,
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Failed to upload files');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      setIsUploading(true);

      let attachments = formData.attachments || [];

      if (files.length > 0) {
        const uploadedFiles = await uploadFiles();
        attachments = [...attachments, ...uploadedFiles];
      }

      const challengeData = {
        ...formData,
        attachments,
        prerequisites: formData.prerequisites || [],
        hints: formData.hints || [],
        updatedAt: new Date().toISOString(),
      };

      if (selectedChallenge) {
        await updateDoc(
          doc(db, 'challenges', selectedChallenge.id),
          challengeData
        );
      } else {
        await addDoc(collection(db, 'challenges'), {
          ...challengeData,
          createdAt: new Date().toISOString(),
        });
      }

      await loadChallenges();
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Error saving challenge:', error);
      setError('Failed to save challenge');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <Input
          isClearable
          classNames={{
            base: 'w-full sm:max-w-xl',
            inputWrapper: 'border-1 h-14',
          }}
          placeholder='Search challenges...'
          startContent={<Search className='text-default-300' />}
          value={searchQuery}
          variant='bordered'
          onClear={() => setSearchQuery('')}
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
                {selectedChallenge ? 'Edit Challenge' : 'Add Challenge'}
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  {error && <div className='text-danger text-sm'>{error}</div>}
                  <Input
                    label='Title'
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  <Input
                    label='Short Description'
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shortDescription: e.target.value,
                      })
                    }
                  />
                  <Textarea
                    label='Description'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    minRows={3}
                  />
                  <div className='grid grid-cols-2 gap-4'>
                    <Select
                      label='Category'
                      value={formData.category}
                      defaultSelectedKeys={
                        formData.category ? [formData.category] : undefined
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                      value={formData.difficulty}
                      defaultSelectedKeys={
                        formData.difficulty ? [formData.difficulty] : undefined
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                  </div>
                  <Input
                    label='Points'
                    type='number'
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        points: parseInt(e.target.value) || '',
                      })
                    }
                  />
                  <Input
                    label='Flag'
                    value={formData.flag}
                    onChange={(e) =>
                      setFormData({ ...formData, flag: e.target.value })
                    }
                  />
                  <Textarea
                    label='Prerequisites (one per line)'
                    value={formData.prerequisites?.join('\n') || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prerequisites: e.target.value
                          .split('\n')
                          .filter(Boolean),
                      })
                    }
                    minRows={2}
                  />
                  <Textarea
                    label='Hints (one per line)'
                    value={formData.hints?.join('\n') || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hints: e.target.value.split('\n').filter(Boolean),
                      })
                    }
                    minRows={2}
                  />
                  <Textarea
                    label='Links (one per line)'
                    value={formData.links || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        links: e.target.value,
                      })
                    }
                    minRows={2}
                    placeholder='https://example.com'
                  />
                  <div>
                    <p className='text-small text-default-500 mb-2'>
                      Current Attachments
                    </p>
                    {formData.attachments?.length ? (
                      <div className='space-y-2'>
                        {formData.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between'
                          >
                            <span>{attachment.name}</span>
                            <Button
                              size='sm'
                              color='danger'
                              variant='light'
                              isIconOnly
                              onPress={() =>
                                setFormData({
                                  ...formData,
                                  attachments: formData.attachments.filter(
                                    (_, i) => i !== index
                                  ),
                                })
                              }
                            >
                              <Trash2 className='w-4 h-4' />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-default-400'>No attachments</p>
                    )}
                  </div>
                  <div>
                    <p className='text-small text-default-500 mb-2'>
                      Add Attachments
                    </p>
                    <input
                      type='file'
                      multiple
                      onChange={handleFileChange}
                      className='hidden'
                      id='file-upload'
                      accept='.pdf,.txt,.zip,.jpg,.jpeg,.png,.gif'
                    />
                    <label htmlFor='file-upload'>
                      <Button
                        as='span'
                        color='default'
                        variant='flat'
                        startContent={<Upload className='w-4 h-4' />}
                      >
                        Choose Files
                      </Button>
                    </label>
                    {files.length > 0 && (
                      <div className='mt-2'>
                        <p className='text-small text-default-500 mb-2'>
                          Selected files:
                        </p>
                        <div className='space-y-2'>
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className='p-2 bg-default-100 rounded-md'
                            >
                              {file.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  onPress={handleSubmit}
                  isLoading={isLoading || isUploading}
                >
                  {selectedChallenge ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
