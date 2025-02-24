'use client';

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Chip,
  Pagination,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';

import {
  CHALLENGE_CATEGORIES,
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_DIFFICULTIES_COLORS,
} from '@/lib/constants';
import LoadingState from '../ui/LoadingState';
import { db } from '@/services/firebase.config';
import { useAuth } from '@/contexts/AuthContext';

const columns = [
  { name: 'TITLE', uid: 'title', sortable: true },
  { name: 'CATEGORY', uid: 'category', sortable: true },
  { name: 'DIFFICULTY', uid: 'difficulty', sortable: true },
  { name: 'POINTS', uid: 'points', sortable: true },
  { name: 'STATUS', uid: 'status' },
];

export default function ChallengeTable() {
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [challenges, setChallenges] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showSolved, setShowSolved] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const ROWS_PER_PAGE = 10;
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'title',
    direction: 'ascending',
  });

  useEffect(() => {
    const unsubscribe = subscribeToChanges();
    return () => unsubscribe?.();
  }, []);

  const subscribeToChanges = () => {
    try {
      const q = query(collection(db, 'challenges'));
      return onSnapshot(
        q,
        async (snapshot) => {
          const challengesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChallenges(challengesData);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error subscribing to challenges:', error);
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up subscription:', error);
      setIsLoading(false);
    }
  };

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredChallenges = [...challenges];

    if (hasSearchFilter) {
      filteredChallenges = filteredChallenges.filter(
        (challenge) =>
          challenge.title.toLowerCase().includes(filterValue.toLowerCase()) ||
          challenge.shortDescription
            ?.toLowerCase()
            .includes(filterValue.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filteredChallenges = filteredChallenges.filter(
        (challenge) => challenge.category === selectedCategory
      );
    }

    if (selectedDifficulty !== 'all') {
      filteredChallenges = filteredChallenges.filter(
        (challenge) => challenge.difficulty === selectedDifficulty
      );
    }

    if (user?.team && showSolved !== 'all') {
      const solvedChallenges = user.team.solvedChallenges || [];
      filteredChallenges = filteredChallenges.filter((challenge) =>
        showSolved === 'solved'
          ? solvedChallenges.includes(challenge.id)
          : !solvedChallenges.includes(challenge.id)
      );
    }

    return filteredChallenges;
  }, [
    challenges,
    filterValue,
    selectedCategory,
    selectedDifficulty,
    showSolved,
    user?.team,
  ]);

  const pages = Math.ceil(filteredItems.length / ROWS_PER_PAGE);

  const items = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;

    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (challenge, columnKey) => {
      const cellValue = challenge[columnKey];

      switch (columnKey) {
        case 'title':
          return (
            <div className='flex flex-col'>
              <p className='text-bold text-small capitalize'>{cellValue}</p>
              <p className='text-bold text-tiny capitalize text-default-500 truncate'>
                {challenge.shortDescription}
              </p>
            </div>
          );
        case 'category':
          return (
            <Chip
              className='capitalize'
              color='default'
              size='sm'
              variant='flat'
            >
              {cellValue}
            </Chip>
          );
        case 'difficulty':
          return (
            <Chip
              className='capitalize'
              color={CHALLENGE_DIFFICULTIES_COLORS[cellValue]}
              size='sm'
              variant='flat'
            >
              {cellValue}
            </Chip>
          );
        case 'points':
          return cellValue;
        case 'status':
          if (!user?.team) return null;
          const isSolved = user.team.solvedChallenges?.includes(challenge.id);
          return (
            <Chip
              className='capitalize'
              color={isSolved ? 'success' : 'default'}
              size='sm'
              variant='flat'
            >
              {isSolved ? 'Solved' : 'Unsolved'}
            </Chip>
          );
        default:
          return cellValue;
      }
    },
    [user?.team]
  );

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue('');
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className='flex flex-col gap-4'>
        <div className='flex flex-wrap flex-col sm:flex-row justify-start gap-3'>
          <Input
            isClearable
            classNames={{
              base: 'w-full sm:max-w-xl',
              inputWrapper: 'border-1 h-14',
            }}
            placeholder='Search challenges...'
            startContent={<Search className='text-default-300' />}
            value={filterValue}
            variant='bordered'
            onClear={() => setFilterValue('')}
            onValueChange={onSearchChange}
          />

          <Select
            label='Category'
            className='w-full sm:max-w-[200px]'
            variant='bordered'
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <SelectItem key='all' value='all'>
              All Categories
            </SelectItem>
            {CHALLENGE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </Select>
          <Select
            label='Difficulty'
            className='w-full sm:max-w-[200px]'
            variant='bordered'
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <SelectItem key='all' value='all'>
              All Difficulties
            </SelectItem>
            {CHALLENGE_DIFFICULTIES.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty}
              </SelectItem>
            ))}
          </Select>
          {user?.team && (
            <Select
              label='Status'
              className='w-full sm:max-w-[200px]'
              variant='bordered'
              value={showSolved}
              onChange={(e) => setShowSolved(e.target.value)}
            >
              <SelectItem key='all' value='all'>
                All Challenges
              </SelectItem>
              <SelectItem key='solved' value='solved'>
                Solved Only
              </SelectItem>
              <SelectItem key='unsolved' value='unsolved'>
                Unsolved Only
              </SelectItem>
            </Select>
          )}
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-default-400 text-small'>
            Total {filteredItems.length} challenges
          </span>
        </div>
      </div>
    );
  }, [
    filterValue,
    selectedCategory,
    selectedDifficulty,
    showSolved,
    onSearchChange,
    filteredItems.length,
    user?.team,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className='py-2 px-2 flex justify-center items-center'>
        <Pagination
          showControls
          classNames={{
            cursor: 'bg-primary text-foreground',
          }}
          color='primary'
          page={page}
          total={pages}
          variant='light'
          onChange={setPage}
        />
      </div>
    );
  }, [page, pages]);

  if (isLoading)
    return <LoadingState message='Loading challenges...' fullHeight />;

  return (
    <Table
      isStriped
      onRowAction={(key) => router.push(`/challenges/${key}`)}
      aria-label='Challenges table'
      bottomContent={bottomContent}
      bottomContentPlacement='outside'
      classNames={{
        wrapper: 'max-h-[600px]',
      }}
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement='outside'
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === 'points' ? 'end' : 'start'}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={'No challenges found'} items={sortedItems}>
        {(item) => (
          <TableRow key={item.id} className='cursor-pointer'>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
