import { db } from '@/services/firebase.config';
import {
  doc,
  getDoc,
  getDocs,
  query,
  collection,
  where,
  updateDoc,
  orderBy,
  limit,
} from 'firebase/firestore';

export async function getTeamDetails(teamId) {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) {
      return null;
    }

    const membersQuery = query(
      collection(db, 'users'),
      where('teamId', '==', teamId)
    );
    const membersSnapshot = await getDocs(membersQuery);
    const members = membersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      id: teamDoc.id,
      ...teamDoc.data(),
      members,
    };
  } catch (error) {
    console.error('Error getting team details:', error);
    return null;
  }
}

export async function getTeamMembers(teamId) {
  try {
    const membersQuery = query(
      collection(db, 'users'),
      where('teamId', '==', teamId)
    );
    const membersSnapshot = await getDocs(membersQuery);

    return membersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting team members:', error);
    return [];
  }
}

export async function updateTeamName(teamId, newName) {
  try {
    const nameQuery = query(
      collection(db, 'teams'),
      where('teamName', '==', newName)
    );
    const nameSnapshot = await getDocs(nameQuery);

    if (!nameSnapshot.empty) {
      return {
        success: false,
        message: 'Team name is already taken',
      };
    }

    await updateDoc(doc(db, 'teams', teamId), {
      teamName: newName,
    });

    return {
      success: true,
      message: 'Team name updated successfully',
    };
  } catch (error) {
    console.error('Error updating team name:', error);
    return {
      success: false,
      message: 'Error updating team name',
    };
  }
}

export async function getTeamProgress(teamId) {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) {
      return null;
    }

    const solvedChallenges = teamDoc.data().solvedChallenges || [];

    const challengesSnapshot = await getDocs(collection(db, 'challenges'));
    const totalChallenges = challengesSnapshot.size;

    const categoryProgress = {};
    challengesSnapshot.docs.forEach((doc) => {
      const challenge = doc.data();
      const category = challenge.category;

      if (!categoryProgress[category]) {
        categoryProgress[category] = {
          total: 0,
          solved: 0,
        };
      }

      categoryProgress[category].total++;
      if (solvedChallenges.includes(doc.id)) {
        categoryProgress[category].solved++;
      }
    });

    return {
      totalChallenges,
      solvedCount: solvedChallenges.length,
      categoryProgress,
      completionPercentage: (solvedChallenges.length / totalChallenges) * 100,
    };
  } catch (error) {
    console.error('Error getting team progress:', error);
    return null;
  }
}

export async function getTeamActivity(teamId, activityLimit = 10) {
  try {
    const activityQuery = query(
      collection(db, 'solves'),
      where('teamId', '==', teamId),
      where('isCorrect', '==', true),
      orderBy('timestamp', 'desc'),
      limit(activityLimit)
    );

    const activitySnapshot = await getDocs(activityQuery);

    if (activitySnapshot.empty) {
      return [];
    }

    const challengeIds = activitySnapshot.docs.map(
      (doc) => doc.data().challengeId
    );

    const challengesRef = collection(db, 'challenges');
    const challengesSnapshot = await getDocs(
      query(challengesRef, where('__name__', 'in', challengeIds))
    );

    const challengeMap = {};
    challengesSnapshot.docs.forEach((doc) => {
      challengeMap[doc.id] = {
        id: doc.id,
        ...doc.data(),
      };
    });

    const activity = activitySnapshot.docs
      .map((doc) => {
        const solve = doc.data();
        const challenge = challengeMap[solve.challengeId];

        if (!challenge) {
          return null;
        }

        return {
          id: doc.id,
          timestamp: solve.timestamp?.toDate(),
          isCorrect: solve.isCorrect,
          challenge: {
            id: solve.challengeId,
            name: challenge.title,
            category: challenge.category,
            points: challenge.points,
          },
          userId: solve.userId,
        };
      })
      .filter(Boolean);

    return activity;
  } catch (error) {
    console.error('Error getting team activity:', error);
    return [];
  }
}
