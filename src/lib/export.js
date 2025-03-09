/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Convert an array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header objects with key and label properties
 * @returns {string} CSV formatted string
 */
export function convertToCSV(data, headers) {
  if (!data || !data.length) return '';

  const headerRow = headers.map((header) => `"${header.label}"`).join(',');

  const rows = data.map((item) => {
    return headers
      .map((header) => {
        const value = item[header.key];

        if (Array.isArray(value)) {
          return `"${value.join(', ')}"`;
        } else if (value && typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return `"${value || ''}"`;
        }
      })
      .join(',');
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * Download data as a CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} fileName - Name of the file to download
 */
export function downloadCSV(csvContent, fileName) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export team data to CSV
 * @param {Array} teams - Array of team objects
 * @param {Array} solveDetails - Array of correct solve details with challenge information
 * @returns {string} CSV formatted string
 */
export function exportTeamsToCSV(teams, solveDetails = {}) {
  const headers = [
    { key: 'teamName', label: 'Team Name' },
    { key: 'points', label: 'Points' },
    { key: 'members', label: 'Team Members' },
    { key: 'memberEmails', label: 'Member Emails' },
    { key: 'solvedChallengesCount', label: 'Challenges Solved Count' },
    { key: 'solvedChallengesList', label: 'Solved Challenges' },
    { key: 'solvedCategoriesCount', label: 'Categories Solved' },
    { key: 'memberCount', label: 'Member Count' },
    { key: 'id', label: 'Team ID' },
    { key: 'createdAt', label: 'Created At' },
  ];

  const processedTeams = teams.map((team) => {
    const teamSolves = solveDetails[team.id] || [];
    const solvedChallengesList = teamSolves
      .map((solve) => solve.challengeTitle)
      .join(', ');

    const categories = new Set(
      teamSolves.map((solve) => solve.challengeCategory)
    );

    let createdAtFormatted = 'N/A';
    if (team.createdAt) {
      try {
        const timestamp =
          typeof team.createdAt.toDate === 'function'
            ? team.createdAt.toDate()
            : new Date(team.createdAt);

        const dubaiTime = new Date(timestamp.getTime() + 4 * 60 * 60 * 1000);

        createdAtFormatted = dubaiTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'UTC',
        });
      } catch (error) {
        console.error('Error formatting createdAt:', error);
      }
    }

    return {
      ...team,
      members: team.members.map((member) => member.name).join(', '),
      memberEmails: team.members.map((member) => member.email).join(', '),
      solvedChallengesCount: team.solvedChallenges?.length || 0,
      solvedChallengesList,
      solvedCategoriesCount: categories.size,
      createdAt: createdAtFormatted,
    };
  });

  return convertToCSV(processedTeams, headers);
}

/**
 * Export detailed team solves data to CSV
 * @param {Array} teams - Array of team objects
 * @param {Object} solveDetails - Object mapping team IDs to their correct solve details
 * @returns {string} CSV formatted string
 */
export function exportDetailedSolvesToCSV(teams, solveDetails) {
  const headers = [
    { key: 'teamName', label: 'Team Name' },
    { key: 'challengeTitle', label: 'Challenge Title' },
    { key: 'challengeCategory', label: 'Challenge Category' },
    { key: 'challengePoints', label: 'Challenge Points' },
    { key: 'solvedAt', label: 'Solved At' },
    { key: 'solvedBy', label: 'Solved By' },
  ];

  const rows = [];

  teams.forEach((team) => {
    const teamSolves = solveDetails[team.id] || [];

    teamSolves.forEach((solve) => {
      let solvedAtFormatted = 'N/A';
      if (solve.timestamp) {
        try {
          const dubaiTime = new Date(
            solve.timestamp.getTime() + 4 * 60 * 60 * 1000
          );

          solvedAtFormatted = dubaiTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'UTC',
          });
        } catch (error) {
          console.error('Error formatting solvedAt:', error);
        }
      }

      rows.push({
        teamName: team.teamName,
        challengeTitle: solve.challengeTitle,
        challengeCategory: solve.challengeCategory,
        challengePoints: solve.points,
        solvedAt: solvedAtFormatted,
        solvedBy: solve.solvedBy || 'Unknown',
      });
    });
  });

  return convertToCSV(rows, headers);
}
