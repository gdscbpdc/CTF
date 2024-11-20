'use client';

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from '@nextui-org/react';
import { useState } from 'react';

export default function UserManager() {
  const [users, setUsers] = useState([
    {
      id: '1',
      username: 'hackerman',
      email: 'hackerman@gdg.ae',
      points: 1250,
      rank: 'Elite Hacker',
      solvedChallenges: 15,
      isAdmin: true,
    },
    {
      id: '2',
      username: 'newbie',
      email: 'newbie@gdg.ae',
      points: 250,
      rank: 'Script Kiddie',
      solvedChallenges: 3,
      isAdmin: false,
    },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    isAdmin: false,
  });

  const handleCreateUser = () => {
    const userToAdd = {
      ...newUser,
      id: Math.random().toString(36).substr(2, 9),
      points: 0,
      rank: 'Script Kiddie',
      solvedChallenges: 0,
    };

    setUsers([...users, userToAdd]);
    setIsCreateModalOpen(false);
    setNewUser({
      username: '',
      email: '',
      isAdmin: false,
    });
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  return (
    <>
      <Button
        color='primary'
        className='mb-4'
        onClick={() => setIsCreateModalOpen(true)}
      >
        Create User
      </Button>

      <Table>
        <TableHeader>
          <TableColumn>Username</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Points</TableColumn>
          <TableColumn>Rank</TableColumn>
          <TableColumn>Solved Challenges</TableColumn>
          <TableColumn>Role</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.points}</TableCell>
              <TableCell>{user.rank}</TableCell>
              <TableCell>{user.solvedChallenges}</TableCell>
              <TableCell>
                <Chip
                  color={user.isAdmin ? 'danger' : 'default'}
                  size='sm'
                  variant='flat'
                >
                  {user.isAdmin ? 'Admin' : 'User'}
                </Chip>
              </TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button size='sm' color='secondary'>
                    Edit
                  </Button>
                  <Button
                    size='sm'
                    color='danger'
                    onClick={() => handleDeleteUser(user.id)}
                  >
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
          <ModalHeader>Create New User</ModalHeader>
          <ModalBody>
            <Input
              label='Username'
              value={newUser.username}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  username: e.target.value,
                })
              }
            />
            <Input
              label='Email'
              value={newUser.email}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  email: e.target.value,
                })
              }
            />
            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                checked={newUser.isAdmin}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    isAdmin: e.target.checked,
                  })
                }
              />
              <span>Admin User</span>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color='danger'
              variant='light'
              onPress={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color='primary' onPress={handleCreateUser}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
