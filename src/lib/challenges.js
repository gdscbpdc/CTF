import { db } from '@/services/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  arrayUnion,
  increment,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';

export async function getAllChallenges() {
  try {
    const challengesRef = collection(db, 'challenges');
    const q = query(challengesRef, orderBy('title'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      // Remove sensitive flag data before sending to client
      const { flag, ...challengeData } = data;
      return {
        id: doc.id,
        ...challengeData,
      };
    });
  } catch (error) {
    console.error('Error getting all challenges:', error);
    return [];
  }
}

export async function getChallengeById(challengeId) {
  try {
    const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
    if (!challengeDoc.exists()) {
      return null;
    }
    const data = challengeDoc.data();
    // Remove sensitive flag data before sending to client
    const { flag, ...challengeData } = data;
    return {
      id: challengeId,
      ...challengeData,
    };
  } catch (error) {
    console.error('Error getting challenge by ID:', error);
    return null;
  }
}

export async function getChallengesByCategory(category) {
  try {
    const challengesRef = collection(db, 'challenges');
    const q = query(
      challengesRef,
      where('category', '==', category),
      orderBy('points')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting challenges by category:', error);
    throw error;
  }
}

export async function getChallengesByDifficulty(difficulty) {
  try {
    const challengesRef = collection(db, 'challenges');
    const q = query(
      challengesRef,
      where('difficulty', '==', difficulty),
      orderBy('points')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting challenges by difficulty:', error);
    throw error;
  }
}

export async function hasTeamSolvedChallenge(teamId, challengeId) {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) {
      return false;
    }
    const solvedChallenges = teamDoc.data().solvedChallenges || [];
    return solvedChallenges.includes(challengeId);
  } catch (error) {
    console.error('Error checking if team solved challenge:', error);
    throw error;
  }
}

export async function submitFlag(userId, teamId, challengeId, flag) {
  try {
    const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
    if (!challengeDoc.exists()) {
      throw new Error('Challenge not found');
    }

    const correctFlag = challengeDoc.data().flag;
    const points = challengeDoc.data().points;

    if (flag !== correctFlag) {
      await addSolveAttempt(userId, teamId, challengeId, false);
      return { success: false, message: 'Incorrect flag' };
    }

    const hasAlreadySolved = await hasTeamSolvedChallenge(teamId, challengeId);
    if (hasAlreadySolved) {
      return { success: false, message: 'Challenge already solved' };
    }

    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      solvedChallenges: arrayUnion(challengeId),
      points: increment(points),
    });

    await addSolveAttempt(userId, teamId, challengeId, true);

    return { success: true, message: 'Correct flag! Points awarded.' };
  } catch (error) {
    console.error('Error submitting flag:', error);
    throw error;
  }
}

async function addSolveAttempt(userId, teamId, challengeId, isCorrect) {
  try {
    const solvesRef = collection(db, 'solves');
    await addDoc(solvesRef, {
      userId,
      teamId,
      challengeId,
      isCorrect,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding solve attempt:', error);
    throw error;
  }
}

export async function getRecentSolves(limit = 10) {
  try {
    const q = query(
      collection(db, 'solves'),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting recent solves:', error);
    return [];
  }
}

export async function getTeamSolvedChallenges(teamId) {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const team = await getDoc(teamRef);

    if (!team.exists()) {
      return [];
    }

    const solvedChallengeIds = team.data().solvedChallenges;
    const solvedChallenges = [];

    for (const challengeId of solvedChallengeIds) {
      const challenge = await getChallengeById(challengeId);
      if (challenge) {
        solvedChallenges.push(challenge);
      }
    }

    return solvedChallenges;
  } catch (error) {
    console.error('Error getting team solved challenges:', error);
    return [];
  }
}

export async function getChallengeCategories() {
  try {
    const challenges = await getAllChallenges();
    const categories = [
      ...new Set(challenges.map((challenge) => challenge.category)),
    ];
    return categories.sort();
  } catch (error) {
    console.error('Error getting challenge categories:', error);
    return [];
  }
}

export async function getChallengeStats(challengeId) {
  try {
    const q = query(
      collection(db, 'solves'),
      where('challengeId', '==', challengeId)
    );
    const querySnapshot = await getDocs(q);

    return {
      solveCount: querySnapshot.size,
      solves: querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  } catch (error) {
    console.error('Error getting challenge stats:', error);
    return {
      solveCount: 0,
      solves: [],
    };
  }
}
