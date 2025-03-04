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
  Divider,
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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Upload,
  FileDown,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { db, storage } from '@/services/firebase.config';
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
            toast.error('Error deleting file', {
              description: `Failed to delete ${attachment.name}`,
            });
          }
        }
      }

      await deleteDoc(doc(db, 'challenges', challengeId));
      toast.success('Challenge deleted successfully');
      await loadChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      setError('Failed to delete challenge');
      toast.error('Failed to delete challenge', {
        description: error.message,
      });
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

  const uploadFiles = async (files, challengeTitle) => {
    if (!files.length) return [];

    try {
      const uploadedFiles = [];

      for (const file of files) {
        const storageRef = ref(
          storage,
          `challenges/${challengeTitle}/${file.name}`
        );

        await uploadBytes(storageRef, file);

        const downloadURL = await getDownloadURL(storageRef);

        uploadedFiles.push({
          name: file.name,
          url: downloadURL,
        });
      }

      return uploadedFiles;
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files', {
        description: error.message,
      });
      throw new Error('Failed to upload files');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      setIsUploading(true);

      if (!formData.title) {
        toast.error('Missing title', {
          description: 'Please provide a title for the challenge',
        });
        return;
      }

      let attachments = formData.attachments || [];

      if (files.length > 0) {
        const uploadedFiles = await uploadFiles(files, formData.title);
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
        toast.success('Challenge updated successfully');
      } else {
        await addDoc(collection(db, 'challenges'), {
          ...challengeData,
          createdAt: new Date().toISOString(),
        });
        toast.success('Challenge created successfully');
      }

      await loadChallenges();
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Error saving challenge:', error);
      setError('Failed to save challenge');
      toast.error('Failed to save challenge', {
        description: error.message,
      });
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
                  <div className='space-y-4'>
                    <div>
                      <p className='text-small font-medium mb-2'>
                        Current Attachments
                      </p>
                      {formData.attachments?.length ? (
                        <div className='space-y-2'>
                          {formData.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between p-3 rounded-lg border border-default-200 bg-default-50'
                            >
                              <div className='flex items-center gap-3 flex-1 min-w-0'>
                                <FileDown className='w-4 h-4 text-primary flex-shrink-0' />
                                <span className='truncate text-default-700'>
                                  {attachment.name}
                                </span>
                              </div>
                              <div className='flex gap-2 flex-shrink-0'>
                                <Button
                                  as='a'
                                  href={attachment.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  size='sm'
                                  variant='flat'
                                  isIconOnly
                                >
                                  <Eye className='w-4 h-4' />
                                </Button>
                                <Button
                                  size='sm'
                                  color='danger'
                                  variant='flat'
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
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='text-default-400 text-center p-4 rounded-lg border border-dashed border-default-200'>
                          No attachments added yet
                        </div>
                      )}
                    </div>

                    <Divider />

                    <div>
                      <p className='text-small font-medium mb-2'>
                        Add New Attachments
                      </p>
                      <div className='space-y-4'>
                        <div className='flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-default-200'>
                          <input
                            type='file'
                            multiple
                            onChange={handleFileChange}
                            className='hidden'
                            id='file-upload'
                            accept='.pdf,.txt,.zip,.jpg,.jpeg,.png,.gif'
                          />
                          <label
                            htmlFor='file-upload'
                            className='cursor-pointer'
                          >
                            <div className='flex flex-col items-center gap-2'>
                              <Upload className='w-8 h-8 text-default-400' />
                              <div className='text-center'>
                                <p className='text-default-700 font-medium'>
                                  Click to upload files
                                </p>
                                <p className='text-small text-default-400'>
                                  PDF, TXT, ZIP, JPG, PNG, GIF up to 10MB
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>

                        {files.length > 0 && (
                          <div className='space-y-2'>
                            <p className='text-small font-medium'>
                              Selected files to upload:
                            </p>
                            {files.map((file, index) => (
                              <div
                                key={index}
                                className='flex items-center justify-between p-2 rounded-lg bg-default-100'
                              >
                                <div className='flex items-center gap-2 flex-1 min-w-0'>
                                  <FileDown className='w-4 h-4 text-primary' />
                                  <span className='truncate'>{file.name}</span>
                                </div>
                                <Button
                                  size='sm'
                                  isIconOnly
                                  variant='light'
                                  color='danger'
                                  onPress={() => {
                                    setFiles(
                                      files.filter((_, i) => i !== index)
                                    );
                                  }}
                                >
                                  <X className='w-4 h-4' />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
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
