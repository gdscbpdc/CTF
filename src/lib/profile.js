import { db, auth } from '@/services/firebase.config';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';

export async function getUserProfile(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();

    let teamData = null;
    if (userData.teamId) {
      const teamDoc = await getDoc(doc(db, 'teams', userData.teamId));
      if (teamDoc.exists()) {
        teamData = {
          id: teamDoc.id,
          ...teamDoc.data(),
        };
      }
    }

    const activityQuery = query(
      collection(db, 'solves'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const activitySnapshot = await getDocs(activityQuery);
    const recentActivity = [];

    for (const docSnap of activitySnapshot.docs) {
      const solve = docSnap.data();
      const challenge = await getDoc(doc(db, 'challenges', solve.challengeId));

      if (challenge.exists()) {
        recentActivity.push({
          id: doc.id,
          type: 'solve',
          description: `Solved ${challenge.data().title}`,
          points: challenge.data().points,
          timestamp: solve.timestamp?.toDate(),
        });
      }
    }

    const solvedChallenges = teamData?.solvedChallenges || [];
    const totalPoints = teamData?.points || 0;

    let rank = null;
    if (teamData) {
      const higherPointsQuery = query(
        collection(db, 'teams'),
        where('points', '>', teamData.points)
      );
      const higherPointsCount = (await getDocs(higherPointsQuery)).size;
      rank = higherPointsCount + 1;
    }

    return {
      id: userId,
      name: userData.name,
      email: userData.email,
      team: teamData,
      totalPoints,
      solvedChallenges,
      rank,
      recentActivity,
      registeredAt: userData.registeredAt,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId, data) {
  try {
    const { currentPassword, newPassword, confirmPassword, ...profileData } =
      data;

    await updateDoc(doc(db, 'users', userId), {
      name: profileData.name,
      updatedAt: new Date(),
    });

    if (currentPassword && newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      try {
        await reauthenticateWithCredential(auth.currentUser, credential);
      } catch (error) {
        if (error.code === 'auth/wrong-password') {
          throw new Error('Current password is incorrect');
        }
        throw new Error('Failed to authenticate. Please try again.');
      }

      try {
        await updatePassword(auth.currentUser, newPassword);
      } catch (error) {
        throw new Error('Failed to update password. Please try again.');
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function getUserStats(userId) {
  try {
    const solvesQuery = query(
      collection(db, 'solves'),
      where('userId', '==', userId)
    );
    const solvesSnapshot = await getDocs(solvesQuery);
    const solves = solvesSnapshot.docs.map((doc) => doc.data());

    const totalAttempts = solves.length;
    const successfulSolves = solves.filter((solve) => solve.isCorrect).length;
    const successRate =
      totalAttempts > 0 ? (successfulSolves / totalAttempts) * 100 : 0;

    let teamContribution = 0;
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.teamId) {
        const teamDoc = await getDoc(doc(db, 'teams', userData.teamId));
        if (teamDoc.exists()) {
          const teamData = teamDoc.data();
          const userPoints = userData.points || 0;
          const teamPoints = teamData.points || 0;
          teamContribution =
            teamPoints > 0 ? (userPoints / teamPoints) * 100 : 0;
        }
      }
    }

    const solvesByCategory = {};
    const challengePromises = solves
      .filter((solve) => solve.isCorrect)
      .map((solve) => getDoc(doc(db, 'challenges', solve.challengeId)));

    const challengeDocs = await Promise.all(challengePromises);
    challengeDocs.forEach((doc) => {
      if (doc.exists()) {
        const category = doc.data().category;
        solvesByCategory[category] = (solvesByCategory[category] || 0) + 1;
      }
    });

    return {
      totalAttempts,
      successfulSolves,
      successRate,
      teamContribution,
      solvesByCategory,
      totalSolves: successfulSolves,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}
