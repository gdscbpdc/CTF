import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  where,
  startAfter,
  getDoc,
  doc,
} from 'firebase/firestore';

import { db } from '@/services/firebase.config';

export async function getLeaderboard(page = 1, itemsPerPage = 10) {
  try {
    let q = query(
      collection(db, 'teams'),
      orderBy('points', 'desc'),
      orderBy('teamName'),
      limit(itemsPerPage)
    );

    if (page > 1) {
      const lastDoc = await getLastDocFromPage(page - 1, itemsPerPage);
      if (lastDoc) {
        q = query(
          collection(db, 'teams'),
          orderBy('points', 'desc'),
          orderBy('teamName'),
          startAfter(lastDoc),
          limit(itemsPerPage)
        );
      }
    }

    const querySnapshot = await getDocs(q);
    const teams = querySnapshot.docs.map((doc, index) => ({
      rank: (page - 1) * itemsPerPage + index + 1,
      id: doc.id,
      ...doc.data(),
    }));

    const totalTeams = (await getDocs(collection(db, 'teams'))).size;

    return {
      teams,
      totalTeams,
      totalPages: Math.ceil(totalTeams / itemsPerPage),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return {
      teams: [],
      totalTeams: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}

async function getLastDocFromPage(page, itemsPerPage) {
  const q = query(
    collection(db, 'teams'),
    orderBy('points', 'desc'),
    orderBy('teamName'),
    limit(page * itemsPerPage)
  );
  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;
  return docs[docs.length - 1];
}

export async function getTopTeams(count = 3) {
  try {
    const q = query(
      collection(db, 'teams'),
      orderBy('points', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc, index) => ({
      rank: index + 1,
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting top teams:', error);
    return [];
  }
}

export async function getTeamRank(teamId) {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (!teamDoc.exists()) {
      return null;
    }
    const teamPoints = teamDoc.data().points;

    const higherPointsQuery = query(
      collection(db, 'teams'),
      where('points', '>', teamPoints)
    );
    const higherPointsCount = (await getDocs(higherPointsQuery)).size;

    const equalPointsQuery = query(
      collection(db, 'teams'),
      where('points', '==', teamPoints),
      where('teamName', '<', teamDoc.data().teamName)
    );
    const equalPointsCount = (await getDocs(equalPointsQuery)).size;

    return higherPointsCount + equalPointsCount + 1;
  } catch (error) {
    console.error('Error getting team rank:', error);
    return null;
  }
}

export async function getTeamStats(teamId) {
  try {
    const solves = await getDocs(
      query(collection(db, 'solves'), where('teamId', '==', teamId))
    );

    const stats = {
      totalSolves: solves.size,
      pointsByCategory: {},
      solvesByCategory: {},
      recentSolves: [],
    };

    const processedSolves = await Promise.all(
      solves.docs.map(async (solve) => {
        const challenge = await db
          .collection('challenges')
          .doc(solve.data().challengeId)
          .get();

        if (challenge.exists) {
          const category = challenge.data().category;
          stats.pointsByCategory[category] =
            (stats.pointsByCategory[category] || 0) + challenge.data().points;
          stats.solvesByCategory[category] =
            (stats.solvesByCategory[category] || 0) + 1;
        }

        return {
          id: solve.id,
          ...solve.data(),
          timestamp: solve.data().timestamp?.toDate(),
        };
      })
    );

    stats.recentSolves = processedSolves
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return stats;
  } catch (error) {
    console.error('Error getting team stats:', error);
    return null;
  }
}
