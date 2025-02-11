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
  orderBy,
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

const STATUS_OPTIONS = [
  { key: 'all', label: 'All Teams' },
  { key: 'active', label: 'Active Teams' },
  { key: 'inactive', label: 'Inactive Teams' },
];

export default function TeamManager() {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('teamName-asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const unsubscribe = subscribeToTeams();
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    filterAndSortTeams();
  }, [searchQuery, sortOption, statusFilter, teams]);

  const subscribeToTeams = () => {
    try {
      const q = query(collection(db, 'teams'));
      return onSnapshot(
        q,
        async (snapshot) => {
          const teamsData = [];
          for (const doc of snapshot.docs) {
            const team = doc.data();

            const membersQuery = query(
              collection(db, 'users'),
              where('teamId', '==', doc.id)
            );
            const membersSnapshot = await getDocs(membersQuery);
            const members = membersSnapshot.docs.map((memberDoc) => ({
              id: memberDoc.id,
              ...memberDoc.data(),
            }));

            teamsData.push({
              id: doc.id,
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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (team) => (statusFilter === 'active') === team.isActive
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

  const toggleTeamStatus = async (teamId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'teams', teamId), {
        isActive: !currentStatus,
      });
    } catch (error) {
      console.error('Error updating team status:', error);
    }
  };

  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    onOpen();
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-4'>
        <Input
          isClearable
          className='w-full sm:max-w-[44%]'
          placeholder='Search by team name or member...'
          startContent={<Search className='w-4 h-4 text-default-400' />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className='flex flex-wrap gap-4'>
          <Select
            label='Sort by'
            className='w-full sm:max-w-[200px]'
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            label='Status'
            className='w-full sm:max-w-[200px]'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <Table aria-label='Teams table'>
        <TableHeader>
          <TableColumn>TEAM NAME</TableColumn>
          <TableColumn>MEMBERS</TableColumn>
          <TableColumn>POINTS</TableColumn>
          <TableColumn>SOLVES</TableColumn>
          <TableColumn>STATUS</TableColumn>
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
                <div className='flex items-center gap-2'>
                  {team.rank === 1 && (
                    <Trophy className='w-4 h-4 text-warning' />
                  )}
                  {team.teamName}
                </div>
              </TableCell>
              <TableCell>
                <div className='flex flex-col gap-1'>
                  {team.members.map((member) => (
                    <div key={member.id} className='text-small'>
                      {member.name}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>{team.points}</TableCell>
              <TableCell>{team.solvedChallenges?.length || 0}</TableCell>
              <TableCell>
                <Chip
                  color={team.isActive ? 'success' : 'danger'}
                  variant='flat'
                >
                  {team.isActive ? 'Active' : 'Inactive'}
                </Chip>
              </TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button
                    isIconOnly
                    variant='light'
                    onPress={() => handleViewTeam(team)}
                  >
                    <Eye className='w-4 h-4' />
                  </Button>
                  <Button
                    isIconOnly
                    variant='light'
                    color={team.isActive ? 'danger' : 'success'}
                    onPress={() => toggleTeamStatus(team.id, team.isActive)}
                  >
                    {team.isActive ? (
                      <Ban className='w-4 h-4' />
                    ) : (
                      <CheckCircle className='w-4 h-4' />
                    )}
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
              <ModalHeader>Team Details</ModalHeader>
              <ModalBody>
                {selectedTeam && (
                  <div className='space-y-4'>
                    <div>
                      <h3 className='text-lg font-semibold'>
                        Team Information
                      </h3>
                      <p>Name: {selectedTeam.teamName}</p>
                      <p>Points: {selectedTeam.points}</p>
                      <p>
                        Solves: {selectedTeam.solvedChallenges?.length || 0}
                      </p>
                      <p>
                        Status:{' '}
                        <Chip
                          color={selectedTeam.isActive ? 'success' : 'danger'}
                          variant='flat'
                        >
                          {selectedTeam.isActive ? 'Active' : 'Inactive'}
                        </Chip>
                      </p>
                    </div>

                    <div>
                      <h3 className='text-lg font-semibold'>Team Members</h3>
                      <div className='space-y-2'>
                        {selectedTeam.members.map((member) => (
                          <div
                            key={member.id}
                            className='flex justify-between items-center'
                          >
                            <div>
                              <p className='font-medium'>{member.name}</p>
                              <p className='text-small text-default-500'>
                                {member.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedTeam.solvedChallenges?.length > 0 && (
                      <div>
                        <h3 className='text-lg font-semibold'>
                          Solved Challenges
                        </h3>
                        <div className='space-y-2'>
                          {selectedTeam.solvedChallenges.map((challengeId) => (
                            <div key={challengeId}>{challengeId}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
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
