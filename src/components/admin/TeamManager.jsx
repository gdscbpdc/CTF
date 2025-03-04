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
} from '@nextui-org/react';
import { Search, Eye, Ban, CheckCircle, Trophy } from 'lucide-react';
import { db } from '@/services/firebase.config';
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  where,
  onSnapshot,
} from 'firebase/firestore';

const SORT_OPTIONS = [
  {
    key: 'teamName-asc',
    label: 'Team Name (A-Z)',
    field: 'teamName',
    direction: 'asc',
  },
  {
    key: 'teamName-desc',
    label: 'Team Name (Z-A)',
    field: 'teamName',
    direction: 'desc',
  },
  {
    key: 'points-desc',
    label: 'Points (High to Low)',
    field: 'points',
    direction: 'desc',
  },
  {
    key: 'points-asc',
    label: 'Points (Low to High)',
    field: 'points',
    direction: 'asc',
  },
  {
    key: 'memberCount-desc',
    label: 'Members (Most)',
    field: 'memberCount',
    direction: 'desc',
  },
  {
    key: 'memberCount-asc',
    label: 'Members (Least)',
    field: 'memberCount',
    direction: 'asc',
  },
];

export default function TeamManager() {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('teamName-asc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const unsubscribe = subscribeToTeams();
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    filterAndSortTeams();
  }, [searchQuery, sortOption, teams]);

  const subscribeToTeams = () => {
    try {
      const q = query(collection(db, 'teams'));
      return onSnapshot(
        q,
        async (snapshot) => {
          const teamsData = [];
          for (const document of snapshot.docs) {
            const team = document.data();

            const membersQuery = query(
              collection(db, 'users'),
              where('teamId', '==', document.id)
            );
            const membersSnapshot = await getDocs(membersQuery);
            const members = membersSnapshot.docs.map((memberDoc) => ({
              id: memberDoc.id,
              ...memberDoc.data(),
            }));

            teamsData.push({
              id: document.id,
              ...team,
              members,
            });
          }
          setTeams(teamsData);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error subscribing to teams:', error);
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up subscription:', error);
      setIsLoading(false);
    }
  };

  const filterAndSortTeams = () => {
    let filtered = [...teams];

    if (searchQuery) {
      filtered = filtered.filter(
        (team) =>
          team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.members.some((member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    const [field, direction] = sortOption.split('-');
    filtered.sort((a, b) => {
      let comparison = 0;
      if (field === 'teamName') {
        comparison = a.teamName.localeCompare(b.teamName);
      } else if (field === 'points') {
        comparison = a.points - b.points;
      } else if (field === 'memberCount') {
        comparison = a.memberCount - b.memberCount;
      }
      return direction === 'asc' ? comparison : -comparison;
    });

    setFilteredTeams(filtered);
  };

  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    onOpen();
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap flex-col sm:flex-row justify-start gap-3'>
        <Input
          isClearable
          classNames={{
            base: 'w-full sm:max-w-xl',
            inputWrapper: 'border-1 h-14',
          }}
          variant='bordered'
          placeholder='Search by team name or member...'
          startContent={<Search className='text-default-300' />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          label='Sort by'
          className='w-full sm:max-w-[200px]'
          variant='bordered'
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      <Table aria-label='Teams table'>
        <TableHeader>
          <TableColumn>TEAM NAME</TableColumn>
          <TableColumn>MEMBERS</TableColumn>
          <TableColumn>POINTS</TableColumn>
          <TableColumn>SOLVES</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={filteredTeams}
          isLoading={isLoading}
          loadingContent={<div>Loading teams...</div>}
        >
          {(team) => (
            <TableRow key={team.id}>
              <TableCell>
                <div className='flex items-center gap-2'>{team.teamName}</div>
              </TableCell>
              <TableCell>
                <div className='flex flex-wrap gap-2'>
                  {team.members.map((member) => (
                    <Chip key={member.id} variant='flat'>
                      {member.name}
                    </Chip>
                  ))}
                </div>
              </TableCell>
              <TableCell>{team.points}</TableCell>
              <TableCell>{team.solvedChallenges?.length || 0}</TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button
                    isIconOnly
                    variant='light'
                    onPress={() => handleViewTeam(team)}
                  >
                    <Eye className='w-4 h-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal size='2xl' isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-row items-center gap-2'>
                <h2 className='text-xl font-bold'>{selectedTeam.teamName}</h2>

                <Chip variant='flat'>{selectedTeam.points} pts</Chip>
              </ModalHeader>
              <ModalBody>
                {selectedTeam && (
                  <div className='space-y-6'>
                    <div className='space-y-2'>
                      <h3 className='text-lg font-semibold'>Members</h3>

                      <div className='space-y-2'>
                        {selectedTeam.members.map((member) => (
                          <div
                            key={member.id}
                            className='p-3 rounded-lg bg-default-100'
                          >
                            <p className='font-medium'>{member.name}</p>
                            <p className='text-sm text-default-500'>
                              {member.email}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedTeam.solvedChallenges?.length > 0 && (
                      <div className='space-y-2'>
                        <div className='flex flex-row justify-between items-center gap-2'>
                          <h3 className='text-lg font-semibold'>
                            Solved Challenges
                          </h3>

                          <p className='text-default-500'>
                            {selectedTeam.solvedChallenges.length}
                          </p>
                        </div>
                        <div className='space-y-2 max-h-[200px] overflow-y-auto'>
                          {selectedTeam.solvedChallenges.map((challengeId) => (
                            <div
                              key={challengeId}
                              className='p-3 rounded-lg bg-default-100'
                            >
                              <p className='font-medium'>{challengeId}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color='primary' onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
