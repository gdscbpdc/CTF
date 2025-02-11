import { auth, db } from '../services/firebase.config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { getUserRank } from './ranks';
import Cookies from 'js-cookie';

export async function getCurrentUser() {
  if (!auth.currentUser) return null;

  const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
  if (!userDoc.exists()) return null;

  const teamDoc = await getDoc(doc(db, 'teams', userDoc.data().teamId));

  return {
    id: auth.currentUser.uid,
    ...userDoc.data(),
    team: teamDoc.exists() ? { id: teamDoc.id, ...teamDoc.data() } : null,
  };
}

export async function getCurrentUserToken() {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken(true);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

export async function checkTeamNameAvailability(teamName) {
  const q = query(collection(db, 'teams'), where('teamName', '==', teamName));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

export async function checkEmailAvailability(email) {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

export async function registerTeam(teamData) {
  try {
    const { teamName, members } = teamData;

    if (!members || members.length === 0 || members.length > 4) {
      throw new Error('Team must have between 1 and 4 members');
    }

    if (!teamName || teamName.length < 3) {
      throw new Error('Team name must be at least 3 characters long');
    }

    const isTeamNameAvailable = await checkTeamNameAvailability(teamName);
    if (!isTeamNameAvailable) {
      throw new Error('Team name is already taken');
    }

    for (const member of members) {
      const isEmailAvailable = await checkEmailAvailability(member.email);
      if (!isEmailAvailable) {
        throw new Error(`Email ${member.email} is already registered`);
      }
    }

    const batch = writeBatch(db);

    const teamRef = doc(collection(db, 'teams'));
    const teamDoc = {
      teamName,
      points: 0,
      solvedChallenges: [],
      rank: getUserRank(0),
      createdAt: new Date().toISOString(),
      memberCount: members.length,
    };
    batch.set(teamRef, teamDoc);

    const createdUsers = [];
    for (const member of members) {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        member.email,
        member.password
      );

      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = {
        name: member.name,
        email: member.email,
        teamId: teamRef.id,
        registeredAt: new Date().toISOString(),
      };
      batch.set(userRef, userDoc);

      createdUsers.push({
        id: userCredential.user.uid,
        ...userDoc,
      });
    }

    await batch.commit();

    const token = await auth.currentUser.getIdToken();
    Cookies.set('auth-token', token, { secure: true, sameSite: 'strict' });

    return {
      success: true,
      team: { id: teamRef.id, ...teamDoc },
      users: createdUsers,
      message: 'Team registration successful!',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function loginUser(credentials) {
  try {
    const { email, password } = credentials;

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const token = await userCredential.user.getIdToken();
    Cookies.set('auth-token', token, { secure: true, sameSite: 'strict' });

    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    const teamDoc = await getDoc(doc(db, 'teams', userDoc.data().teamId));
    if (!teamDoc.exists()) {
      throw new Error('Team data not found');
    }

    return {
      success: true,
      user: {
        id: userCredential.user.uid,
        ...userDoc.data(),
        team: { id: teamDoc.id, ...teamDoc.data() },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Invalid credentials',
    };
  }
}

export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address');
    }
    throw new Error('Failed to send password reset email. Please try again.');
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    Cookies.remove('auth-token');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}
